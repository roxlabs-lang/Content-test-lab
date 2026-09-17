import React, { useState } from 'react';
import {
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  UserPlus,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { Platform, ContentItem, Experiment, SocialAction, ActionRecord } from '../types';
import { getPlatformCapabilities, getPlatformConfig } from '../utils/platform';
import { openExternalContent } from '../platforms/platformRegistry';
import { useToast } from '../context/ToastContext';

export interface SocialActionsProps {
  platform: Platform;
  content: ContentItem;
  experiment: Experiment;
  onActionRecorded: (action: SocialAction, method?: 'direct' | 'external' | 'manual') => void;
  onFocusComment?: () => void;
}

export const PrimarySocialActions: React.FC<SocialActionsProps> = ({
  platform,
  content,
  experiment,
  onActionRecorded,
  onFocusComment,
}) => {
  const { showToast } = useToast();
  const caps = getPlatformCapabilities(platform);
  const platformCfg = getPlatformConfig(platform);
  const [confirmModalAction, setConfirmModalAction] = useState<SocialAction | null>(null);

  // Helper to extract if action is completed and its timestamp
  const getActionState = (action: SocialAction): { completed: boolean; time?: string; method?: string } => {
    // Check explicit field
    const explicitFlag = Boolean(experiment[action === 'follow' ? 'followed' : (action === 'save' ? 'saved' : (action === 'like' ? 'liked' : (action === 'comment' ? 'commented' : 'shared')))]);

    // Check actions object record
    const actionsObj = experiment.actions || {};
    const actionVal = actionsObj[action] || actionsObj[action === 'follow' ? 'followed' : (action === 'save' ? 'saved' : (action === 'like' ? 'liked' : (action === 'comment' ? 'commented' : 'shared')))];
    
    let isCompleted = explicitFlag;
    let recordedTime = experiment.actionTimestamps?.[
      action === 'like' ? 'likedAt' : action === 'comment' ? 'commentedAt' : action === 'share' ? 'sharedAt' : action === 'follow' ? 'followedAt' : 'savedAt'
    ];
    let method: string | undefined = undefined;

    if (typeof actionVal === 'object' && actionVal !== null) {
      if (actionVal.completed !== undefined) {
        isCompleted = actionVal.completed;
      }
      if (actionVal.formattedTime) {
        recordedTime = actionVal.formattedTime;
      }
      if (actionVal.method) {
        method = actionVal.method;
      }
    } else if (typeof actionVal === 'boolean') {
      isCompleted = isCompleted || actionVal;
    }

    return { completed: isCompleted, time: recordedTime, method };
  };

  const handleActionClick = (action: SocialAction) => {
    const state = getActionState(action);

    if (action === 'comment') {
      // Focus comment textarea and toggle action if needed
      if (onFocusComment) {
        onFocusComment();
      }
      if (!state.completed) {
        onActionRecorded('comment', 'direct');
        showToast('Comment field focused & interaction logged', 'info');
      } else {
        onActionRecorded('comment', 'manual');
      }
      return;
    }

    if (action === 'share') {
      // Direct Web Share API or Clipboard Copy + Mark as shared
      if (content.url) {
        if (navigator.share) {
          navigator.share({
            title: content.title || 'Social Content',
            url: content.url,
          }).then(() => {
            onActionRecorded('share', 'direct');
            showToast('Content shared successfully', 'success');
          }).catch(() => {
            // Fallback to copy or modal
            navigator.clipboard.writeText(content.url);
            onActionRecorded('share', 'manual');
            showToast('Link copied & share recorded', 'success');
          });
          return;
        } else {
          navigator.clipboard.writeText(content.url);
          onActionRecorded('share', 'manual');
          showToast('URL copied to clipboard & share recorded', 'success');
          return;
        }
      }
    }

    if (state.completed) {
      // Toggle off directly if user clicks again
      onActionRecorded(action, 'manual');
      showToast(`Removed ${caps.labels[action]} record`, 'info');
    } else {
      // If direct iframe interaction is not supported on platform, open confirmation modal
      if (!platformCfg.allowsDirectIframe) {
        setConfirmModalAction(action);
      } else {
        // Direct record
        onActionRecorded(action, 'direct');
        showToast(`Recorded ${caps.labels[action]} for ${platformCfg.name}`, 'success');
      }
    }
  };

  const handleConfirmAction = (method: 'external' | 'manual' = 'external') => {
    if (!confirmModalAction) return;
    onActionRecorded(confirmModalAction, method);
    showToast(`Recorded ${caps.labels[confirmModalAction]}`, 'success');
    setConfirmModalAction(null);
  };

  const likeState = getActionState('like');
  const commentState = getActionState('comment');
  const shareState = getActionState('share');
  const saveState = getActionState('save');
  const followState = getActionState('follow');

  const isTelegram = platform === 'telegram';

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <span>Primary Actions</span>
          <span className="text-[10px] text-zinc-500 font-normal">({platformCfg.name})</span>
        </h3>
        <span className="text-[11px] font-mono text-zinc-500">
          {[likeState, commentState, shareState, saveState, followState].filter(s => s.completed).length}/5 completed
        </span>
      </div>

      {/* 2x2 Grid + Full width Follow button */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. LIKE / REACT BUTTON */}
        <button
          type="button"
          id="btn-action-like"
          onClick={() => handleActionClick('like')}
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none min-h-[52px] active:scale-[0.98] ${
            likeState.completed
              ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-950/30'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isTelegram ? (
              <ThumbsUp className={`w-5 h-5 ${likeState.completed ? 'fill-rose-400 text-rose-400' : 'text-zinc-400'}`} />
            ) : (
              <Heart className={`w-5 h-5 ${likeState.completed ? 'fill-rose-400 text-rose-400' : 'text-zinc-400'}`} />
            )}
            <div className="text-left leading-tight">
              <span className="text-sm font-semibold block">
                {likeState.completed ? caps.labels.liked : caps.labels.like}
              </span>
              {likeState.completed && likeState.time && (
                <span className="text-[10px] font-mono text-rose-300/80 block mt-0.5">
                  {likeState.time}
                </span>
              )}
            </div>
          </div>
          {likeState.completed && (
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
        </button>

        {/* 2. COMMENT BUTTON */}
        <button
          type="button"
          id="btn-action-comment"
          onClick={() => handleActionClick('comment')}
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none min-h-[52px] active:scale-[0.98] ${
            commentState.completed
              ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-sm shadow-indigo-950/30'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className={`w-5 h-5 ${commentState.completed ? 'fill-indigo-400/40 text-indigo-400' : 'text-zinc-400'}`} />
            <div className="text-left leading-tight">
              <span className="text-sm font-semibold block">
                {commentState.completed ? caps.labels.commented : caps.labels.comment}
              </span>
              {commentState.completed && commentState.time && (
                <span className="text-[10px] font-mono text-indigo-300/80 block mt-0.5">
                  {commentState.time}
                </span>
              )}
            </div>
          </div>
          {commentState.completed && (
            <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
        </button>

        {/* 3. SHARE BUTTON */}
        <button
          type="button"
          id="btn-action-share"
          onClick={() => handleActionClick('share')}
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none min-h-[52px] active:scale-[0.98] ${
            shareState.completed
              ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-950/30'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Share2 className={`w-5 h-5 ${shareState.completed ? 'text-sky-400' : 'text-zinc-400'}`} />
            <div className="text-left leading-tight">
              <span className="text-sm font-semibold block">
                {shareState.completed ? caps.labels.shared : caps.labels.share}
              </span>
              {shareState.completed && shareState.time && (
                <span className="text-[10px] font-mono text-sky-300/80 block mt-0.5">
                  {shareState.time}
                </span>
              )}
            </div>
          </div>
          {shareState.completed && (
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
        </button>

        {/* 4. SAVE / BOOKMARK BUTTON */}
        <button
          type="button"
          id="btn-action-save"
          onClick={() => handleActionClick('save')}
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none min-h-[52px] active:scale-[0.98] ${
            saveState.completed
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-950/30'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bookmark className={`w-5 h-5 ${saveState.completed ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
            <div className="text-left leading-tight">
              <span className="text-sm font-semibold block">
                {saveState.completed ? caps.labels.saved : caps.labels.save}
              </span>
              {saveState.completed && saveState.time && (
                <span className="text-[10px] font-mono text-amber-300/80 block mt-0.5">
                  {saveState.time}
                </span>
              )}
            </div>
          </div>
          {saveState.completed && (
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          )}
        </button>
      </div>

      {/* 5. FOLLOW / SUBSCRIBE / JOIN (Full Width) */}
      <button
        type="button"
        id="btn-action-follow"
        onClick={() => handleActionClick('follow')}
        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all select-none min-h-[52px] active:scale-[0.98] ${
          followState.completed
            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/30'
            : 'bg-zinc-900/90 border-zinc-800 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-850'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <UserPlus className={`w-5 h-5 ${followState.completed ? 'text-emerald-400' : 'text-zinc-400'}`} />
          <div className="text-left leading-tight">
            <span className="text-sm font-semibold block">
              {followState.completed ? caps.labels.followed : caps.labels.follow}
            </span>
            {followState.completed && followState.time && (
              <span className="text-[10px] font-mono text-emerald-300/80 block mt-0.5">
                Recorded {followState.time}
              </span>
            )}
          </div>
        </div>
        {followState.completed ? (
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        ) : (
          <span className="text-xs font-mono text-zinc-500">
            {platformCfg.name}
          </span>
        )}
      </button>

      {/* CONFIRMATION / ACTION MODAL FOR EXTERNAL PLATFORMS */}
      {confirmModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-zinc-100">
                  Perform {caps.labels[confirmModalAction]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalAction(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {platformCfg.name} requires interacting on their official interface to register {caps.labels[confirmModalAction].toLowerCase()}.
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  openExternalContent(content);
                  handleConfirmAction('external');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in {platformCfg.name} & Mark Completed</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAction('manual')}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark as {caps.labels[confirmModalAction]} (Already Done)</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmModalAction(null)}
                className="w-full py-2 text-zinc-400 hover:text-zinc-200 text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
