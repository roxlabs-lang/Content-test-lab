export interface ParsedYouTubeInfo {
  type: 'video' | 'short' | 'channel' | 'unknown';
  videoId?: string;
  channelId?: string;
  channelHandle?: string;
  canonicalUrl: string;
  isValid: boolean;
}

export function parseYouTubeUrl(rawUrl: string): ParsedYouTubeInfo {
  const url = (rawUrl || '').trim();
  if (!url) {
    return {
      type: 'unknown',
      canonicalUrl: '',
      isValid: false,
    };
  }

  try {
    // Normalise missing protocol
    const normalized = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;

    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname;

    const isYouTubeHost = host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be';
    if (!isYouTubeHost) {
      return {
        type: 'unknown',
        canonicalUrl: url,
        isValid: false,
      };
    }

    // 1. Shorts: youtube.com/shorts/VIDEO_ID
    if (pathname.includes('/shorts/')) {
      const parts = pathname.split('/shorts/');
      const videoId = parts[1]?.split('/')[0]?.split('?')[0];
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          type: 'short',
          videoId,
          canonicalUrl: `https://www.youtube.com/shorts/${videoId}`,
          isValid: true,
        };
      }
    }

    // 2. Standard Watch: youtube.com/watch?v=VIDEO_ID
    if (pathname === '/watch' || pathname === '/watch/') {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return {
          type: 'video',
          videoId: v,
          canonicalUrl: `https://www.youtube.com/watch?v=${v}`,
          isValid: true,
        };
      }
    }

    // 3. Shortened URL: youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const videoId = pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          type: 'video',
          videoId,
          canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
          isValid: true,
        };
      }
    }

    // 4. Embedded: youtube.com/embed/VIDEO_ID
    if (pathname.startsWith('/embed/')) {
      const videoId = pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return {
          type: 'video',
          videoId,
          canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
          isValid: true,
        };
      }
    }

    // 5. Handles: youtube.com/@handle
    if (pathname.startsWith('/@')) {
      const handle = pathname.split('/')[1]?.split('?')[0];
      if (handle) {
        return {
          type: 'channel',
          channelHandle: handle,
          canonicalUrl: `https://www.youtube.com/${handle}`,
          isValid: true,
        };
      }
    }

    // 6. Channel: youtube.com/channel/CHANNEL_ID
    if (pathname.startsWith('/channel/')) {
      const channelId = pathname.split('/channel/')[1]?.split('/')[0]?.split('?')[0];
      if (channelId) {
        return {
          type: 'channel',
          channelId,
          canonicalUrl: `https://www.youtube.com/channel/${channelId}`,
          isValid: true,
        };
      }
    }

    // Direct 11-char video ID pasted directly
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return {
        type: 'video',
        videoId: url,
        canonicalUrl: `https://www.youtube.com/watch?v=${url}`,
        isValid: true,
      };
    }
  } catch (e) {
    // Malformed URL
  }

  return {
    type: 'unknown',
    canonicalUrl: url,
    isValid: false,
  };
}
