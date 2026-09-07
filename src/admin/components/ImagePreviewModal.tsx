import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  title = 'Payment Proof Receipt',
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        id="image-preview-dialog"
        className="relative max-w-2xl w-full max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-[#14221C] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <h4 className="text-sm font-semibold truncate text-[#1D2B24] dark:text-[#E2EBE6]">{title}</h4>
          <div className="flex items-center gap-2">
            <a
              id="preview-open-raw"
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg"
              title="Open full resolution"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              id="preview-close-button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex items-center justify-center bg-stone-100/50 dark:bg-black/30 min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
