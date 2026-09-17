import React, { useState } from 'react';
import {
  ExternalLink,
  Shield,
  Film,
  Sparkles,
  Maximize2,
  CheckCircle2,
  ArrowUpRight,
  Info,
  Check,
  Eye,
  Clock,
  Play
} from 'lucide-react';
import { ContentItem, ParsedContent, Platform } from '../../types';
import { openExternalContent } from '../../platforms/platformRegistry';
import { getPlatformConfig } from '../../utils/platform';

interface ContentViewerStageProps {
  content: ContentItem | ParsedContent | null;
  isWatched?: boolean;
  watchedTime?: string;
  onToggleWatched?: () => void;
  onRecordActionClick?: () => void;
}

export const ContentViewerStage: React.FC<ContentViewerStageProps> = ({
  content,
  isWatched = false,
  watchedTime,
  onToggleWatched,
  onRecordActionClick
}) => {
  const [hasOpenedExternal, setHasOpenedExternal] = useState(false);

  if (!content) {
    return (
      <div className="w-full aspect-video min-h-[280px] sm:min-h-[340px] rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
        <Film className="w-12 h-12 text-zinc-600 mb-3" />
        <h3 className="text-sm font-semibold text-zinc-300 mb-1">
          No Content Loaded in Workspace
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm">
          Paste a YouTube, Instagram, Facebook, or Telegram URL above to load and test content.
        </p>
      </div>
    );
  }

  const handleOpenExternal = () => {
    openExternalContent(content);
    setHasOpenedExternal(true);
  };

  const platformCfg = getPlatformConfig(content.platform);
  const platformName = platformCfg.name;

  // Detect whether content should be displayed as vertical/portrait
  const isVertical =
    content.type === 'short' ||
    content.type === 'reel' ||
    Boolean(content.url && (content.url.includes('/shorts/') || content.url.includes('/reel/') || content.url.includes('/reels/')));

  // Check creator info to avoid displaying fake placeholders
  const creatorDisplay = content.creatorHandle || (content.creator ? `@${content.creator}` : null);

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* 1. ACTUAL CONTENT VIEWER (HERO) */}
      <div className="w-full flex justify-center">
        {content.embedUrl ? (
          /* EMBEDDED IFRAME (Supports portrait for Shorts & 16:9 for landscape) */
          <div
            className={`relative rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl transition-all ${
              isVertical
                ? 'w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] min-h-[460px]'
                : 'w-full aspect-video min-h-[260px] sm:min-h-[360px]'
            }`}
          >
            <iframe
              src={content.embedUrl}
              title={content.title || 'Embedded Social Content'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          /* PREVIEW CARD FOR PLATFORMS RESTRICTING IFRAME (Instagram, Facebook) */
          <div
            className={`relative rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-zinc-800 p-5 sm:p-6 flex flex-col justify-between shadow-2xl transition-all ${
              isVertical
                ? 'w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] min-h-[460px]'
                : 'w-full aspect-video min-h-[280px] sm:min-h-[340px]'
            }`}
          >
            {/* Background Thumbnail if available */}
            {content.thumbnailUrl && (
              <div
                className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none filter blur-md scale-105"
                style={{ backgroundImage: `url(${content.thumbnailUrl})` }}
              />
            )}

            {/* Header Badge */}
            <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-200">
                  {platformName} Content
                </span>
              </div>

              <span className="px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 uppercase text-[10px] font-mono text-zinc-400">
                {isVertical ? 'Vertical Reel/Short' : 'Standard Post'}
              </span>
            </div>

            {/* Center Content Metadata */}
            <div className="relative z-10 my-auto py-4 space-y-3">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                  {creatorDisplay ? creatorDisplay : 'Creator: Not available'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                  {content.title || `${platformName} Content Item`}
                </h2>
              </div>

              {/* Policy note */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2.5">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {platformName} restricts in-frame playback via security headers. Use the open button below to view and interact natively.
                </p>
              </div>
            </div>

            {/* Footer URL hint */}
            <div className="relative z-10 pt-2 border-t border-zinc-800/60">
              <p className="text-[10px] font-mono text-zinc-500 truncate">
                {content.url}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. DIRECT ACTION ROW: PROMINENT OPEN BUTTON & WATCHED STATE */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
        {/* Prominent Open on Platform Button */}
        <button
          type="button"
          id="btn-open-external-platform"
          onClick={handleOpenExternal}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          <span>Open in {platformName}</span>
        </button>

        {/* Watched State Toggle */}
        {onToggleWatched && (
          <button
            type="button"
            id="btn-toggle-watched"
            onClick={onToggleWatched}
            className={`py-3 px-4 rounded-xl border transition flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold select-none active:scale-[0.98] ${
              isWatched
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
            }`}
          >
            {isWatched ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Watched {watchedTime ? `(${watchedTime})` : '✓'}</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-zinc-400" />
                <span>Mark as Watched</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Post-external Return Assistance Banner */}
      {hasOpenedExternal && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] leading-relaxed">
              Opened in {platformName}. Return here to log your reactions, comments, and research notes below.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
