import React, { useState, useMemo } from 'react';
import { Video } from '../../types';
import { 
  Search, 
  Tv, 
  ExternalLink, 
  Play, 
  Clock, 
  User
} from 'lucide-react';
import { openTelegramLink, triggerHaptic } from '../../lib/telegram';

interface VideosTabProps {
  videos: Video[];
  onSelectVideo?: (video: Video) => void;
}

export const VideosTab: React.FC<VideosTabProps> = ({ videos, onSelectVideo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(videos.map((v) => v.category)));
    return ['All', ...list];
  }, [videos]);

  // Filtered list based on search and category
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.instructor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [videos, searchQuery, selectedCategory]);

  const handleVideoClick = (video: Video) => {
    triggerHaptic('light');
    if (onSelectVideo) {
      onSelectVideo(video);
    } else {
      openTelegramLink(video.youtube_url);
    }
  };

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="font-serif-heading font-bold text-xl text-stone-900 dark:text-stone-100">
          Wellness Video Directory
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
          Guided breathwork, sound baths, yoga, and somatic movements.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, teacher, or practice..."
          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121B17] text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 selectable-text shadow-xs"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              triggerHaptic('selection');
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200 dark:border-stone-800 text-center space-y-2">
          <Tv className="w-8 h-8 mx-auto text-emerald-600/50" />
          <h4 className="font-semibold text-sm text-stone-800 dark:text-stone-200">
            No videos matching "{searchQuery}"
          </h4>
          <p className="text-xs text-stone-500">
            Try searching with different keywords or switch categories.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => handleVideoClick(video)}
              className="group rounded-2xl bg-white dark:bg-[#121B17] border border-stone-200/80 dark:border-stone-800 hover:border-emerald-500/60 p-3 flex flex-col sm:flex-row gap-3 cursor-pointer shadow-xs transition-all duration-200"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video sm:w-44 shrink-0 rounded-xl overflow-hidden bg-stone-900">
                <img
                  src={video.thumbnail_url}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/15 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/95 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white font-medium flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {video.duration}
                </span>
              </div>

              {/* Video Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      {video.category}
                    </span>
                    {video.views && (
                      <span className="text-[10px] text-stone-400">
                        {video.views} views
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-400" />
                    <span>{video.instructor}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/60">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 group-hover:underline">
                    <span>Watch Session</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
