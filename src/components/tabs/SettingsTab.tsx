import React, { useState } from 'react';
import { UserProfile, NavTab, WalletTransaction } from '../../types';
import { 
  Sun, 
  Moon, 
  Wallet, 
  Receipt,
  Bell, 
  Globe, 
  ChevronRight, 
  Database, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft,
  PlusCircle,
  Clock,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';
import { SettingsModalType } from '../modals/SettingsModal';
import { WalletTab } from './WalletTab';

interface SettingsTabProps {
  user: UserProfile;
  isDark: boolean;
  toggleTheme: () => void;
  setActiveTab: (tab: NavTab) => void;
  onOpenDeposit: () => void;
  onOpenModal: (type: SettingsModalType) => void;
  isTelegram: boolean;
  transactions: WalletTransaction[];
  onAdminApproveDemo?: (txId: string) => Promise<void>;
  onOpenAdmin?: () => void;
}

type SettingsSubPage = 'main' | 'wallet' | 'transactions';

export const SettingsTab: React.FC<SettingsTabProps> = ({
  user,
  isDark,
  toggleTheme,
  setActiveTab,
  onOpenDeposit,
  onOpenModal,
  isTelegram,
  transactions,
  onAdminApproveDemo,
  onOpenAdmin,
}) => {
  const [subPage, setSubPage] = useState<SettingsSubPage>('main');
  const [txFilter, setTxFilter] = useState<'all' | 'deposits' | 'purchases' | 'rewards'>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'deposits') return tx.type === 'deposit';
    if (txFilter === 'purchases') return tx.type === 'purchase';
    if (txFilter === 'rewards') return tx.type === 'reward';
    return true;
  });

  // SUB-PAGE: DEDICATED WALLET PAGE
  if (subPage === 'wallet') {
    return (
      <div className="space-y-4 pb-8 animate-in fade-in duration-200">
        {/* Sub-page navigation bar */}
        <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              setSubPage('main');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Settings</span>
          </button>
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
            My Wallet
          </span>
        </div>

        {/* Render full wallet tab with deposit and transaction shortcuts */}
        <WalletTab
          user={user}
          transactions={transactions}
          onOpenDeposit={onOpenDeposit}
          onAdminApproveDemo={onAdminApproveDemo}
        />

        {/* Direct Link to Transaction Ledger */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setSubPage('transactions');
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span>Open Complete Transaction Ledger</span>
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // SUB-PAGE: DEDICATED TRANSACTION LEDGER PAGE
  if (subPage === 'transactions') {
    return (
      <div className="space-y-4 pb-8 animate-in fade-in duration-200">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
          <button
            onClick={() => {
              triggerHaptic('light');
              setSubPage('main');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Settings</span>
          </button>
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
            Transaction Ledger
          </span>
        </div>

        {/* Ledger Header Summary */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-500 dark:text-stone-400 block">
              Total Recorded Transactions
            </span>
            <span className="font-serif-heading font-bold text-xl text-stone-900 dark:text-stone-100">
              {transactions.length} Records
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenDeposit();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'deposits', 'purchases', 'rewards'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => {
                triggerHaptic('selection');
                setTxFilter(filterKey);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                txFilter === filterKey
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-2.5">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isPositive = tx.type === 'deposit' || tx.type === 'reward';
              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'deposit'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                          : tx.type === 'reward'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                          : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === 'reward' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 capitalize truncate">
                          {tx.description || tx.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span
                          className={`font-semibold capitalize ${
                            tx.status === 'approved'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : tx.status === 'pending'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-red-500'
                          }`}
                        >
                          {tx.status}
                        </span>
                        {tx.proof_url && (
                          <>
                            <span>&bull;</span>
                            <a
                              href={tx.proof_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Slip</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-xs ${
                        isPositive
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {tx.currency === 'ETB' ? `${tx.amount} Birr` : `$${tx.amount.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200 dark:border-stone-800 text-center space-y-2">
              <Receipt className="w-8 h-8 mx-auto text-stone-400" />
              <p className="text-xs text-stone-500">No transactions recorded under this category.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SUB-PAGE: MAIN SETTINGS
  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="font-serif-heading font-bold text-xl text-stone-900 dark:text-stone-100">
          Account & App Settings
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          Manage your wellness preferences, appearance, wallet, and ledger.
        </p>
      </div>

      {/* Telegram User Identity Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-serif-heading font-bold text-lg flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 leading-tight">
              {user.name}
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
              {user.username ? `@${user.username}` : `ID: ${user.telegram_id}`}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{isTelegram ? 'Connected via Telegram WebApp' : 'Telegram WebApp Active'}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic('selection');
            onOpenModal('schema');
          }}
          className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          title="Supabase Schema & Environment Info"
        >
          <Database className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Theme Toggle Block (Light & Dark Mode) */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100">
              Appearance Theme
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Switch between Light Oasis and Deep Night modes.
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            {isDark ? 'Deep Night' : 'Light Oasis'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (isDark) {
                triggerHaptic('medium');
                toggleTheme();
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              !isDark
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Oasis</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isDark) {
                triggerHaptic('medium');
                toggleTheme();
              }
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isDark
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100 font-bold shadow-xs'
                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
            }`}
          >
            <Moon className="w-4 h-4 text-emerald-400" />
            <span>Deep Night</span>
          </button>
        </div>
      </div>

      {/* 2. PROMINENT DEDICATED BUTTONS FOR WALLET & TRANSACTIONS (AS REQUESTED) */}
      <div className="space-y-2.5">
        <h4 className="font-semibold text-xs text-stone-800 dark:text-stone-200 px-1">
          Financial & Balance Operations
        </h4>

        {/* Button 1: Wallet & Deposits Dedicated Page */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setSubPage('wallet');
          }}
          className="w-full p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/60 transition-all text-left shadow-xs flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  My Wallet & Deposit
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  ${user.wallet_balance.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Manage balance, deposit in USD or Birr (ETB)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Button 2: Transaction Ledger Dedicated Page */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setSubPage('transactions');
          }}
          className="w-full p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/60 transition-all text-left shadow-xs flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Transaction History & Ledger
                </span>
                <span className="text-[10px] text-stone-400 font-medium">
                  ({transactions.length} entries)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Deposit slips, verification status, and purchases
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 3. General Preferences */}
      <div className="rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs divide-y divide-stone-100 dark:divide-stone-800/80">
        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenModal('notifications');
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-xs text-stone-900 dark:text-stone-100 block">
                Notifications
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Reminders for challenges and deposit approvals
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenModal('language');
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-xs text-stone-900 dark:text-stone-100 block">
                Language & Region
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                English (Default) &bull; አማርኛ (Amharic)
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            onOpenModal('schema');
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-900/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-stone-700 dark:text-stone-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-xs text-stone-900 dark:text-stone-100 block">
                Security & Supabase Schema
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                RLS policies, SQL tables, and storage buckets
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        {/* Dedicated Admin Portal Web App Switcher */}
        {onOpenAdmin && (
          <button
            id="settings-open-admin-btn"
            onClick={() => {
              triggerHaptic('medium');
              onOpenAdmin();
            }}
            className="w-full p-3.5 flex items-center justify-between bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <span>Open Admin Portal Web App</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                    ADMIN
                  </span>
                </span>
                <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                  Manage challenges, books, videos, approve deposits & users
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </button>
        )}
      </div>
    </div>
  );
};
