import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, UserProfile, Challenge, Book, Video, WalletTransaction, AppTheme } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeTab } from './components/tabs/HomeTab';
import { ChallengesTab } from './components/tabs/ChallengesTab';
import { BooksTab } from './components/tabs/BooksTab';
import { VideosTab } from './components/tabs/VideosTab';
import { VipTab } from './components/tabs/VipTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { BookReaderModal } from './components/modals/BookReaderModal';
import { VideoPlayerModal } from './components/modals/VideoPlayerModal';
import { DepositModal } from './components/modals/DepositModal';
import { SettingsModal, SettingsModalType } from './components/modals/SettingsModal';

import { 
  getTelegramUser, 
  getRawInitData, 
  sendInitDataToBackend, 
  initializeTelegramWebApp, 
  syncTelegramHeaderColor, 
  isRunningInTelegram 
} from './lib/telegram';
import { userService } from './services/userService';
import { challengeService } from './services/challengeService';
import { bookService } from './services/bookService';
import { videoService } from './services/videoService';
import { walletService } from './services/walletService';
import { Loader2 } from 'lucide-react';
import AdminApp from './admin/AdminApp';

export default function App() {
  const [appView, setAppView] = useState<'miniapp' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (
        params.get('mode') === 'admin' ||
        params.get('view') === 'admin' ||
        window.location.hash === '#admin' ||
        window.location.pathname.startsWith('/admin')
      ) {
        return 'admin';
      }
    }
    return 'miniapp';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Modals state
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [settingsModal, setSettingsModal] = useState<SettingsModalType>(null);

  // Check initial theme from localStorage (defaults to crisp light mode)
  useEffect(() => {
    const savedTheme = localStorage.getItem('tena_app_theme') as AppTheme;
    // Default to clean light mode unless user previously explicitly selected dark
    const shouldBeDark = savedTheme === 'dark';

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    syncTelegramHeaderColor(shouldBeDark);
  }, []);

  // Theme toggle action: syncs to localStorage and Supabase users table
  const toggleTheme = useCallback(async () => {
    const nextDark = !isDark;
    const themeStr: AppTheme = nextDark ? 'dark' : 'light';
    setIsDark(nextDark);
    localStorage.setItem('tena_app_theme', themeStr);

    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    syncTelegramHeaderColor(nextDark);

    if (user) {
      setUser((prev) => (prev ? { ...prev, theme: themeStr } : null));
      await userService.updateTheme(user.telegram_id, themeStr);
    }
  }, [isDark, user]);

  // Main startup lifecycle: Telegram Auth & Supabase upsert
  const initApp = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Initialize Telegram Mini App SDK
      initializeTelegramWebApp();

      // 2. Read Telegram profile from window.Telegram.WebApp.initDataUnsafe.user
      const tgUser = getTelegramUser();

      // 3. Capture raw window.Telegram.WebApp.initData string and dispatch to Supabase Edge Function for verification
      const rawInitData = getRawInitData();
      if (rawInitData) {
        sendInitDataToBackend(rawInitData).catch((e) =>
          console.debug('Backend verification log:', e)
        );
      }

      // 4. Upsert user into Supabase "users" table keyed by telegram_id
      const userProfile = await userService.upsertUser(tgUser, rawInitData);
      setUser(userProfile);

      // Apply synced theme from Supabase if available
      if (userProfile.theme) {
        const isUserDark = userProfile.theme === 'dark';
        setIsDark(isUserDark);
        if (isUserDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        syncTelegramHeaderColor(isUserDark);
      }

      // 5. Load Challenges, Books, Videos & Transactions in parallel
      const [fetchedChallenges, fetchedBooks, fetchedVideos, fetchedTx] = await Promise.all([
        challengeService.getChallenges(userProfile.telegram_id),
        bookService.getBooks(userProfile.telegram_id),
        videoService.getVideos(),
        walletService.getTransactions(userProfile.telegram_id),
      ]);

      setChallenges(fetchedChallenges);
      setBooks(fetchedBooks);
      setVideos(fetchedVideos);
      setTransactions(fetchedTx);
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Challenge Actions
  const handleCompleteChallenge = async (challengeId: string) => {
    if (!user) return;
    await challengeService.completeChallenge(user.telegram_id, challengeId);
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, completed: true } : c))
    );
  };

  const handleUnlockChallenge = async (challenge: Challenge) => {
    if (!user) return;
    const result = await challengeService.unlockChallenge(user.telegram_id, challenge, user.wallet_balance);
    if (result.success) {
      setUser((prev) => (prev ? { ...prev, wallet_balance: result.newBalance } : null));
      setChallenges((prev) =>
        prev.map((c) => (c.id === challenge.id ? { ...c, is_owned: true } : c))
      );
      // Refresh ledger
      const updatedTx = await walletService.getTransactions(user.telegram_id);
      setTransactions(updatedTx);
    } else {
      throw new Error(result.error);
    }
  };

  // Book Purchase Action
  const handlePurchaseBook = async (book: Book) => {
    if (!user) return;
    const result = await bookService.purchaseBook(user.telegram_id, book, user.wallet_balance);
    if (result.success) {
      setUser((prev) => (prev ? { ...prev, wallet_balance: result.newBalance } : null));
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, is_owned: true } : b))
      );
      // Refresh ledger
      const updatedTx = await walletService.getTransactions(user.telegram_id);
      setTransactions(updatedTx);
      // Open book reader
      setSelectedBook({ ...book, is_owned: true });
    } else {
      throw new Error(result.error);
    }
  };

  // Wallet Deposit Completed
  const handleDepositSuccess = (newTx: WalletTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Admin Simulation: Approve Deposit Demo
  const handleAdminApproveDemo = async (txId: string) => {
    if (!user) return;
    const res = await walletService.simulateAdminApproval(user.telegram_id, txId, user.wallet_balance);
    if (res.success) {
      setUser((prev) => (prev ? { ...prev, wallet_balance: res.newBalance } : null));
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: 'approved' } : t))
      );
    }
  };

  // Reset demo user
  const handleResetUser = () => {
    localStorage.removeItem('tena_holistic_user_profile');
    localStorage.removeItem('tena_completed_challenges');
    localStorage.removeItem('tena_purchased_challenges');
    localStorage.removeItem('tena_purchased_books');
    localStorage.removeItem('tena_wallet_transactions');
    initApp();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#0D1512] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-lg animate-pulse">
          <svg 
            className="w-9 h-9" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2A7 7 0 0 1 11 20z" />
            <path d="m2 21 7-7" />
          </svg>
        </div>
        <div className="space-y-1">
          <h1 className="font-serif-heading font-bold text-xl text-stone-900 dark:text-stone-100">
            Tena Holistic
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Connecting to Telegram & Supabase...
          </p>
        </div>
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // Standalone Admin Panel View
  if (appView === 'admin') {
    return (
      <AdminApp
        onSwitchToMiniApp={() => {
          setAppView('miniapp');
          if (window.location.hash === '#admin') {
            window.location.hash = '';
          }
        }}
      />
    );
  }

  const todayChallenge = challenges[0] || null;

  return (
    <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#0D1512] text-[#1D2B24] dark:text-[#E2EBE6] flex flex-col antialiased transition-colors duration-200">
      {/* Top Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => {
          setAppView('admin');
          window.location.hash = '#admin';
        }}
      />

      {/* Main Tab Views */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-20">
        {activeTab === 'home' && (
          <HomeTab
            user={user}
            todayChallenge={todayChallenge}
            books={books}
            videos={videos}
            setActiveTab={setActiveTab}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onCompleteChallenge={handleCompleteChallenge}
            onSelectBook={(book) => setSelectedBook(book)}
            onSelectVideo={(video) => setSelectedVideo(video)}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesTab
            challenges={challenges}
            user={user}
            onComplete={handleCompleteChallenge}
            onUnlock={handleUnlockChallenge}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />
        )}

        {activeTab === 'books' && (
          <BooksTab
            books={books}
            user={user}
            onSelectBook={(book) => setSelectedBook(book)}
            onPurchaseBook={handlePurchaseBook}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />
        )}

        {activeTab === 'videos' && (
          <VideosTab
            videos={videos}
            onSelectVideo={(video) => setSelectedVideo(video)}
          />
        )}

        {activeTab === 'vip' && (
          <VipTab />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            user={user}
            isDark={isDark}
            toggleTheme={toggleTheme}
            setActiveTab={setActiveTab}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenModal={(type) => setSettingsModal(type)}
            isTelegram={isRunningInTelegram()}
            transactions={transactions}
            onAdminApproveDemo={handleAdminApproveDemo}
            onOpenAdmin={() => {
              setAppView('admin');
              window.location.hash = '#admin';
            }}
          />
        )}
      </main>

      {/* Bottom Navigation for all 6 tabs */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <BookReaderModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />

      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        telegramId={user.telegram_id}
        onSuccess={handleDepositSuccess}
      />

      <SettingsModal
        type={settingsModal}
        onClose={() => setSettingsModal(null)}
        onResetUser={handleResetUser}
      />
    </div>
  );
}
