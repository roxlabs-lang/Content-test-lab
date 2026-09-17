export type Platform =
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'telegram';

export type ContentType =
  | 'video'
  | 'short'
  | 'reel'
  | 'post'
  | 'channel'
  | 'profile'
  | 'page'
  | 'telegram_channel'
  | 'unknown';

export type PlatformFeature =
  | 'embed'
  | 'video_player'
  | 'public_preview'
  | 'external_open'
  | 'comments'
  | 'metadata_detection';

export interface ParsedContent {
  url: string;
  normalizedUrl: string;
  platform: Platform;
  type: ContentType;
  contentId?: string;
  title?: string;
  creator?: string;
  creatorHandle?: string;
  description?: string;
  publishedDate?: string;
  duration?: string;
  thumbnailUrl?: string;
  embedUrl?: string | null;
  canEmbed: boolean;
  supportedFeatures: PlatformFeature[];
}

export type SocialAction =
  | 'like'
  | 'comment'
  | 'share'
  | 'save'
  | 'follow';

export type IntegrationMode = 'browser' | 'api';

export interface ActionRecord {
  status?: 'not_started' | 'opened_platform' | 'user_confirmed' | 'api_confirmed';
  method?: 'manual' | 'api' | 'direct' | 'external';
  completed?: boolean;
  recordedAt?: number;
  timestamp?: number;
  formattedTime?: string;
}

export interface PlatformCapabilities {
  like: boolean;
  comment: boolean;
  share: boolean;
  save: boolean;
  follow: boolean;
  labels: {
    like: string;
    comment: string;
    share: string;
    save: string;
    follow: string;
    liked: string;
    commented: string;
    shared: string;
    saved: string;
    followed: string;
  };
}

export interface ActionTimestamps {
  watchedAt?: string;
  likedAt?: string;
  commentedAt?: string;
  sharedAt?: string;
  followedAt?: string;
  savedAt?: string;
}

export interface TestAccount {
  id: string;
  platform: Platform;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  profilePicture?: string;
  email?: string;
  bio?: string;
  notes?: string;
  mode: 'manual' | 'api';
  isActive: boolean;
  status?: 'connected' | 'needs_reauth' | 'disconnected';
  sessionTokenRef?: string;
  sessionExpiresAt?: string;
  createdAt: number | string;
  updatedAt: number | string;
}

export interface ContentItem {
  id: string;
  url: string;
  normalizedUrl?: string;
  platform: Platform;
  type: ContentType;
  contentType?: ContentType | string;
  title?: string;
  creator?: string;
  creatorHandle?: string;
  description?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  publishedDate?: string;
  duration?: string;
  dateAdded?: string;
  createdAt: number | string;
  isBookmarked?: boolean;
}

export interface ExperimentReference {
  id: string;
  experimentId: string;
  imageUrl: string;
  caption?: string;
  createdAt: number;
}

export interface WorkspaceSession {
  activeAccountId?: string;
  activeContentId?: string;
  activeExperimentId?: string;
  currentUrl?: string;
  openedAt: number;
}

export interface Experiment {
  id: string;
  experimentNumber?: string;
  contentId: string;
  testAccountId?: string;

  // Interaction logs (manual toggles)
  watched: boolean;
  liked: boolean;
  commented: boolean;
  shared: boolean;
  followed: boolean;
  saved: boolean;

  // Interaction timestamps (when user recorded action in lab)
  actionTimestamps?: ActionTimestamps;

  // Actions object with ActionRecord details and legacy flags
  actions?: {
    watched?: boolean | ActionRecord;
    liked?: boolean | ActionRecord;
    like?: ActionRecord;
    commented?: boolean | ActionRecord;
    comment?: ActionRecord;
    shared?: boolean | ActionRecord;
    share?: ActionRecord;
    followed?: boolean | ActionRecord;
    follow?: ActionRecord;
    saved?: boolean | ActionRecord;
    save?: ActionRecord;
  };

  // Comment drafting
  commentDraft?: string | { text: string; savedAt?: string; posted?: boolean; postedAt?: string };
  commentPosted?: boolean;

  // Real YouTube integration tracking
  youtubeDetails?: {
    videoId?: string;
    channelId?: string;
    initialStats?: {
      viewCount?: number;
      likeCount?: number;
      commentCount?: number;
      capturedAt: number;
    };
    latestStats?: {
      viewCount?: number;
      likeCount?: number;
      commentCount?: number;
      fetchedAt: number;
    };
    playbackStartedAt?: number;
    myRating?: 'like' | 'none';
    likedAt?: number;
    commentId?: string;
    commentText?: string;
    commentPostedAt?: number;
    savedPlaylistId?: string;
    savedPlaylistTitle?: string;
    savedAt?: number;
    subscriptionId?: string;
    subscribedAt?: number;
    sharedMethod?: 'native_share' | 'copied';
    sharedAt?: number;
  };

  // Research fields (structured and autosaved)
  hook?: string;
  firstImpression?: string;
  opening?: string; // first 3 seconds
  visuals?: string;
  editing?: string;
  pacing?: string;
  audio?: string;
  caption?: string;
  cta?: string;
  audience?: string;
  whatWorked?: string;
  whatDidnt?: string;
  recreationIdea?: string;
  observations?: string;
  randomObservations?: string;

  // Legacy research object compatibility
  research?: {
    hook?: string;
    first3Seconds?: string;
    topic?: string;
    format?: string;
    editingStyle?: string;
    caption?: string;
    captionStrategy?: string;
    cta?: string;
    ctaStrategy?: string;
    thumbnailNotes?: string;
    musicAudio?: string;
    visualStyle?: string;
    observations?: {
      attentionGrabber?: string;
      whatWorked?: string;
      whatDidnt?: string;
      whatCouldRecreate?: string;
      whatLearned?: string;
    };
  };

  rating?: number;
  personalRating?: number;
  startedAt?: string;
  completedAt?: string;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  generalNotes?: string;
  aiAnalysis?: AIContentAnalysisResult | any;
  tags: string[];

  createdAt: number | string;
  updatedAt: number | string;

  // Associated hydrated content (for fast UI rendering)
  content?: ContentItem;
}

export interface ResearchNote {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  updatedAt: number | string;
}

export interface AIContentAnalysisResult {
  hookBreakdown: string;
  openingPacing: string;
  storyStructure: string;
  editingAndVisualPattern: string;
  captionAndCtaAnalysis: string;
  audienceAppeal: string;
  commentThemesPrediction: string;
  contentFormatType: string;
  engagementDrivers: string[];
  observedFacts: string[];
  aiInterpretations: string[];
  analyzedAt: string;
  modelName: string;
}

export type ContentResearchAnalysis = any;

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

