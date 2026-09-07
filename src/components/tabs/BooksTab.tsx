import React, { useState } from 'react';
import { Book, UserProfile } from '../../types';
import { BookOpen, Lock, Unlock, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface BooksTabProps {
  books: Book[];
  user: UserProfile;
  onSelectBook: (book: Book) => void;
  onPurchaseBook: (book: Book) => Promise<void>;
  onOpenDeposit: () => void;
}

export const BooksTab: React.FC<BooksTabProps> = ({
  books,
  user,
  onSelectBook,
  onPurchaseBook,
  onOpenDeposit,
}) => {
  const [filter, setFilter] = useState<'all' | 'free' | 'paid' | 'owned'>('all');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const filteredBooks = books.filter((book) => {
    if (filter === 'free' && book.is_paid) return false;
    if (filter === 'paid' && !book.is_paid) return false;
    if (filter === 'owned' && !book.is_owned) return false;
    return true;
  });

  const handleBuyClick = async (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    setPurchaseError(null);

    if (user.wallet_balance < book.price) {
      triggerHaptic('warning');
      setPurchaseError(`Insufficient wallet balance ($${user.wallet_balance.toFixed(2)}). You need $${book.price.toFixed(2)} to buy "${book.title}".`);
      return;
    }

    triggerHaptic('medium');
    setPurchasingId(book.id);
    try {
      await onPurchaseBook(book);
      triggerHaptic('success');
    } catch (err: any) {
      setPurchaseError(err.message || 'Failed to purchase book.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif-heading font-bold text-xl text-stone-900 dark:text-stone-100">
            Wellness Book Library
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Ancient wisdom texts, holistic healing primers, and circadian guides.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-500 block">Available Balance</span>
          <span className="font-serif-heading font-bold text-sm text-emerald-700 dark:text-emerald-400">
            ${user.wallet_balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Books' },
          { id: 'free', label: 'Free' },
          { id: 'paid', label: 'Paid Guides' },
          { id: 'owned', label: 'My Unlocked Books' },
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

      {/* Purchase Error Banner with Deposit CTA */}
      {purchaseError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{purchaseError}</span>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenDeposit();
            }}
            className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] shrink-0 transition-colors"
          >
            Top Up Wallet
          </button>
        </div>
      )}

      {/* Book Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => {
            const isUnlocked = !book.is_paid || book.is_owned;

            return (
              <div
                key={book.id}
                onClick={() => {
                  triggerHaptic('light');
                  if (isUnlocked) {
                    onSelectBook(book);
                  }
                }}
                className={`group rounded-2xl p-3 flex flex-col justify-between border transition-all duration-200 cursor-pointer ${
                  isUnlocked
                    ? 'bg-white dark:bg-[#121B17] border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/50 shadow-xs'
                    : 'bg-stone-50/80 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 hover:border-amber-500/50'
                }`}
              >
                <div>
                  {/* Cover Image */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2.5 shadow-sm bg-stone-100 dark:bg-stone-900">
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Free or Paid Badge */}
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-xs ${
                      !book.is_paid
                        ? 'bg-emerald-700/90 text-white'
                        : book.is_owned
                        ? 'bg-teal-700/90 text-white'
                        : 'bg-stone-900/90 text-amber-300'
                    }`}>
                      {!book.is_paid ? 'Free' : book.is_owned ? 'Owned' : `$${book.price.toFixed(2)}`}
                    </span>

                    {/* Category pill */}
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-black/60 text-white backdrop-blur-xs">
                      {book.category}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h3 className="font-semibold text-xs text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {book.author}
                  </p>
                </div>

                {/* Card Action */}
                <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800/80">
                  {isUnlocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic('light');
                        onSelectBook(book);
                      }}
                      className="w-full py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Free</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleBuyClick(e, book)}
                      disabled={purchasingId === book.id}
                      className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 active:scale-95"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{purchasingId === book.id ? 'Purchasing...' : `Buy for $${book.price.toFixed(2)}`}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200 dark:border-stone-800 text-center space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-emerald-600/50" />
            <h4 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
              No books found
            </h4>
            <p className="text-xs text-stone-500">
              Try switching your filter above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
