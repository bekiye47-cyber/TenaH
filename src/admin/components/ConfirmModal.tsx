import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemName,
  confirmLabel = 'Delete',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        id="confirm-modal-box"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 p-6 shadow-2xl text-[#1D2B24] dark:text-[#E2EBE6]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`p-3 rounded-xl shrink-0 ${isDestructive ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <button
            id="close-confirm-modal"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {message}
          </p>
          {itemName && (
            <div className="mt-3 p-2.5 rounded-lg bg-stone-100 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs font-mono font-medium text-stone-800 dark:text-stone-200 truncate">
              {itemName}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-confirm"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-execute-confirm"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-colors flex items-center gap-2 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isLoading && <span className="animate-spin text-xs">●</span>}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
