import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  UserPlus,
  Check,
  CheckCircle2,
  Loader2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import {
  YouTubeActionState,
  YouTubeAccount,
  YouTubeVideoData,
} from './youtubeTypes';
import { rateVideo, subscribeChannel, saveVideo } from './youtubeApi';
import { openPlatformUrl } from '../../platforms/browser/openPlatform';

interface YouTubeActionsProps {
  video: YouTubeVideoData;
  account: YouTubeAccount | null;
  actionState: YouTubeActionState;
  onUpdateActionState: (updater: (prev: YouTubeActionState) => YouTubeActionState) => void;
  onFocusComment: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onActionConfirmed?: (actionName: string, detail: any) => void;
}

export const YouTubeActions: React.FC<YouTubeActionsProps> = ({
  video,
  account,
  actionState,
  onUpdateActionState,
  onFocusComment,
  onShowToast,
  onActionConfirmed,
}) => {
  const isApiConnected = Boolean(account && account.connected);

  // Manual interactive confirmation states
  const [awaitingLikeConfirm, setAwaitingLikeConfirm] = useState(false);
  const [awaitingSubscribeConfirm, setAwaitingSubscribeConfirm] = useState(false);
  const [awaitingSaveConfirm, setAwaitingSaveConfirm] = useState(false);

  const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const channelUrl = video.channelTitle
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(video.channelTitle)}`
    : watchUrl;

  // 1. LIKE HANDLER
  const handleLikeClick = async () => {
    if (isApiConnected) {
      const currentLiked = actionState.like.status === 'liked';
      const targetRating = currentLiked ? 'none' : 'like';

      onUpdateActionState((prev) => ({
        ...prev,
        like: { status: 'loading' },
      }));

      try {
        const res = await rateVideo(video.videoId, targetRating);
        const nextStatus = targetRating === 'like' ? 'liked' : 'not_liked';
        onUpdateActionState((prev) => ({
          ...prev,
          like: { status: nextStatus },
        }));

        onShowToast(
          targetRating === 'like' ? 'Liked on YouTube • API confirmed ✓' : 'Removed like on YouTube',
          'success'
        );

        if (onActionConfirmed) {
          onActionConfirmed('like', { rating: targetRating, method: 'api', confirmedAt: res.confirmedAt });
        }
      } catch (err: any) {
        onUpdateActionState((prev) => ({
          ...prev,
          like: { status: 'error', error: err.message },
        }));
        onShowToast(err.message || 'Failed to update rating via API', 'error');
      }
    } else {
      // Manual browser flow
      openPlatformUrl(watchUrl);
      setAwaitingLikeConfirm(true);
      onShowToast('Opened YouTube video in new tab. Click "I Liked It" to confirm.', 'info');
    }
  };

  const handleConfirmManualLike = () => {
    const confirmedAt = Date.now();
    onUpdateActionState((prev) => ({
      ...prev,
      like: { status: 'liked' },
    }));
    setAwaitingLikeConfirm(false);
    onShowToast('❤️ Liked • Manual confirmation ✓', 'success');

    if (onActionConfirmed) {
      onActionConfirmed('like', { rating: 'like', method: 'manual', confirmedAt });
    }
  };

  // 2. SHARE HANDLER
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          url: watchUrl,
        });
        onUpdateActionState((prev) => ({
          ...prev,
          share: { status: 'shared', sharedAt: Date.now() },
        }));
        onShowToast('Shared via device sheet ✓', 'success');
      } else {
        await navigator.clipboard.writeText(watchUrl);
        onUpdateActionState((prev) => ({
          ...prev,
          share: { status: 'copied', sharedAt: Date.now() },
        }));
        onShowToast('YouTube link copied to clipboard ✓', 'success');
      }

      if (onActionConfirmed) {
        onActionConfirmed('share', { method: navigator.share ? 'native_share' : 'copied' });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        onUpdateActionState((prev) => ({
          ...prev,
          share: { status: 'error' },
        }));
      }
    }
  };

  // 3. SAVE HANDLER
  const handleSaveClick = async () => {
    if (isApiConnected) {
      onUpdateActionState((prev) => ({
        ...prev,
        save: { status: 'saving' },
      }));

      try {
        const res = await saveVideo(video.videoId);
        onUpdateActionState((prev) => ({
          ...prev,
          save: {
            status: 'saved',
            playlistId: res.playlistId,
            playlistTitle: res.playlistTitle,
            savedAt: res.savedAt,
          },
        }));
        onShowToast('Saved to "Content Test Lab Saves" playlist • API confirmed ✓', 'success');

        if (onActionConfirmed) {
          onActionConfirmed('save', { playlistId: res.playlistId, method: 'api', confirmedAt: res.savedAt });
        }
      } catch (err: any) {
        onUpdateActionState((prev) => ({
          ...prev,
          save: { status: 'error', error: err.message },
        }));
        onShowToast(err.message || 'Failed to save to playlist', 'error');
      }
    } else {
      // Manual browser flow
      openPlatformUrl(watchUrl);
      setAwaitingSaveConfirm(true);
      onShowToast('Opened YouTube video in new tab. Save to Watch Later/Playlist and confirm below.', 'info');
    }
  };

  const handleConfirmManualSave = () => {
    const confirmedAt = Date.now();
    onUpdateActionState((prev) => ({
      ...prev,
      save: { status: 'saved', savedAt: confirmedAt },
    }));
    setAwaitingSaveConfirm(false);
    onShowToast('🔖 Saved on YouTube • Manual confirmation ✓', 'success');

    if (onActionConfirmed) {
      onActionConfirmed('save', { method: 'manual', confirmedAt });
    }
  };

  // 4. SUBSCRIBE HANDLER
  const handleSubscribeClick = async () => {
    if (isApiConnected && video.channelId) {
      onUpdateActionState((prev) => ({
        ...prev,
        subscribe: { status: 'loading' },
      }));

      try {
        const res = await subscribeChannel(video.channelId);
        onUpdateActionState((prev) => ({
          ...prev,
          subscribe: {
            status: 'subscribed',
            subscriptionId: res.subscriptionId,
            subscribedAt: res.subscribedAt,
          },
        }));
        onShowToast(`Subscribed to ${video.channelTitle || 'channel'} • API confirmed ✓`, 'success');

        if (onActionConfirmed) {
          onActionConfirmed('subscribe', { channelId: video.channelId, method: 'api', confirmedAt: res.subscribedAt });
        }
      } catch (err: any) {
        onUpdateActionState((prev) => ({
          ...prev,
          subscribe: { status: 'error', error: err.message },
        }));
        onShowToast(err.message || 'Failed to subscribe via API', 'error');
      }
    } else {
      // Manual browser flow
      openPlatformUrl(channelUrl);
      setAwaitingSubscribeConfirm(true);
      onShowToast('Opened creator channel in new tab. Click "Subscribed" to confirm.', 'info');
    }
  };

  const handleConfirmManualSubscribe = () => {
    const confirmedAt = Date.now();
    onUpdateActionState((prev) => ({
      ...prev,
      subscribe: { status: 'subscribed', subscribedAt: confirmedAt },
    }));
    setAwaitingSubscribeConfirm(false);
    onShowToast('➕ Subscribed • Manual confirmation ✓', 'success');

    if (onActionConfirmed) {
      onActionConfirmed('subscribe', { method: 'manual', confirmedAt });
    }
  };

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
            Test Actions & Engagement
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {isApiConnected
              ? 'Real operations verified via YouTube API'
              : 'Manual Browser Mode: open native platform and log confirmations'}
          </p>
        </div>

        <span
          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
            isApiConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}
        >
          {isApiConnected ? 'API Connected' : 'Manual Mode'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* 1. LIKE */}
        {awaitingLikeConfirm ? (
          <button
            type="button"
            onClick={handleConfirmManualLike}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-rose-500 bg-rose-500/20 text-rose-300 text-center animate-pulse transition active:scale-95"
          >
            <Check className="w-5 h-5 mb-1 text-rose-300" />
            <span className="text-xs font-bold">✓ I Liked It</span>
            <span className="text-[10px] font-mono mt-0.5">Click to confirm</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={actionState.like.status === 'loading'}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition active:scale-95 ${
              actionState.like.status === 'liked'
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/10'
                : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-850'
            }`}
          >
            {actionState.like.status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin text-rose-400 mb-1.5" />
            ) : (
              <Heart
                className={`w-5 h-5 mb-1.5 transition ${
                  actionState.like.status === 'liked' ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                }`}
              />
            )}
            <span className="text-xs font-bold">
              {actionState.like.status === 'liked' ? 'Liked ✓' : 'Like'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {actionState.like.status === 'liked'
                ? isApiConnected ? 'API Confirmed' : 'Manual Confirmed'
                : 'Like on YouTube'}
            </span>
          </button>
        )}

        {/* 2. COMMENT */}
        <button
          type="button"
          onClick={onFocusComment}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition active:scale-95 ${
            actionState.comment.status === 'posted'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
              : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          <MessageSquare
            className={`w-5 h-5 mb-1.5 ${
              actionState.comment.status === 'posted' ? 'text-amber-400' : 'text-zinc-400'
            }`}
          />
          <span className="text-xs font-bold">
            {actionState.comment.status === 'posted' ? 'Commented ✓' : 'Comment'}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
            {actionState.comment.status === 'posted' ? 'Confirmed' : 'Write comment'}
          </span>
        </button>

        {/* 3. SHARE */}
        <button
          type="button"
          onClick={handleShare}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition active:scale-95 ${
            actionState.share.status === 'shared' || actionState.share.status === 'copied'
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 shadow-md'
              : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-850'
          }`}
        >
          {actionState.share.status === 'copied' ? (
            <Check className="w-5 h-5 mb-1.5 text-blue-400" />
          ) : (
            <Share2 className="w-5 h-5 mb-1.5 text-zinc-400" />
          )}
          <span className="text-xs font-bold">
            {actionState.share.status === 'copied'
              ? 'Copied ✓'
              : actionState.share.status === 'shared'
              ? 'Shared ✓'
              : 'Share'}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
            {actionState.share.status === 'copied'
              ? 'Link copied'
              : actionState.share.status === 'shared'
              ? 'Device sheet'
              : 'Share link'}
          </span>
        </button>

        {/* 4. SAVE */}
        {awaitingSaveConfirm ? (
          <button
            type="button"
            onClick={handleConfirmManualSave}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-indigo-500 bg-indigo-500/20 text-indigo-300 text-center animate-pulse transition active:scale-95"
          >
            <Check className="w-5 h-5 mb-1 text-indigo-300" />
            <span className="text-xs font-bold">✓ Saved</span>
            <span className="text-[10px] font-mono mt-0.5">Click to confirm</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={actionState.save.status === 'saving'}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition active:scale-95 ${
              actionState.save.status === 'saved'
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/10'
                : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-850'
            }`}
          >
            {actionState.save.status === 'saving' ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mb-1.5" />
            ) : (
              <Bookmark
                className={`w-5 h-5 mb-1.5 ${
                  actionState.save.status === 'saved' ? 'fill-indigo-500 text-indigo-500' : 'text-zinc-400'
                }`}
              />
            )}
            <span className="text-xs font-bold">
              {actionState.save.status === 'saved' ? 'Saved ✓' : 'Save'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {actionState.save.status === 'saved' ? 'Playlist saved' : 'Save on YouTube'}
            </span>
          </button>
        )}

        {/* 5. SUBSCRIBE */}
        {awaitingSubscribeConfirm ? (
          <button
            type="button"
            onClick={handleConfirmManualSubscribe}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-emerald-500 bg-emerald-500/20 text-emerald-300 text-center animate-pulse transition active:scale-95 col-span-2 sm:col-span-1"
          >
            <Check className="w-5 h-5 mb-1 text-emerald-300" />
            <span className="text-xs font-bold">✓ Subscribed</span>
            <span className="text-[10px] font-mono mt-0.5">Click to confirm</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubscribeClick}
            disabled={actionState.subscribe.status === 'loading'}
            className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition active:scale-95 col-span-2 sm:col-span-1 ${
              actionState.subscribe.status === 'subscribed'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md'
                : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-850'
            }`}
          >
            {actionState.subscribe.status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mb-1.5" />
            ) : (
              <UserPlus
                className={`w-5 h-5 mb-1.5 ${
                  actionState.subscribe.status === 'subscribed' ? 'text-emerald-400' : 'text-zinc-400'
                }`}
              />
            )}
            <span className="text-xs font-bold">
              {actionState.subscribe.status === 'subscribed' ? 'Subscribed ✓' : 'Subscribe'}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {actionState.subscribe.status === 'subscribed' ? 'Subscribed' : 'Subscribe channel'}
            </span>
          </button>
        )}
      </div>

      {/* ACTION AUDIT BAR */}
      <div className="pt-3 border-t border-zinc-800/80 bg-zinc-950/40 rounded-xl p-3">
        <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-semibold block mb-2">
          Action Status Summary
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">❤️ Rating:</span>
            <span className={actionState.like.status === 'liked' ? 'text-rose-400 font-semibold' : 'text-zinc-500'}>
              {actionState.like.status === 'liked' ? 'Liked ✓' : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">💬 Comment:</span>
            <span className={actionState.comment.status === 'posted' ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
              {actionState.comment.status === 'posted' ? 'Posted ✓' : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">↗ Share:</span>
            <span className={actionState.share.status === 'shared' || actionState.share.status === 'copied' ? 'text-blue-400 font-semibold' : 'text-zinc-500'}>
              {actionState.share.status === 'shared' ? 'Shared ✓' : actionState.share.status === 'copied' ? 'Copied ✓' : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">🔖 Saved:</span>
            <span className={actionState.save.status === 'saved' ? 'text-indigo-400 font-semibold' : 'text-zinc-500'}>
              {actionState.save.status === 'saved' ? 'Saved ✓' : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">➕ Subscribe:</span>
            <span className={actionState.subscribe.status === 'subscribed' ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>
              {actionState.subscribe.status === 'subscribed' ? 'Subscribed ✓' : 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
