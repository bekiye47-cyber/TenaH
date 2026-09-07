import React from 'react';
import { NavTab } from '../types';
import { Home, Sparkles, BookOpen, Tv, Crown, Settings } from 'lucide-react';
import { triggerHaptic } from '../lib/telegram';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'challenges', label: 'Daily', icon: Sparkles },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'videos', label: 'Videos', icon: Tv },
  { id: 'vip', label: 'VIP', icon: Crown, badge: 'Soon' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D1512]/95 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-800/80 pb-[env(safe-area-inset-bottom,8px)] pt-1 transition-colors">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('selection');
                setActiveTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2 px-2.5 min-w-[50px] min-h-[48px] rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300'
              }`}
            >
              {/* Active pill glow indicator */}
              {isActive && (
                <span className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-400/15 rounded-xl -z-10" />
              )}
              
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[8px] font-bold bg-amber-400 text-stone-950 shadow-xs leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap">
                {tab.label}
              </span>

              {/* Little active dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
