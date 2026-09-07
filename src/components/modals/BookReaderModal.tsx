import React from 'react';
import { Book } from '../../types';
import { X, BookOpen, Clock, Layers, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface BookReaderModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg max-h-[88vh] bg-white dark:bg-[#121B17] rounded-2xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/40">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
            <BookOpen className="w-4 h-4" />
            <span>Tena Holistic Reader</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Reader View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 selectable-text">
          {/* Book Info Top Banner */}
          <div className="flex gap-4 items-start pb-4 border-b border-stone-100 dark:border-stone-800/80">
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-md shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {book.category}
              </span>
              <h3 className="font-serif-heading font-bold text-lg leading-snug text-stone-900 dark:text-stone-50">
                {book.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                By {book.author}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {book.read_time_minutes} min read
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {book.pages} pages
                </span>
              </div>
            </div>
          </div>

          {/* Excerpt / Full Reader Text */}
          <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm leading-relaxed space-y-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
              <span className="font-semibold flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Wellness Guide Introduction & Key Teachings
              </span>
              {book.description}
            </div>

            <div className="whitespace-pre-line font-serif-heading text-[15px] leading-relaxed tracking-normal pt-2">
              {book.excerpt || 'Full interactive reading text will be downloaded directly into your offline reader library.'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 flex items-center justify-between">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Unlocked in your personal Tena library
          </span>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};
