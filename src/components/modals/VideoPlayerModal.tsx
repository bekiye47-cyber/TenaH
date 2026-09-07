import React from 'react';
import { Video } from '../../types';
import { X, ExternalLink, Play, Sparkles } from 'lucide-react';
import { openTelegramLink, triggerHaptic } from '../../lib/telegram';

interface VideoPlayerModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  const handleOpenInTelegram = () => {
    triggerHaptic('light');
    openTelegramLink(video.youtube_url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#121B17] rounded-2xl shadow-2xl border border-emerald-900/10 dark:border-emerald-500/20 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-900/40">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {video.category}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {video.duration}
            </span>
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

        {/* Video Embed */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Info & Telegram Open CTA */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-serif-heading font-bold text-base text-stone-900 dark:text-stone-100 leading-snug">
              {video.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Led by {video.instructor} {video.views ? `• ${video.views} views` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleOpenInTelegram}
              className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open on YouTube (via Telegram)</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
