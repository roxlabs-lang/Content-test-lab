import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Bookmark,
  FileText,
  MessageSquare,
  Image,
  Tag,
  Share2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  Flame,
  Plus,
  Play,
  Heart,
  UserPlus
} from 'lucide-react';
import {
  Experiment,
  ContentItem,
  ParsedContent,
  TestAccount,
  SocialAction,
  ActionRecord,
  ActionTimestamps,
} from '../types';
import { UrlBar } from '../components/workspace/UrlBar';
import { NotesEditor } from '../components/workspace/NotesEditor';
import { ReferenceGallery } from '../components/workspace/ReferenceGallery';
import { TagManager } from '../components/workspace/TagManager';
import { QuickCaptureModal } from '../components/workspace/QuickCaptureModal';
import { AccountSwitcher } from '../components/AccountSwitcher';
import { AccountCreationModal } from '../components/AccountCreationModal';
import { parseContentUrl } from '../platforms/platformRegistry';
import {
  getExperiments,
  getExperimentById,
  createExperimentFromUrl,
  saveExperiment,
} from '../services/experimentService';
import {
  getWorkspaceSession,
  saveWorkspaceSession,
} from '../services/sessionService';
import { useActiveAccount } from '../context/ActiveAccountContext';
import { useToast } from '../context/ToastContext';

// Real YouTube Integration Modules
import { parseYouTubeUrl } from '../integrations/youtube/youtubeParser';
import {
  getYouTubeAccount,
  getYouTubeConfig,
  getVideo,
  getMyRating,
  getChannelSubscription,
} from '../integrations/youtube/youtubeApi';
import {
  YouTubeAccount,
  YouTubeConfig,
  YouTubeVideoData,
  YouTubeActionState,
} from '../integrations/youtube/youtubeTypes';
import { YouTubeAccountCard } from '../integrations/youtube/YouTubeAccountCard';
import { YouTubePlayer } from '../integrations/youtube/YouTubePlayer';
import { YouTubePublicStats } from '../integrations/youtube/YouTubePublicStats';
import { YouTubeActions } from '../integrations/youtube/YouTubeActions';
import { YouTubeCommentsSection } from '../integrations/youtube/YouTubeCommentsSection';

