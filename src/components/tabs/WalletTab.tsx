import React, { useState } from 'react';
import { UserProfile, WalletTransaction } from '../../types';
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, FileText, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface WalletTabProps {
  user: UserProfile;
  transactions: WalletTransaction[];
  onOpenDeposit: () => void;
  onAdminApproveDemo?: (txId: string) => Promise<void>;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  user,
  transactions,
  onOpenDeposit,
  onAdminApproveDemo,
}) => {
  const [filter, setFilter] = useState<'all' | 'deposits' | 'purchases'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'deposits') return tx.type === 'deposit';
    if (filter === 'purchases') return tx.type === 'purchase';
    return true;
  });

  const handleApproveClick = async (txId: string) => {
    if (!onAdminApproveDemo) return;
    triggerHaptic('medium');
    setApprovingId(txId);
    try {
      await onAdminApproveDemo(txId);
      triggerHaptic('success');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-200">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-[#0A1410] text-white p-6 shadow-lg shadow-emerald-950/20 border border-emerald-700/40">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              Tena Holistic Balance
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              USD / Credits
            </span>
          </div>

          <div>
            <span className="font-serif-heading font-bold text-3xl sm:text-4xl tracking-tight leading-none text-white">
              ${user.wallet_balance.toFixed(2)}
            </span>
            <p className="text-xs text-emerald-200/70 mt-1">
              Available for daily mindfulness challenges, guides & apothecary books.
            </p>
          </div>

          <div className="pt-2 flex gap-2.5">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenDeposit();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-heading font-bold text-base text-stone-900 dark:text-stone-100">
              Transaction Ledger
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Deposits, book purchases & reward credits.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-0.5 rounded-xl border border-stone-200 dark:border-stone-800">
            {(['all', 'deposits', 'purchases'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic('selection');
                  setFilter(tab);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                  filter === tab
                    ? 'bg-white dark:bg-stone-800 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger List */}
        <div className="space-y-2.5">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const isPurchase = tx.type === 'purchase';
              const isReward = tx.type === 'reward';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Left Icon & Description */}
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                          : isPurchase
                          ? 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                          : 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400'
                      }`}>
                        {isDeposit && <ArrowDownLeft className="w-4 h-4" />}
                        {isPurchase && <ArrowUpRight className="w-4 h-4" />}
                        {isReward && <Sparkles className="w-4 h-4" />}
                      </div>

                      <div>
                        <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 leading-snug">
                          {tx.description || (isDeposit ? 'Manual Wallet Deposit' : 'Wellness Store Purchase')}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                          <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {tx.proof_filename && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-stone-600 dark:text-stone-400">
                                <FileText className="w-2.5 h-2.5" />
                                {tx.proof_filename}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Amount & Status Badge */}
                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-xs sm:text-sm block ${
                        tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-800 dark:text-stone-200'
                      }`}>
                        {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                      </span>

                      {/* Status badge: pending / approved / rejected */}
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        tx.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : tx.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {tx.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                        {tx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{tx.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* If deposit is pending: provide quick info & admin simulation approve button */}
                  {tx.status === 'pending' && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-300/90 bg-amber-50/50 dark:bg-amber-950/20 px-2.5 py-1.5 rounded-xl">
                      <span>Screenshot uploaded. Awaiting admin approval.</span>
                      {onAdminApproveDemo && (
                        <button
                          onClick={() => handleApproveClick(tx.id)}
                          disabled={approvingId === tx.id}
                          className="px-2 py-0.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{approvingId === tx.id ? 'Approving...' : 'Approve (Admin Demo)'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200 dark:border-stone-800 text-center space-y-2">
              <Wallet className="w-8 h-8 mx-auto text-emerald-600/40" />
              <h4 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
                No transactions recorded yet
              </h4>
              <p className="text-xs text-stone-500">
                Submit a deposit above to see your ledger activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
