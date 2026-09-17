import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Copy,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ThumbsUp,
  ExternalLink,
} from 'lucide-react';
import { YouTubeCommentItem, YouTubeAccount } from './youtubeTypes';
import { getComments, postComment } from './youtubeApi';
import { openPlatformUrl } from '../../platforms/browser/openPlatform';

interface YouTubeCommentsSectionProps {
  videoId: string;
  account: YouTubeAccount | null;
  onCommentPosted: (commentId: string, text: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const YouTubeCommentsSection: React.FC<YouTubeCommentsSectionProps> = ({
  videoId,
  account,
  onCommentPosted,
  onShowToast,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [awaitingManualPostConfirm, setAwaitingManualPostConfirm] = useState(false);

  // Comments List
  const [showComments, setShowComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [comments, setComments] = useState<YouTubeCommentItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // AI refinement states
  const [isRefining, setIsRefining] = useState(false);
  const isApiConnected = Boolean(account && account.connected);

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Fetch comments when videoId changes
  useEffect(() => {
    if (!videoId) return;
    loadComments();
  }, [videoId]);

  const loadComments = async (token?: string) => {
    setIsLoadingComments(true);
    setCommentsError(null);
    try {
      const res = await getComments(videoId, token);
      if (res.disabled) {
        setCommentsDisabled(true);
        setComments([]);
      } else {
        setCommentsDisabled(false);
        if (token) {
          setComments((prev) => [...prev, ...res.comments]);
        } else {
          setComments(res.comments);
        }
        setNextPageToken(res.nextPageToken);
      }
    } catch (err: any) {
      // Don't show hard blocking errors
      setCommentsError('Live comment feed requires YouTube API access. You can still test comments manually.');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostApi = async () => {
    if (!isApiConnected) {
      onShowToast('Connect your YouTube account to post directly via API.', 'info');
      return;
    }

    if (!commentText.trim()) {
      onShowToast('Write a comment before posting.', 'error');
      return;
    }

    setIsPosting(true);
    try {
      const res = await postComment(videoId, commentText.trim());
      onShowToast('Comment posted to YouTube • API verified ✓', 'success');
      onCommentPosted(res.commentId, commentText.trim());

      if (res.created) {
        const newCommentItem: YouTubeCommentItem = {
          id: res.commentId,
          authorDisplayName: account?.channelTitle || 'You',
          authorProfileImageUrl: account?.avatarUrl || '',
          textDisplay: commentText.trim(),
          textOriginal: commentText.trim(),
          likeCount: 0,
          publishedAt: new Date().toISOString(),
          totalReplyCount: 0,
        };
        setComments((prev) => [newCommentItem, ...prev]);
      }

      setCommentText('');
      setTimeout(() => loadComments(), 2000);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to post comment via API', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const handleOpenAndCopyForManual = () => {
    if (!commentText.trim()) {
      onShowToast('Enter your draft comment first', 'info');
      return;
    }
    navigator.clipboard.writeText(commentText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    openPlatformUrl(watchUrl);
    setAwaitingManualPostConfirm(true);
    onShowToast('Copied comment & opened YouTube in new tab. Paste on YouTube and click "Confirm Posted" below.', 'info');
  };

  const handleConfirmManualComment = () => {
    const manualId = `manual_comment_${Date.now()}`;
    onCommentPosted(manualId, commentText.trim());
    setAwaitingManualPostConfirm(false);
    onShowToast('💬 Commented • Manual confirmation ✓', 'success');

    // Add to local list
    const newCommentItem: YouTubeCommentItem = {
      id: manualId,
      authorDisplayName: account?.channelTitle || 'Test Account',
      authorProfileImageUrl: account?.avatarUrl || '',
      textDisplay: commentText.trim(),
      textOriginal: commentText.trim(),
      likeCount: 0,
      publishedAt: new Date().toISOString(),
      totalReplyCount: 0,
    };
    setComments((prev) => [newCommentItem, ...prev]);
  };

  const handleCopy = () => {
    if (!commentText) return;
    navigator.clipboard.writeText(commentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('Comment copied to clipboard', 'info');
  };

  // AI Quick Refinement Tools directly modifying the textarea
  const handleAiRefine = async (actionType: 'improve' | 'shorten' | 'clarify' | 'grammar') => {
    if (!commentText.trim()) {
      onShowToast('Write something in the comment box first.', 'info');
      return;
    }

    setIsRefining(true);
    try {
      const res = await fetch('/api/gemini/improve-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalComment: commentText,
          tone: actionType === 'shorten' ? 'short and concise' : actionType === 'clarify' ? 'crystal clear' : 'natural and engaging',
          platform: 'YouTube',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const refined =
          actionType === 'shorten'
            ? data.improved?.optionConcise
            : actionType === 'clarify'
            ? data.improved?.optionNatural
            : data.improved?.optionEngaging || data.improved?.optionNatural;

        if (refined) {
          setCommentText(refined);
          onShowToast(`Refined with AI (${actionType})`, 'success');
        }
      } else {
        onShowToast('AI refinement service unavailable', 'error');
      }
    } catch {
      onShowToast('AI service error', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div id="youtube-comments-section" className="w-full space-y-4">
      {/* 1. WRITE & POST COMMENT BOX */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100">
              Comment Composer & Testing
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-mono text-[11px]">
              {commentText.length}/10,000
            </span>
            {commentText && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:text-white text-zinc-400 transition"
                title="Copy comment text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isPosting || commentsDisabled}
            placeholder={
              commentsDisabled
                ? 'Comments are disabled for this video.'
                : 'Write your comment observation, question, or test text...'
            }
            rows={3}
            className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none resize-none transition"
          />
        </div>

        {/* Action Controls & AI Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* AI Refine buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono text-zinc-500 font-semibold flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Refine:</span>
            </span>
            <button
              type="button"
              disabled={isRefining || !commentText.trim()}
              onClick={() => handleAiRefine('improve')}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition disabled:opacity-40"
            >
              Improve
            </button>
            <button
              type="button"
              disabled={isRefining || !commentText.trim()}
              onClick={() => handleAiRefine('shorten')}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition disabled:opacity-40"
            >
              Shorten
            </button>
            <button
              type="button"
              disabled={isRefining || !commentText.trim()}
              onClick={() => handleAiRefine('clarify')}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition disabled:opacity-40"
            >
              Make Clearer
            </button>
            <button
              type="button"
              disabled={isRefining || !commentText.trim()}
              onClick={() => handleAiRefine('grammar')}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition disabled:opacity-40"
            >
              Fix Grammar
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Manual Browser Post Button */}
            <button
              type="button"
              onClick={handleOpenAndCopyForManual}
              disabled={!commentText.trim()}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Copy & Open YouTube</span>
            </button>

            {awaitingManualPostConfirm && (
              <button
                type="button"
                onClick={handleConfirmManualComment}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 animate-pulse"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Posted</span>
              </button>
            )}

            {/* Direct API Post Button if connected */}
            {isApiConnected && (
              <button
                type="button"
                onClick={handlePostApi}
                disabled={isPosting || !commentText.trim() || commentsDisabled}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post via API</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. COMMENTS FEED */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="w-full p-4 flex items-center justify-between bg-zinc-900/90 hover:bg-zinc-850 text-left transition select-none"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-zinc-200">
              YouTube Public Comments ({comments.length}{nextPageToken ? '+' : ''})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
              {showComments ? 'Hide' : 'Show'}
            </span>
            {showComments ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </div>
        </button>

        {showComments && (
          <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4">
            {isLoadingComments && comments.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-zinc-500 gap-2 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>Loading YouTube comments...</span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {comment.authorProfileImageUrl ? (
                          <img
                            src={comment.authorProfileImageUrl}
                            alt={comment.authorDisplayName}
                            className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                            {comment.authorDisplayName.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-semibold text-zinc-200">
                          {comment.authorDisplayName}
                        </span>
                      </div>

                      {comment.publishedAt && (
                        <span className="text-[11px] font-mono text-zinc-400">
                          {new Date(comment.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 whitespace-pre-wrap pl-8 leading-relaxed">
                      {comment.textDisplay}
                    </p>

                    {comment.likeCount > 0 && (
                      <div className="flex items-center gap-1 pl-8 pt-1 text-[11px] text-zinc-400">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{comment.likeCount}</span>
                      </div>
                    )}
                  </div>
                ))}

                {nextPageToken && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => loadComments(nextPageToken)}
                      disabled={isLoadingComments}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
                    >
                      {isLoadingComments ? 'Loading more...' : 'Load More Comments'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400 text-xs">
                {commentsDisabled
                  ? 'Comments are disabled for this content.'
                  : commentsError || 'No comments found or API unavailable. Use the composer above to test commenting.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
