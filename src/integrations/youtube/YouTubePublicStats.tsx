import React from 'react';
import { Eye, ThumbsUp, MessageSquare, RefreshCw, Clock } from 'lucide-react';
import { YouTubeVideoData } from './youtubeTypes';

interface YouTubePublicStatsProps {
  video: YouTubeVideoData | null;
  initialViewCount?: number;
  playbackStarted?: boolean;
  isRefreshing?: boolean;
  lastUpdated?: number;
  onRefresh: () => void;
}

export const YouTubePublicStats: React.FC<YouTubePublicStatsProps> = ({
  video,
  initialViewCount,
  playbackStarted = false,
  isRefreshing = false,
  lastUpdated,
  onRefresh,
}) => {
  if (!video) return null;

  const currentViews = video.viewCount;
  const currentLikes = video.likeCount;
  const currentComments = video.commentCount;

  // View count comparison logic
  let viewCountNotice: React.ReactNode = null;
  if (playbackStarted && initialViewCount !== undefined && currentViews !== undefined) {
    const diff = currentViews - initialViewCount;
    if (diff > 0) {
      viewCountNotice = (
        <span className="text-emerald-400 font-mono text-[11px] block mt-1">
          {initialViewCount.toLocaleString()} → {currentViews.toLocaleString()} (+{diff} observed)
        </span>
      );
    } else {
      viewCountNotice = (
        <span className="text-zinc-500 font-mono text-[11px] block mt-1">
          Playback registered. Public view counter has not changed in latest API response.
        </span>
      );
    }
  }

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
            YouTube Public Stats
          </h3>
          {lastUpdated && (
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Views */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Views</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
            {currentViews !== undefined ? currentViews.toLocaleString() : 'Not available'}
          </div>
          {viewCountNotice}
        </div>

        {/* Likes */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
            <ThumbsUp className="w-3.5 h-3.5 text-rose-400" />
            <span>Public Likes</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
            {currentLikes !== undefined ? currentLikes.toLocaleString() : 'Not available'}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono block mt-1">
            Official public count
          </span>
        </div>

        {/* Comments */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Comments</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100 mt-1">
            {currentComments !== undefined ? currentComments.toLocaleString() : 'Not available'}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono block mt-1">
            Total comment threads
          </span>
        </div>
      </div>
    </div>
  );
};
