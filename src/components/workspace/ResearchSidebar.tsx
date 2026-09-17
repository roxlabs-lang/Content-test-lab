import React from 'react';
import {
  Eye,
  Heart,
  MessageSquare,
  Share2,
  UserPlus,
  Bookmark,
  ExternalLink,
  Sparkles,
  Zap,
  FileText,
  Clock,
  CheckCircle2,
  Copy,
  Tag,
  Star
} from 'lucide-react';
import { Experiment, ContentItem, ActionTimestamps } from '../../types';
import { getPlatformConfig, formatContentType } from '../../utils/platform';
import { openExternalContent } from '../../platforms/platformRegistry';
import { useToast } from '../../context/ToastContext';

interface ResearchSidebarProps {
  experiment: Experiment;
  onUpdateExperiment: (updated: Experiment) => void;
  onOpenNotes: () => void;
  onOpenQuickCapture: () => void;
  onToggleBookmark: () => void;
}

export const ResearchSidebar: React.FC<ResearchSidebarProps> = ({
  experiment,
  onUpdateExperiment,
  onOpenNotes,
  onOpenQuickCapture,
  onToggleBookmark
}) => {
  const { showToast } = useToast();
  const content = experiment.content;
  const platformCfg = content ? getPlatformConfig(content.platform) : null;

  // Format current local time HH:MM for action timestamps
  const getCurrentTimeFormatted = (): string => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleAction = (
    actionKey: keyof ActionTimestamps,
    flagKey: 'watched' | 'liked' | 'commented' | 'shared' | 'followed' | 'saved'
  ) => {
    const currentVal = Boolean(experiment[flagKey]);
    const nextVal = !currentVal;

    const timestamps: ActionTimestamps = {
      ...(experiment.actionTimestamps || {})
    };

    if (nextVal) {
      // Record user action timestamp
      timestamps[actionKey] = getCurrentTimeFormatted();
    } else {
      delete timestamps[actionKey];
    }

    const updated: Experiment = {
      ...experiment,
      [flagKey]: nextVal,
      actions: {
        ...(experiment.actions || {}),
        [flagKey]: nextVal
      },
      actionTimestamps: timestamps,
      updatedAt: Date.now()
    };

    onUpdateExperiment(updated);
  };

  const copyUrl = async () => {
    if (!content?.url) return;
    try {
      await navigator.clipboard.writeText(content.url);
      showToast('Content URL copied to clipboard', 'info');
    } catch {
      showToast('Failed to copy URL', 'error');
    }
  };

  const actionList: Array<{
    key: 'watched' | 'liked' | 'commented' | 'shared' | 'followed' | 'saved';
    timestampKey: keyof ActionTimestamps;
    label: string;
    icon: React.ReactNode;
  }> = [
    { key: 'watched', timestampKey: 'watchedAt', label: 'Watched', icon: <Eye className="w-3.5 h-3.5" /> },
    { key: 'liked', timestampKey: 'likedAt', label: 'Liked', icon: <Heart className="w-3.5 h-3.5" /> },
    { key: 'commented', timestampKey: 'commentedAt', label: 'Commented', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'shared', timestampKey: 'sharedAt', label: 'Shared', icon: <Share2 className="w-3.5 h-3.5" /> },
    { key: 'followed', timestampKey: 'followedAt', label: 'Followed', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { key: 'saved', timestampKey: 'savedAt', label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" /> }
  ];

  return (
    <aside className="w-full flex flex-col space-y-5 select-none">
      {/* Quick Action Bar (Notes, Quick Capture, Bookmark) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenNotes}
          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>📝 Notes</span>
        </button>

        <button
          type="button"
          onClick={onOpenQuickCapture}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>⚡ Quick Capture</span>
        </button>

        <button
          type="button"
          onClick={onToggleBookmark}
          className={`p-2 rounded-xl border transition ${
            experiment.isBookmarked
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
          title={experiment.isBookmarked ? 'Saved to library' : 'Bookmark to library'}
        >
          <Bookmark className={`w-4 h-4 ${experiment.isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>

      {/* SECTION 1: CONTENT INFO */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            CONTENT
          </span>
          {platformCfg && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${platformCfg.tagColor}`}>
              {platformCfg.name}
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] text-zinc-500 font-mono">CREATOR</span>
            <p className="font-medium text-zinc-200 truncate">
              {content?.creator || 'Unknown Creator'}{' '}
              {content?.creatorHandle && (
                <span className="text-zinc-400 font-normal">({content.creatorHandle})</span>
              )}
            </p>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 font-mono">TITLE</span>
            <p className="font-medium text-zinc-200 line-clamp-2">
              {content?.title || 'Social Media Research Item'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono">PLATFORM</span>
              <p className="font-medium text-zinc-300 capitalize">{content?.platform || 'Unknown'}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-mono">TYPE</span>
              <p className="font-medium text-zinc-300">{formatContentType(content?.contentType || content?.type || 'post')}</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 font-mono">URL</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <input
                type="text"
                readOnly
                value={content?.url || ''}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-400 truncate select-all"
              />
              <button
                type="button"
                onClick={copyUrl}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition shrink-0"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: INTERACTION TOGGLES */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            INTERACTION LOG
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            MANUAL ACTION TOGGLES
          </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-tight">
          Mark activities performed manually with your test account. Timestamps record when logged in Content Test Lab.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {actionList.map((action) => {
            const isChecked = Boolean(experiment[action.key]);
            const timestamp = experiment.actionTimestamps?.[action.timestampKey];

            return (
              <button
                key={action.key}
                type="button"
                onClick={() => toggleAction(action.timestampKey, action.key)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isChecked
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-200'
                    : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className={isChecked ? 'text-indigo-400' : 'text-zinc-500'}>
                      {action.icon}
                    </span>
                    <span>{action.label}</span>
                  </span>

                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border transition ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-zinc-700 bg-zinc-900'
                    }`}
                  >
                    {isChecked ? '✓' : '○'}
                  </span>
                </div>

                {/* Recorded Timestamp */}
                <div className="mt-2 text-[10px] font-mono flex items-center gap-1">
                  {isChecked && timestamp ? (
                    <span className="text-indigo-300/80 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timestamp}
                    </span>
                  ) : (
                    <span className="text-zinc-600">Not recorded</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: RATING SLIDER & COMPLETION */}
      <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            RESEARCH SCORE
          </span>
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {experiment.personalRating || 0}/10
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={experiment.personalRating || 0}
          onChange={(e) => {
            const val = Number(e.target.value);
            onUpdateExperiment({
              ...experiment,
              personalRating: val,
              rating: val,
              updatedAt: Date.now()
            });
          }}
          className="w-full accent-indigo-500 bg-zinc-800 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>0 (Low value)</span>
          <span>10 (Elite viral blueprint)</span>
        </div>
      </div>
    </aside>
  );
};
