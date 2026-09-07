import React, { useState, useEffect } from 'react';
import { AdminDeposit } from '../types';
import { adminService } from '../services/adminSupabase';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wallet, 
  Search, 
  ExternalLink, 
  Eye, 
  RefreshCw,
  FileText,
  User,
  AlertCircle
} from 'lucide-react';

interface DepositsSectionProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  onUpdatePendingCount?: (count: number) => void;
}

export const DepositsSection: React.FC<DepositsSectionProps> = ({ 
  onNotify,
  onUpdatePendingCount 
}) => {
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState<string>('');

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Decision action modal
  const [actionTarget, setActionTarget] = useState<AdminDeposit | null>(null);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchDeposits = async (filter = statusFilter) => {
    setLoading(true);
    try {
      const data = await adminService.getDeposits(filter);
      setDeposits(data);

      // Also compute pending count for sidebar badge
      if (filter !== 'pending') {
        const pendingList = await adminService.getDeposits('pending');
        onUpdatePendingCount?.(pendingList.length);
      } else {
        onUpdatePendingCount?.(data.length);
      }
    } catch (err: any) {
      onNotify('error', 'Failed to load deposits', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits(statusFilter);
  }, [statusFilter]);

  const handleOpenDecision = (tx: AdminDeposit, decision: 'approved' | 'rejected') => {
    setActionTarget(tx);
    setActionType(decision);
    setAdminNote(
      decision === 'approved' 
        ? 'Payment verified with bank statement' 
        : 'Payment screenshot illegible or transaction ID not found'
    );
  };

  const handleExecuteDecision = async () => {
    if (!actionTarget || !actionType) return;

    setIsProcessing(true);
    try {
      if (actionType === 'approved') {
        const res = await adminService.approveDeposit(actionTarget.id, adminNote);
        onNotify('success', 'Deposit Approved', res.message);
      } else {
        const res = await adminService.rejectDeposit(actionTarget.id, adminNote);
        onNotify('info', 'Deposit Rejected', res.message);
      }

      setActionTarget(null);
      setActionType(null);
      await fetchDeposits(statusFilter);
    } catch (err: any) {
      onNotify('error', 'Action failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = deposits.filter((tx) => {
    const term = search.toLowerCase();
    const userName = tx.user?.name?.toLowerCase() || '';
    const userTg = tx.user_telegram_id.toString();
    const desc = tx.description?.toLowerCase() || '';
    return userName.includes(term) || userTg.includes(term) || desc.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif-heading tracking-tight">Deposit Approvals & Wallet Credits</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Verify payment proof screenshots and atomically credit user balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="refresh-deposits-btn"
            onClick={() => fetchDeposits(statusFilter)}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 p-2 rounded-2xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                id={`filter-deposit-${tab}`}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {tab === 'pending' ? 'Pending Review' : tab}
              </button>
            );
          })}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="deposit-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or TG ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 text-[#1D2B24] dark:text-[#E2EBE6] focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 dark:bg-stone-900/40 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Payment Proof</th>
                <th className="px-4 py-3.5">Submitted Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    <span className="inline-block animate-spin mr-2">●</span> Loading deposits...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-stone-400">
                    No {statusFilter === 'all' ? '' : statusFilter} deposits found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isPending = tx.status === 'pending';
                  const isApproved = tx.status === 'approved';
                  const isRejected = tx.status === 'rejected';

                  return (
                    <tr key={tx.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      {/* User Info */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0">
                            {tx.user?.photo_url ? (
                              <img src={tx.user.photo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold">
                                {tx.user?.name?.[0] || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#1D2B24] dark:text-[#E2EBE6]">
                              {tx.user?.name || `Telegram User`}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                              ID: {tx.user_telegram_id} {tx.user?.username && `@${tx.user.username}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount Requested */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-bold text-sm text-emerald-700 dark:text-emerald-400">
                          +${tx.amount.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-stone-400 uppercase font-mono">
                          {tx.currency || 'USD'}
                        </span>
                      </td>

                      {/* Payment Proof (Click to enlarge) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {tx.proof_url ? (
                          <button
                            id={`view-proof-${tx.id}`}
                            onClick={() => {
                              setPreviewImage(tx.proof_url || null);
                              setPreviewTitle(`Payment Slip — ${tx.user?.name || tx.user_telegram_id}`);
                            }}
                            className="group flex items-center gap-2 p-1 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-emerald-500 bg-stone-50 dark:bg-stone-900/40 text-left transition-colors"
                          >
                            <div className="w-9 h-9 rounded-md overflow-hidden bg-stone-200 shrink-0">
                              <img src={tx.proof_url} alt="Proof" className="w-full h-full object-cover" />
                            </div>
                            <div className="pr-2">
                              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                                <span>Inspect Proof</span>
                                <Eye className="w-3 h-3" />
                              </p>
                              <p className="text-[10px] text-stone-400 truncate max-w-[120px]">
                                {tx.proof_filename || 'receipt.jpg'}
                              </p>
                            </div>
                          </button>
                        ) : (
                          <span className="text-stone-400 italic text-[11px]">No proof uploaded</span>
                        )}
                      </td>

                      {/* Submitted date */}
                      <td className="px-4 py-4 whitespace-nowrap text-stone-600 dark:text-stone-300">
                        <div>{new Date(tx.created_at).toLocaleDateString()}</div>
                        <div className="text-[10px] text-stone-400">
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            <span>Rejected</span>
                          </span>
                        )}
                        {tx.admin_note && (
                          <p className="text-[10px] text-stone-400 mt-1 line-clamp-1 italic max-w-[140px]">
                            "{tx.admin_note}"
                          </p>
                        )}
                      </td>

                      {/* Actions: Approve & Reject per row */}
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`btn-approve-${tx.id}`}
                              onClick={() => handleOpenDecision(tx, 'approved')}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              id={`btn-reject-${tx.id}`}
                              onClick={() => handleOpenDecision(tx, 'rejected')}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Dialog Modal (Approve or Reject with optional note) */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div 
            id="deposit-decision-modal"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 shadow-2xl p-6 text-[#1D2B24] dark:text-[#E2EBE6]"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${actionType === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                {actionType === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-base font-serif-heading">
                  {actionType === 'approved' ? 'Approve Deposit' : 'Reject Deposit'}
                </h3>
                <p className="text-xs text-stone-500">
                  Transaction #{actionTarget.id.substring(0, 8)} • User {actionTarget.user?.name || actionTarget.user_telegram_id}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Deposit Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${actionTarget.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">User Wallet Balance:</span>
                <span className="font-semibold">${(actionTarget.user?.wallet_balance || 0).toFixed(2)}</span>
              </div>
              {actionType === 'approved' && (
                <div className="flex justify-between pt-1 border-t border-stone-200 dark:border-stone-700">
                  <span className="text-stone-500">New Balance after approval:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    ${((actionTarget.user?.wallet_balance || 0) + actionTarget.amount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1">
                Admin Note {actionType === 'rejected' ? '(Reason for rejection)' : '(Optional)'}
              </label>
              <textarea
                id="deposit-admin-note-input"
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Enter audit comment..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/40 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setActionTarget(null); setActionType(null); }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-deposit-action"
                type="button"
                onClick={handleExecuteDecision}
                disabled={isProcessing}
                className={`px-4 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-colors flex items-center gap-2 ${
                  actionType === 'approved' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessing && <span className="animate-spin text-xs">●</span>}
                <span>{actionType === 'approved' ? 'Confirm & Credit Balance' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={Boolean(previewImage)}
        imageUrl={previewImage}
        title={previewTitle}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};
