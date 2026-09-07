import React, { useState } from 'react';
import { X, Bell, Globe, HelpCircle, LogOut, Check, Database, MessageSquare } from 'lucide-react';
import { triggerHaptic, openTelegramLink } from '../../lib/telegram';
import { SUPABASE_TABLES, isSupabaseConfigured } from '../../lib/supabaseConfig';

export type SettingsModalType = 'notifications' | 'language' | 'support' | 'logout' | 'schema' | null;

interface SettingsModalProps {
  type: SettingsModalType;
  onClose: () => void;
  onResetUser?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ type, onClose, onResetUser }) => {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [selectedLang, setSelectedLang] = useState('en');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#121B17] rounded-2xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-2">
            {type === 'notifications' && <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {type === 'language' && <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {type === 'support' && <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {type === 'logout' && <LogOut className="w-4 h-4 text-rose-500" />}
            {type === 'schema' && <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 capitalize">
              {type === 'notifications' && 'Notification Preferences'}
              {type === 'language' && 'Language Selection'}
              {type === 'support' && 'Contact Support & Feedback'}
              {type === 'logout' && 'Switch / Reset Profile'}
              {type === 'schema' && 'Supabase Integration Schema'}
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs text-stone-700 dark:text-stone-300">
          {/* Notifications Modal */}
          {type === 'notifications' && (
            <div className="space-y-4">
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Configure your daily mindfulness reminders and Telegram bot alerts for new challenges.
              </p>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 cursor-pointer">
                  <span className="font-medium text-stone-900 dark:text-stone-100">Daily Challenge Morning Alert</span>
                  <input
                    type="checkbox"
                    checked={notifEnabled}
                    onChange={(e) => setNotifEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 cursor-pointer">
                  <span className="font-medium text-stone-900 dark:text-stone-100">Wallet Deposit Approved Alerts</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 cursor-pointer">
                  <span className="font-medium text-stone-900 dark:text-stone-100">Evening Wind-Down Prompt (9:00 PM)</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                </label>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('success');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors mt-2"
              >
                Save Preferences
              </button>
            </div>
          )}

          {/* Language Modal */}
          {type === 'language' && (
            <div className="space-y-3">
              <p className="text-stone-600 dark:text-stone-400">
                Choose your preferred interface and wellness content language:
              </p>
              <div className="space-y-1.5">
                {[
                  { code: 'en', label: 'English (Default)', native: 'English' },
                  { code: 'am', label: 'Amharic (አማርኛ)', native: 'አማርኛ' },
                  { code: 'om', label: 'Afaan Oromoo', native: 'Oromoo' },
                  { code: 'fr', label: 'French (Français)', native: 'Français' },
                  { code: 'ar', label: 'Arabic (العربية)', native: 'العربية' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedLang(lang.code);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      selectedLang === lang.code
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 hover:border-emerald-500/40'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {selectedLang === lang.code && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  triggerHaptic('success');
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors mt-2"
              >
                Apply Language
              </button>
            </div>
          )}

          {/* Support Modal */}
          {type === 'support' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20 text-xs">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200 block mb-1">
                  Telegram Direct Concierge
                </span>
                <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed mb-2">
                  Our holistic guides and customer support team are available on Telegram 24/7.
                </p>
                <button
                  onClick={() => openTelegramLink('https://t.me/tena_support')}
                  className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open @tena_support in Telegram</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Or Send Us an In-App Feedback Message:
                </label>
                {feedbackSent ? (
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 rounded-xl text-center">
                    Thank you! Your feedback has been transmitted to our team.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your experience, feature ideas, or ask a question..."
                      className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs selectable-text"
                    />
                    <button
                      onClick={() => {
                        if (!feedbackText.trim()) return;
                        triggerHaptic('success');
                        setFeedbackSent(true);
                      }}
                      className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold transition-colors"
                    >
                      Send Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout / Switch Profile Modal */}
          {type === 'logout' && (
            <div className="space-y-4">
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                In Telegram Mini Apps, authentication is automatically tied to your active Telegram account. You can reset cached local mini app state or switch preview profile here.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerHaptic('warning');
                    if (onResetUser) onResetUser();
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                >
                  Reset Local Cache
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Schema & Supabase Config Modal */}
          {type === 'schema' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <span className="font-semibold text-stone-900 dark:text-stone-100">Live Supabase Connection</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {isSupabaseConfigured ? 'Connected' : 'Simulated Store (Ready for Keys)'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                Configured tables in <code className="bg-stone-100 dark:bg-stone-900 px-1 py-0.5 rounded">src/lib/supabaseConfig.ts</code>:
              </p>
              <div className="bg-stone-900 text-emerald-300 p-3 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto selectable-text">
                <div>USERS: "{SUPABASE_TABLES.USERS}" (telegram_id, name, username, photo_url, wallet_balance, theme)</div>
                <div>CHALLENGES: "{SUPABASE_TABLES.CHALLENGES}" (id, title, description, is_paid, price)</div>
                <div>USER_CHALLENGES: "{SUPABASE_TABLES.USER_CHALLENGES}" (user_telegram_id, challenge_id)</div>
                <div>BOOKS: "{SUPABASE_TABLES.BOOKS}" (id, title, author, cover_url, price, is_paid)</div>
                <div>PURCHASES: "{SUPABASE_TABLES.PURCHASES}" (user_telegram_id, item_type, item_id, amount)</div>
                <div>VIDEOS: "{SUPABASE_TABLES.VIDEOS}" (id, title, youtube_url, category)</div>
                <div>WALLET_TRANSACTIONS: "{SUPABASE_TABLES.WALLET_TRANSACTIONS}" (user_telegram_id, amount, status, proof_url)</div>
                <div>STORAGE BUCKET: "{SUPABASE_TABLES.STORAGE_BUCKET}"</div>
              </div>
              <p className="text-[10px] text-stone-500">
                Add <code className="font-semibold">VITE_SUPABASE_URL</code> and <code className="font-semibold">VITE_SUPABASE_ANON_KEY</code> to your environment variables anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