interface WorkspaceProps {
  initialExperimentId?: string;
  onNavigateToExperiments?: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  initialExperimentId,
  onNavigateToExperiments,
}) => {
  const { activeAccount } = useActiveAccount();
  const { showToast } = useToast();

  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [activeParsed, setActiveParsed] = useState<ParsedContent | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  // YouTube Live Integration State
  const [ytAccount, setYtAccount] = useState<YouTubeAccount | null>(null);
  const [ytConfig, setYtConfig] = useState<YouTubeConfig | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [ytVideo, setYtVideo] = useState<YouTubeVideoData | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [lastStatsUpdated, setLastStatsUpdated] = useState<number | undefined>();
  const [initialViewCount, setInitialViewCount] = useState<number | undefined>();

  // Real YouTube Action State Model (Requirement #18)
  const [actionState, setActionState] = useState<YouTubeActionState>({
    like: { status: 'unknown' },
    comment: { status: 'idle' },
    share: { status: 'idle' },
    save: { status: 'unknown' },
    subscribe: { status: 'unknown' },
    playback: { status: 'not_started' },
  });

  // Collapsed sections (Collapsed by default per instructions)
  const [isResearchExpanded, setIsResearchExpanded] = useState(false);
  const [isExtrasExpanded, setIsExtrasExpanded] = useState(false);
  const [extrasTab, setExtrasTab] = useState<'references' | 'tags'>('references');

  // Load YouTube Config and Authenticated Account
  useEffect(() => {
    async function loadAccount() {
      setIsLoadingAccount(true);
      try {
        const [configRes, accountRes] = await Promise.all([
          getYouTubeConfig().catch(() => null),
          getYouTubeAccount().catch(() => null),
        ]);
        if (configRes) setYtConfig(configRes);
        if (accountRes && accountRes.connected) {
          setYtAccount(accountRes);
        } else {
          setYtAccount(null);
        }
      } catch (err) {
        console.warn('Error loading YouTube session:', err);
      } finally {
        setIsLoadingAccount(false);
      }
    }
    loadAccount();
  }, []);

  // Sync YouTube Video and Rating when currentExperiment changes
  useEffect(() => {
    if (!currentExperiment?.content?.url) return;

    const ytParsed = parseYouTubeUrl(currentExperiment.content.url);
    if (ytParsed.isValid && ytParsed.videoId) {
      loadYouTubeVideoData(ytParsed.videoId);
    } else {
      setYtVideo(null);
    }
  }, [currentExperiment?.id, currentExperiment?.content?.url]);

  // Load Video details and verified ratings from YouTube API
  const loadYouTubeVideoData = async (videoId: string) => {
    try {
      const res = await getVideo(videoId);
      if (res.success && res.video) {
        setYtVideo(res.video);
        setLastStatsUpdated(Date.now());

        // Set or restore initial view count
        if (currentExperiment?.youtubeDetails?.initialStats?.viewCount !== undefined) {
          setInitialViewCount(currentExperiment.youtubeDetails.initialStats.viewCount);
        } else if (res.video.viewCount !== undefined) {
          setInitialViewCount(res.video.viewCount);
        }

        // Check if playback was already recorded
        if (currentExperiment?.youtubeDetails?.playbackStartedAt || currentExperiment?.watched) {
          setActionState((prev) => ({
            ...prev,
            playback: {
              status: 'playing',
              startedAt: currentExperiment?.youtubeDetails?.playbackStartedAt,
            },
          }));
        }

        // Restore comment state from experiment record if confirmed
        if (currentExperiment?.youtubeDetails?.commentId) {
          setActionState((prev) => ({
            ...prev,
            comment: {
              status: 'posted',
              commentId: currentExperiment.youtubeDetails?.commentId,
              postedAt: currentExperiment.youtubeDetails?.commentPostedAt,
              text: currentExperiment.youtubeDetails?.commentText,
            },
          }));
        }

        // If YouTube account is connected, fetch user rating and channel subscription
        if (ytAccount && ytAccount.connected) {
          checkConnectedAccountStatus(videoId, res.video.channelId);
        }
      }
    } catch (err: any) {
      console.error('Failed to load YouTube video data:', err);
    }
  };

  const checkConnectedAccountStatus = async (videoId: string, channelId?: string) => {
    try {
      const ratingRes = await getMyRating(videoId).catch(() => null);
      if (ratingRes && ratingRes.success) {
        setActionState((prev) => ({
          ...prev,
          like: {
            status: ratingRes.rating === 'like' ? 'liked' : 'not_liked',
          },
        }));
      }

      if (channelId) {
        const subRes = await getChannelSubscription(channelId).catch(() => null);
        if (subRes && subRes.success) {
          setActionState((prev) => ({
            ...prev,
            subscribe: {
              status: subRes.isSubscribed ? 'subscribed' : 'not_subscribed',
              subscriptionId: subRes.subscriptionId,
            },
          }));
        }
      }
    } catch (err) {
      console.warn('Error checking connected account states:', err);
    }
  };

  // Re-check rating and subscription if ytAccount changes
  useEffect(() => {
    if (ytAccount && ytAccount.connected && ytVideo) {
      checkConnectedAccountStatus(ytVideo.videoId, ytVideo.channelId);
    }
  }, [ytAccount?.connected, ytVideo?.videoId]);

  // Load initial experiment or restore from session
  useEffect(() => {
    async function initWorkspace() {
      if (initialExperimentId) {
        const found = await getExperimentById(initialExperimentId);
        if (found) {
          setCurrentExperiment(found);
          if (found.content?.url) {
            setActiveParsed(parseContentUrl(found.content.url));
          }
          saveWorkspaceSession({
            activeExperimentId: found.id,
            activeContentId: found.contentId,
            currentUrl: found.content?.url,
          });
          return;
        }
      }

      // Check persisted session
      const session = getWorkspaceSession();
      if (session.activeExperimentId) {
        const found = await getExperimentById(session.activeExperimentId);
        if (found) {
          setCurrentExperiment(found);
          if (found.content?.url) {
            setActiveParsed(parseContentUrl(found.content.url));
          }
          return;
        }
      }

      // Default to most recent experiment if available
      const all = await getExperiments();
      if (all.length > 0) {
        setCurrentExperiment(all[0]);
        if (all[0].content?.url) {
          setActiveParsed(parseContentUrl(all[0].content.url));
        }
        saveWorkspaceSession({
          activeExperimentId: all[0].id,
          activeContentId: all[0].contentId,
          currentUrl: all[0].content?.url,
        });
      }
    }

    initWorkspace();
  }, [initialExperimentId]);

  // Handle URL opening from URL bar or recent items
  const handleOpenUrl = async (rawUrl: string) => {
    const cleanUrl = rawUrl.trim();
    if (!cleanUrl) return;

    setIsLoadingUrl(true);
    try {
      const parsed = parseContentUrl(cleanUrl);
      setActiveParsed(parsed);

      // Check if experiment already exists or create new
      const exp = await createExperimentFromUrl(cleanUrl, activeAccount?.id);
      setCurrentExperiment(exp);

      // Reset action states for fresh content
      setActionState({
        like: { status: 'unknown' },
        comment: { status: 'idle' },
        share: { status: 'idle' },
        save: { status: 'unknown' },
        subscribe: { status: 'unknown' },
        playback: { status: 'not_started' },
      });
      setInitialViewCount(undefined);

      saveWorkspaceSession({
        activeExperimentId: exp.id,
        activeContentId: exp.contentId,
        currentUrl: cleanUrl,
        activeAccountId: activeAccount?.id,
      });

      showToast(`Loaded ${parsed.platform} content in workspace`, 'success');
    } catch (err) {
      showToast('Failed to parse or open content URL', 'error');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleSelectRecent = (recentItem: ParsedContent) => {
    handleOpenUrl(recentItem.normalizedUrl || recentItem.url);
  };

  const handleUpdateExperiment = async (updated: Experiment) => {
    try {
      const saved = await saveExperiment(updated);
      setCurrentExperiment(saved);
      saveWorkspaceSession({
        activeExperimentId: saved.id,
        activeContentId: saved.contentId,
        currentUrl: saved.content?.url,
      });
    } catch (err) {
      console.error('Failed to update experiment:', err);
    }
  };

  // Playback started by native user interaction on YouTube player
  const handlePlaybackStarted = async () => {
    if (!currentExperiment) return;

    const startedAt = Date.now();
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActionState((prev) => ({
      ...prev,
      playback: { status: 'playing', startedAt },
    }));

    // Record initial view count if not yet set
    const currentViews = ytVideo?.viewCount;
    if (initialViewCount === undefined && currentViews !== undefined) {
      setInitialViewCount(currentViews);
    }

    const updated: Experiment = {
      ...currentExperiment,
      watched: true,
      actionTimestamps: {
        ...(currentExperiment.actionTimestamps || {}),
        watchedAt: formattedTime,
      },
      youtubeDetails: {
        ...(currentExperiment.youtubeDetails || {}),
        videoId: ytVideo?.videoId,
        channelId: ytVideo?.channelId,
        playbackStartedAt: startedAt,
        initialStats: {
          viewCount: initialViewCount ?? currentViews,
          likeCount: ytVideo?.likeCount,
          commentCount: ytVideo?.commentCount,
          capturedAt: startedAt,
        },
      },
      updatedAt: Date.now(),
    };

    await handleUpdateExperiment(updated);
    showToast('Playback registered ✓ User initiated playback', 'info');
  };

  // Refresh YouTube public statistics
  const handleRefreshStats = async () => {
    if (!ytVideo?.videoId) return;

    setIsRefreshingStats(true);
    try {
      const res = await getVideo(ytVideo.videoId);
      if (res.success && res.video) {
        setYtVideo(res.video);
        setLastStatsUpdated(Date.now());

        if (currentExperiment) {
          const updated: Experiment = {
            ...currentExperiment,
            youtubeDetails: {
              ...(currentExperiment.youtubeDetails || {}),
              latestStats: {
                viewCount: res.video.viewCount,
                likeCount: res.video.likeCount,
                commentCount: res.video.commentCount,
                fetchedAt: Date.now(),
              },
            },
            updatedAt: Date.now(),
          };
          await handleUpdateExperiment(updated);
        }

        showToast('YouTube stats refreshed from API ✓', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to refresh YouTube stats', 'error');
    } finally {
      setIsRefreshingStats(false);
    }
  };

  // Confirmed real action persistence (saves real outcome into experiment database)
  const handleActionConfirmed = async (actionName: string, detail: any) => {
    if (!currentExperiment) return;

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const ytDetails = { ...(currentExperiment.youtubeDetails || {}) };
    const timestamps = { ...(currentExperiment.actionTimestamps || {}) };

    if (actionName === 'like') {
      const isLiked = detail.rating === 'like';
      ytDetails.myRating = detail.rating;
      if (isLiked) {
        ytDetails.likedAt = detail.confirmedAt || Date.now();
        timestamps.likedAt = formattedTime;
      } else {
        delete ytDetails.likedAt;
        delete timestamps.likedAt;
      }
      currentExperiment.liked = isLiked;
    } else if (actionName === 'comment') {
      ytDetails.commentId = detail.commentId;
      ytDetails.commentText = detail.text;
      ytDetails.commentPostedAt = detail.postedAt || Date.now();
      timestamps.commentedAt = formattedTime;
      currentExperiment.commented = true;
      currentExperiment.commentPosted = true;
    } else if (actionName === 'save') {
      ytDetails.savedPlaylistId = detail.playlistId;
      ytDetails.savedPlaylistTitle = detail.playlistTitle || 'Content Test Lab Saves';
      ytDetails.savedAt = detail.confirmedAt || Date.now();
      timestamps.savedAt = formattedTime;
      currentExperiment.saved = true;
    } else if (actionName === 'subscribe') {
      ytDetails.subscriptionId = detail.subscriptionId;
      ytDetails.subscribedAt = detail.confirmedAt || Date.now();
      timestamps.followedAt = formattedTime;
      currentExperiment.followed = true;
    } else if (actionName === 'share') {
      ytDetails.sharedMethod = detail.method;
      ytDetails.sharedAt = Date.now();
      timestamps.sharedAt = formattedTime;
      currentExperiment.shared = true;
    }

    const updated: Experiment = {
      ...currentExperiment,
      actionTimestamps: timestamps,
      youtubeDetails: ytDetails,
      updatedAt: Date.now(),
    };

    await handleUpdateExperiment(updated);
  };

  const handleSaveNotes = (notesUpdate: Partial<Experiment>) => {
    if (!currentExperiment) return;
    handleUpdateExperiment({
      ...currentExperiment,
      ...notesUpdate,
      updatedAt: Date.now(),
    });
  };

  const currentUrl = currentExperiment?.content?.url || '';
  const parsedYt = currentUrl ? parseYouTubeUrl(currentUrl) : null;
  const isYouTubeContent = Boolean(parsedYt && parsedYt.isValid);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6 pb-12">
      {/* 1. YOUTUBE ACCOUNT CARD (Real OAuth 2.0 Connection) */}
      <div className="w-full">
        <YouTubeAccountCard
          account={ytAccount}
          config={ytConfig}
          isLoading={isLoadingAccount}
          onAccountUpdated={(acc) => setYtAccount(acc)}
          onShowToast={showToast}
        />
      </div>

      {/* 2. PASTE URL BAR */}
      <div className="w-full">
        <UrlBar
          currentUrl={currentUrl}
          activeParsed={activeParsed}
          isLoading={isLoadingUrl}
          onOpenUrl={handleOpenUrl}
          onSelectRecent={handleSelectRecent}
        />
      </div>

      {/* 3. VIDEO AREA (REAL YOUTUBE PLAYER OR GENERIC FALLBACK) */}
      {isYouTubeContent && parsedYt?.videoId ? (
        <div className="w-full space-y-4">
          {/* Real YouTube IFrame Player with Native Play Event Detection */}
          <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
            <YouTubePlayer
              videoId={parsedYt.videoId}
              isShort={parsedYt.type === 'short'}
              playbackStarted={actionState.playback.status === 'playing'}
              playbackStartedAt={actionState.playback.startedAt}
              onPlaybackStarted={handlePlaybackStarted}
            />

            {/* Video Title and Creator Metadata */}
            {ytVideo && (
              <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-zinc-100 leading-snug">
                    {ytVideo.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span className="text-indigo-400 font-semibold">{ytVideo.channelTitle || 'Channel'}</span>
                    {ytVideo.publishedAt && (
                      <>
                        <span>•</span>
                        <span>{new Date(ytVideo.publishedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${ytVideo.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium self-start sm:self-center shrink-0 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in YouTube</span>
                </a>
              </div>
            )}
          </div>

          {/* YouTube Public Stats & Verified View Tracking */}
          <YouTubePublicStats
            video={ytVideo}
            initialViewCount={initialViewCount}
            playbackStarted={actionState.playback.status === 'playing'}
            isRefreshing={isRefreshingStats}
            lastUpdated={lastStatsUpdated}
            onRefresh={handleRefreshStats}
          />

          {/* 4. YOUTUBE ACTIONS (Like, Comment, Share, Save, Subscribe) */}
          {ytVideo && (
            <YouTubeActions
              video={ytVideo}
              account={ytAccount}
              actionState={actionState}
              onUpdateActionState={setActionState}
              onFocusComment={() => {
                const el = document.getElementById('youtube-comments-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onShowToast={showToast}
              onActionConfirmed={handleActionConfirmed}
            />
          )}

          {/* 5. COMMENTS (Direct Post + Live YouTube Comment Feed) */}
          {ytVideo && (
            <YouTubeCommentsSection
              videoId={ytVideo.videoId}
              account={ytAccount}
              onCommentPosted={(commentId, text) => {
                setActionState((prev) => ({
                  ...prev,
                  comment: {
                    status: 'posted',
                    commentId,
                    postedAt: Date.now(),
                    text,
                  },
                }));
                handleActionConfirmed('comment', { commentId, text, postedAt: Date.now() });
                // Refresh public comment count after posting
                setTimeout(handleRefreshStats, 3000);
              }}
              onShowToast={showToast}
            />
          )}
        </div>
      ) : (
        /* If URL is empty or non-YouTube */
        <div className="w-full rounded-2xl bg-zinc-900/30 border border-zinc-800/80 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto">
            <Play className="w-6 h-6 fill-red-500" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-200">
              Ready for YouTube Content Testing
            </h3>
            <p className="text-xs text-zinc-400">
              Paste any YouTube video or Short URL above to load the live player, verify public view tracking, and test real likes, comments, subscriptions, and saves.
            </p>
          </div>
        </div>
      )}

      {/* 6. COLLAPSED BY DEFAULT: RESEARCH NOTES (Secondary, per Requirement #20) */}
      {currentExperiment && (
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden transition-all mt-6">
          <button
            type="button"
            id="btn-toggle-research-notes"
            onClick={() => setIsResearchExpanded(!isResearchExpanded)}
            className="w-full p-4 flex items-center justify-between bg-zinc-900/70 hover:bg-zinc-850 text-left transition select-none"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                  Research Notes & Structured Observations
                </span>
                <span className="text-[11px] font-mono text-zinc-400 block mt-0.5">
                  Optional qualitative breakdown
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400 font-medium hidden sm:inline">
                {isResearchExpanded ? 'Collapse' : 'Expand'}
              </span>
              {isResearchExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {isResearchExpanded && (
            <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4 animate-in fade-in duration-200">
              <NotesEditor
                experiment={currentExperiment}
                onSaveNotes={handleSaveNotes}
              />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        activeAccount={activeAccount}
        onClose={() => setIsQuickCaptureOpen(false)}
        onExperimentSaved={async (experimentId, openInWorkspace) => {
          if (openInWorkspace) {
            const exp = await getExperimentById(experimentId);
            if (exp) {
              setCurrentExperiment(exp);
              if (exp.content?.url) {
                setActiveParsed(parseContentUrl(exp.content.url));
              }
              saveWorkspaceSession({
                activeExperimentId: exp.id,
                activeContentId: exp.contentId,
                currentUrl: exp.content?.url,
              });
            }
          }
        }}
      />

      <AccountCreationModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onAccountCreated={() => {
          setIsCreateAccountOpen(false);
          showToast('Account created & activated', 'success');
        }}
      />
    </div>
  );
};
