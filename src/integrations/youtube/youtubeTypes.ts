export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description?: string;
  channelId?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  embeddable?: boolean;
}

export interface YouTubeAccount {
  connected: boolean;
  channelId?: string | null;
  channelTitle?: string | null;
  channelHandle?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  sessionId?: string;
  expired?: boolean;
}

export interface YouTubeConfig {
  configured: boolean;
  hasApiKey: boolean;
  clientIdConfigured: boolean;
  redirectUri: string;
  environmentKeysNeeded: string[];
}

export interface YouTubeCommentItem {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl?: string;
  textDisplay: string;
  textOriginal?: string;
  likeCount: number;
  publishedAt: string;
  totalReplyCount?: number;
}

export interface YouTubeActionState {
  like: {
    status: 'unknown' | 'loading' | 'liked' | 'not_liked' | 'error';
    error?: string;
  };
  comment: {
    status: 'idle' | 'posting' | 'posted' | 'error';
    commentId?: string;
    postedAt?: number;
    text?: string;
    error?: string;
  };
  share: {
    status: 'idle' | 'sharing' | 'shared' | 'copied' | 'error';
    sharedAt?: number;
  };
  save: {
    status: 'unknown' | 'saving' | 'saved' | 'not_saved' | 'error';
    playlistId?: string;
    playlistTitle?: string;
    savedAt?: number;
    error?: string;
  };
  subscribe: {
    status: 'unknown' | 'loading' | 'subscribed' | 'not_subscribed' | 'error';
    subscriptionId?: string;
    subscribedAt?: number;
    error?: string;
  };
  playback: {
    status: 'not_started' | 'playing' | 'paused' | 'ended';
    startedAt?: number;
  };
}

export interface YouTubeExperimentRecord {
  videoId: string;
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
  actions: {
    liked?: {
      confirmedAt: number;
    };
    commentPosted?: {
      commentId: string;
      text: string;
      confirmedAt: number;
    };
    savedToPlaylist?: {
      playlistId: string;
      playlistTitle?: string;
      confirmedAt: number;
    };
    subscribed?: {
      subscriptionId: string;
      channelId?: string;
      confirmedAt: number;
    };
    shared?: {
      method: 'native_share' | 'copied';
      confirmedAt: number;
    };
  };
}
