import React, { useState } from 'react';
import { AdminSection } from '../types';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  Trophy, 
  BookOpen, 
  Video, 
  Wallet, 
  Users, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ShieldCheck, 
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  pendingDepositsCount?: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onSwitchToMiniApp?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  pendingDepositsCount = 0,
  isDark,
  onToggleTheme,
  onSwitchToMiniApp,
  children,
}) => {
  const { adminUser, signOut, isLiveSupabase } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'challenges', label: 'Challenges', icon: Trophy },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'deposits', label: 'Deposits', icon: Wallet, badge: pendingDepositsCount },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const handleNavClick = (section: AdminSection) => {
    onSelectSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1D2B24] dark:bg-[#0D1512] dark:text-[#E2EBE6] flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#14221C] border-b border-stone-200 dark:border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            T
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none font-serif-heading">Tena Holistic</h1>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="mobile-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        id="admin-sidebar"
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#14221C] border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight font-serif-heading">Tena Holistic</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">Admin Portal</span>
              </div>
            </div>
          </div>

          <div className="mt-4 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px]">
            <span className="text-stone-500 dark:text-stone-400">Database:</span>
            <span className={`font-semibold flex items-center gap-1 ${isLiveSupabase ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {isLiveSupabase ? 'Supabase Live' : 'Preview Mode'}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-emerald-700'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
          {/* Switch to Mini App button */}
          {onSwitchToMiniApp && (
            <button
              id="switch-to-miniapp-btn"
              onClick={onSwitchToMiniApp}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Preview Telegram Mini App</span>
            </button>
          )}

          {/* User profile & quick controls */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                {adminUser?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate leading-none">{adminUser?.name || 'Admin'}</p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5">{adminUser?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="desktop-theme-toggle"
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                title="Toggle light/dark mode"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                id="admin-logout-btn"
                onClick={signOut}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-[#14221C]/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold capitalize tracking-tight">{currentSection}</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Manage and synchronize Tena Holistic wellness content & user accounts
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchToMiniApp && (
              <button
                id="top-switch-miniapp"
                onClick={onSwitchToMiniApp}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Switch to Mini App View</span>
              </button>
            )}
          </div>
        </header>

        {/* Content body */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
};
