import {
  YouTubeVideoData,
  YouTubeAccount,
  YouTubeConfig,
  YouTubeCommentItem,
} from './youtubeTypes';

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Include credentials for cookies across requests
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    if (isJson) {
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || errorDetail;
      } catch {}
    } else {
      const text = await response.text();
      if (text) errorDetail = text;
    }

    const error: any = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  return (isJson ? response.json() : response.text()) as Promise<T>;
}

export async function getYouTubeConfig(): Promise<YouTubeConfig> {
  return apiFetch<YouTubeConfig>('/api/youtube/config');
}

export async function getYouTubeAccount(): Promise<YouTubeAccount> {
  return apiFetch<YouTubeAccount>('/api/youtube/account');
}

export async function disconnectYouTubeAccount(): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/api/youtube/auth/disconnect', {
    method: 'POST',
  });
}

export async function getVideo(videoId: string): Promise<{ success: boolean; video: YouTubeVideoData }> {
  return apiFetch<{ success: boolean; video: YouTubeVideoData }>(`/api/youtube/videos/${encodeURIComponent(videoId)}`);
}

export async function getMyRating(videoId: string): Promise<{ success: boolean; rating: 'like' | 'dislike' | 'none' }> {
  return apiFetch<{ success: boolean; rating: 'like' | 'dislike' | 'none' }>(`/api/youtube/videos/${encodeURIComponent(videoId)}/rating`);
}

export async function rateVideo(videoId: string, rating: 'like' | 'none'): Promise<{
  success: boolean;
  videoId: string;
  rating: 'like' | 'none';
  confirmedAt: number;
  notice?: string;
}> {
  return apiFetch<{
    success: boolean;
    videoId: string;
    rating: 'like' | 'none';
    confirmedAt: number;
    notice?: string;
  }>(`/api/youtube/videos/${encodeURIComponent(videoId)}/rate`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

export async function getComments(
  videoId: string,
  pageToken?: string
): Promise<{
  success: boolean;
  disabled: boolean;
  comments: YouTubeCommentItem[];
  nextPageToken?: string;
}> {
  const params = new URLSearchParams();
  if (pageToken) {
    params.set('pageToken', pageToken);
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<{
    success: boolean;
    disabled: boolean;
    comments: YouTubeCommentItem[];
    nextPageToken?: string;
  }>(`/api/youtube/videos/${encodeURIComponent(videoId)}/comments${query}`);
}

export async function postComment(
  videoId: string,
  text: string
): Promise<{
  success: boolean;
  commentId: string;
  text: string;
  postedAt: number;
  method: string;
  created: any;
}> {
  return apiFetch<{
    success: boolean;
    commentId: string;
    text: string;
    postedAt: number;
    method: string;
    created: any;
  }>(`/api/youtube/videos/${encodeURIComponent(videoId)}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function getChannelSubscription(
  channelId: string
): Promise<{ success: boolean; isSubscribed: boolean; subscriptionId?: string }> {
  return apiFetch<{ success: boolean; isSubscribed: boolean; subscriptionId?: string }>(
    `/api/youtube/channels/${encodeURIComponent(channelId)}/subscription`
  );
}

export async function subscribeChannel(
  channelId: string
): Promise<{ success: boolean; subscribedAt: number; channelId: string; subscriptionId: string }> {
  return apiFetch<{ success: boolean; subscribedAt: number; channelId: string; subscriptionId: string }>(
    `/api/youtube/channels/${encodeURIComponent(channelId)}/subscribe`,
    {
      method: 'POST',
    }
  );
}

export async function saveVideo(
  videoId: string
): Promise<{
  success: boolean;
  savedAt: number;
  videoId: string;
  playlistId: string;
  playlistTitle: string;
  itemId: string;
}> {
  return apiFetch<{
    success: boolean;
    savedAt: number;
    videoId: string;
    playlistId: string;
    playlistTitle: string;
    itemId: string;
  }>(`/api/youtube/videos/${encodeURIComponent(videoId)}/save`, {
    method: 'POST',
  });
}
