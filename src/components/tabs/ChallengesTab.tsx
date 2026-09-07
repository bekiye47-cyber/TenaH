import React, { useState } from 'react';
import { Challenge, UserProfile } from '../../types';
import { CheckCircle2, Lock, Unlock, Clock, Sparkles, AlertCircle, Filter } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface ChallengesTabProps {
  challenges: Challenge[];
  user: UserProfile;
  onComplete: (id: string) => void;
  onUnlock: (challenge: Challenge) => Promise<void>;
  onOpenDeposit: () => void;
}

export const ChallengesTab: React.FC<ChallengesTabProps> = ({
  challenges,
  user,
  onComplete,
  onUnlock,
  onOpenDeposit,
}) => {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const filteredChallenges = challenges.filter((ch) => {
    if (filter === 'free' && ch.is_paid) return false;
    if (filter === 'paid' && !ch.is_paid) return false;
    if (filter === 'completed' && !ch.completed) return false;
    if (categoryFilter !== 'all' && ch.category !== categoryFilter) return false;
    return true;
  });

  const handleUnlockClick = async (challenge: Challenge) => {
    setUnlockError(null);
    if (user.wallet_balance < challenge.price) {
      triggerHaptic('warning');
      setUnlockError(`You need $${challenge.price.toFixed(2)} to unlock this challenge. Your current balance is $${user.wallet_balance.toFixed(2)}.`);
      return;
    }

    triggerHaptic('medium');
    setUnlockingId(challenge.id);
    try {
      await onUnlock(challenge);
    } catch (err: any) {
      setUnlockError(err.message || 'Failed to unlock challenge.');
    } finally {
      setUnlockingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Title & Intro */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif-heading font-bold text-xl text-stone-900 dark:text-stone-100">
            Daily Wellness Challenges
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Cultivate holistic presence, biological vitality, and inner stillness.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block">Completed Today</span>
          <span className="font-serif-heading font-bold text-sm text-emerald-700 dark:text-emerald-400">
            {challenges.filter((c) => c.completed).length} of {challenges.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Challenges' },
          { id: 'free', label: 'Free' },
          { id: 'paid', label: 'Premium' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic('selection');
              setFilter(tab.id as any);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unlock Error Notification with Quick Deposit Button */}
      {unlockError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{unlockError}</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenDeposit();
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] shrink-0 transition-colors"
          >
            Deposit Now
          </button>
        </div>
      )}

      {/* Challenge Cards List */}
      <div className="space-y-3">
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((ch) => {
            const isLocked = ch.is_paid && !ch.is_owned;

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  ch.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                    : isLocked
                    ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-95'
                    : 'bg-white dark:bg-[#121B17] border-stone-200/80 dark:border-stone-800 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        {ch.category}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {ch.duration_minutes} min
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ch.is_paid
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                      }`}>
                        {ch.is_paid ? `Paid • $${ch.price.toFixed(2)}` : 'Free'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 leading-snug">
                      {ch.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>

                  {/* Right Status Icon */}
                  <div className="shrink-0 pt-1">
                    {ch.completed ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : isLocked ? (
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                    +{ch.reward_points} Vitality Points
                  </span>

                  {ch.completed ? (
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Challenge Completed</span>
                    </span>
                  ) : isLocked ? (
                    <button
                      onClick={() => handleUnlockClick(ch)}
                      disabled={unlockingId === ch.id}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{unlockingId === ch.id ? 'Unlocking...' : `Unlock for $${ch.price.toFixed(2)}`}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        triggerHaptic('success');
                        onComplete(ch.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200 dark:border-stone-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-emerald-600/50" />
            <h4 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
              No challenges yet today
            </h4>
            <p className="text-xs text-stone-500">
              Check back shortly or reset your filters above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
