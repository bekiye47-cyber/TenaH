import React, { useState, useEffect } from 'react';
import { AdminSection, ToastMessage } from './types';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/AdminLayout';
import { ToastContainer } from './components/Toast';
import { ChallengesSection } from './pages/ChallengesSection';
import { BooksSection } from './pages/BooksSection';
import { VideosSection } from './pages/VideosSection';
import { DepositsSection } from './pages/DepositsSection';
import { UsersSection } from './pages/UsersSection';

interface AdminAppProps {
  onSwitchToMiniApp?: () => void;
}

const AdminAppContent: React.FC<AdminAppProps> = ({ onSwitchToMiniApp }) => {
  const { adminUser, isLoading } = useAdminAuth();
  const [currentSection, setCurrentSection] = useState<AdminSection>('challenges');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pendingDepositsCount, setPendingDepositsCount] = useState<number>(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('tena_admin_theme') === 'dark';
  });

  const notify = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { id, type, title, description };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tena_admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tena_admin_theme', 'light');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] dark:bg-[#0D1512] flex items-center justify-center font-sans text-stone-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg animate-pulse">
            T
          </div>
          <p className="text-xs font-semibold">Verifying Administrator Access...</p>
        </div>
      </div>
    );
  }

  // Not logged in or not admin -> show login page
  if (!adminUser) {
    return (
      <>
        <LoginPage onSwitchToMiniApp={onSwitchToMiniApp} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <AdminLayout
      currentSection={currentSection}
      onSelectSection={setCurrentSection}
      pendingDepositsCount={pendingDepositsCount}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      onSwitchToMiniApp={onSwitchToMiniApp}
    >
      {currentSection === 'challenges' && <ChallengesSection onNotify={notify} />}
      {currentSection === 'books' && <BooksSection onNotify={notify} />}
      {currentSection === 'videos' && <VideosSection onNotify={notify} />}
      {currentSection === 'deposits' && (
        <DepositsSection 
          onNotify={notify} 
          onUpdatePendingCount={setPendingDepositsCount} 
        />
      )}
      {currentSection === 'users' && <UsersSection onNotify={notify} />}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AdminLayout>
  );
};

export const AdminApp: React.FC<AdminAppProps> = ({ onSwitchToMiniApp }) => {
  return (
    <AdminAuthProvider>
      <AdminAppContent onSwitchToMiniApp={onSwitchToMiniApp} />
    </AdminAuthProvider>
  );
};

export default AdminApp;
