import React from 'react';
import { UserProfile, Challenge, Book, Video, NavTab } from '../../types';
import { Wallet, Sparkles, BookOpen, Tv, ArrowRight, CheckCircle, Clock, ChevronRight, PlusCircle } from 'lucide-react';
import { triggerHaptic } from '../../lib/telegram';

interface HomeTabProps {
  user: UserProfile;
  todayChallenge: Challenge | null;
  books: Book[];
  videos: Video[];
  setActiveTab: (tab: NavTab) => void;
  onOpenDeposit: () => void;
  onCompleteChallenge: (challengeId: string) => void;
  onSelectBook: (book: Book) => void;
  onSelectVideo: (video: Video) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  todayChallenge,
  books,
  videos,
  setActiveTab,
  onOpenDeposit,
  onCompleteChallenge,
  onSelectBook,
  onSelectVideo,
}) => {
  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-200">
      {/* 1. Welcoming Hero Card with User's Name & Photo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-850 to-emerald-950 text-white p-5 shadow-lg shadow-emerald-900/15 border border-emerald-700/30">
        {/* Subtle decorative background wave */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-32 h-32 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Welcome to Your Sacred Space
            </span>
            <h2 className="font-serif-heading font-bold text-2xl tracking-tight leading-snug">
              Greetings, {user.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-[240px]">
              May your mind find quiet stillness and your body restore its natural harmony today.
            </p>
          </div>

          {/* User Photo with wellness ring */}
          <div className="relative shrink-0">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-400/60 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/80 ring-2 ring-emerald-400/60 flex items-center justify-center text-xl font-serif-heading font-bold">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-emerald-950 flex items-center justify-center text-[9px]">
              🌿
            </span>
          </div>
        </div>

        {/* Wallet Balance Strip inside Hero */}
        <div className="mt-4 pt-3.5 border-t border-emerald-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-700/60 flex items-center justify-center text-emerald-300">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200/75 uppercase tracking-wider block font-medium">
                Wallet Balance
              </span>
              <span className="font-serif-heading font-bold text-lg leading-none text-white">
                ${user.wallet_balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                onOpenDeposit();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('settings');
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors cursor-pointer"
              title="Open Wallet Details in Settings"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VIP Spotlight Sneak Peek Banner */}
      <div 
        onClick={() => {
          triggerHaptic('light');
          setActiveTab('vip');
        }}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-amber-500/30 dark:border-amber-500/20 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-500/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-heading font-bold text-xs text-stone-900 dark:text-stone-100">
                Tena VIP Early Access
              </span>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-400 text-stone-950">
                Coming Soon
              </span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              Talk to doc, wellness biohacks, health roadmaps & free books.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>

      {/* 2. Today's Challenge Summary Card */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-serif-heading font-bold text-base text-stone-900 dark:text-stone-100">
              Today's Challenge
            </h3>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('challenges');
            }}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>All Daily Challenges</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayChallenge ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3 transition-all hover:border-emerald-500/40">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
                    {todayChallenge.category}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {todayChallenge.duration_minutes} mins
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    todayChallenge.is_paid
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                  }`}>
                    {todayChallenge.is_paid ? `$${todayChallenge.price.toFixed(2)}` : 'Free'}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                  {todayChallenge.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {todayChallenge.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                +{todayChallenge.reward_points} Vitality Points
              </span>

              {todayChallenge.completed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Completed</span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    triggerHaptic('success');
                    onCompleteChallenge(todayChallenge.id);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Complete</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500">
            No challenges available for today yet.
          </div>
        )}
      </div>

      {/* 3. Quick Links to Books & Videos */}
      <div className="space-y-4">
        {/* Quick Link: Books */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-serif-heading font-bold text-base text-stone-900 dark:text-stone-100">
                Wellness Library
              </h3>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('books');
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>Explore All Books</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {books.slice(0, 3).map((book) => (
              <div
                key={book.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectBook(book);
                }}
                className="group p-2.5 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/50 cursor-pointer shadow-sm transition-all"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 shadow-inner bg-stone-100 dark:bg-stone-900">
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold shadow-sm ${
                    book.is_paid
                      ? 'bg-stone-900/85 text-amber-300 backdrop-blur-xs'
                      : 'bg-emerald-600/90 text-white backdrop-blur-xs'
                  }`}>
                    {book.is_paid ? `$${book.price.toFixed(2)}` : 'Free'}
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-stone-900 dark:text-stone-100 line-clamp-1 leading-tight">
                  {book.title}
                </h4>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                  {book.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Link: Videos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-serif-heading font-bold text-base text-stone-900 dark:text-stone-100">
                Featured Wellness Videos
              </h3>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('videos');
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <span>Video Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {videos.slice(0, 2).map((vid) => (
              <div
                key={vid.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectVideo(vid);
                }}
                className="group rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/50 cursor-pointer overflow-hidden shadow-sm transition-all"
              >
                <div className="relative aspect-video bg-stone-900">
                  <img
                    src={vid.thumbnail_url}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-md">
                      <Tv className="w-4 h-4 fill-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white font-medium">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-2.5">
                  <h4 className="font-medium text-xs text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug">
                    {vid.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {vid.instructor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
