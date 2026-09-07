import React from 'react';
import { UserProfile, NavTab } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { ShieldCheck } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDark?: boolean;
  toggleTheme?: () => void;
  isTelegram?: boolean;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  setActiveTab,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-white/95 dark:bg-[#0D1512]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('home');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-200">
            {/* Custom Wellness Leaf SVG */}
            <svg 
              className="w-5 h-5" 
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
          <div>
            <span className="font-serif-heading font-semibold text-lg tracking-tight text-stone-900 dark:text-stone-100 leading-none">
              Tena Holistic
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              Mind, Body & Spirit
            </p>
          </div>
        </div>

        {/* Header Right: Admin Portal link & User Profile Avatar */}
        <div className="flex items-center gap-2">
          {onOpenAdmin && (
            <button
              id="header-admin-portal-btn"
              onClick={() => {
                triggerHaptic('selection');
                onOpenAdmin();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              title="Admin Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            onClick={() => {
              triggerHaptic('selection');
              setActiveTab('settings');
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/40 transition-all cursor-pointer"
            title="Settings & Profile"
          >
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-emerald-300 dark:border-emerald-700"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-medium text-xs flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
