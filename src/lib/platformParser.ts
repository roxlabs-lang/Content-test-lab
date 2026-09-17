import { Platform, ContentType } from '../types';

export interface ParsedPlatformResult {
  platform: Platform;
  type: ContentType;
  valid: boolean;
  creator?: string;
  creatorHandle?: string;
  title?: string;
  embedUrl?: string;
  cleanUrl: string;
  error?: string;
}

/**
 * Robust, centralized platform URL parser.
 * Extracts platform, content format type, creator handle, and optional embed URL.
 * Handles malformed input gracefully without crashing.
 */
export function parsePlatformUrl(rawUrl: string): ParsedPlatformResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      platform: 'youtube',
      type: 'unknown',
      valid: false,
      cleanUrl: '',
      error: 'Please enter a valid URL.'
    };
  }

  const trimmed = rawUrl.trim();
  let urlObj: URL;

  try {
    // Add protocol if missing
    const withProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    urlObj = new URL(withProtocol);
  } catch {
    return {
      platform: 'youtube',
      type: 'unknown',
      valid: false,
      cleanUrl: trimmed,
      error: "This URL isn't recognized."
    };
  }

  const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // --- 1. YOUTUBE ---
  if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'music.youtube.com' ||
    hostname === 'youtu.be'
  ) {
    if (pathname.includes('/shorts/')) {
      const shortId = pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
      return {
        platform: 'youtube',
        type: 'short',
        valid: true,
        title: shortId ? `YouTube Short (${shortId})` : 'YouTube Short',
        embedUrl: shortId ? `https://www.youtube.com/embed/${shortId}` : undefined,
        cleanUrl: urlObj.toString()
      };
    }

    if (pathname.includes('/watch') || searchParams.has('v')) {
      const videoId = searchParams.get('v') || pathname.split('/watch/')[1]?.split('/')[0];
      return {
        platform: 'youtube',
        type: 'video',
        valid: Boolean(videoId),
        title: videoId ? `YouTube Video (${videoId})` : 'YouTube Video',
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : undefined,
        cleanUrl: urlObj.toString()
      };
    }

    if (hostname === 'youtu.be') {
      const videoId = pathname.replace(/^\//, '').split('?')[0];
      return {
        platform: 'youtube',
        type: 'video',
        valid: Boolean(videoId),
        title: videoId ? `YouTube Video (${videoId})` : 'YouTube Video',
        embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : undefined,
        cleanUrl: urlObj.toString()
      };
    }

    if (pathname.includes('/@')) {
      const handle = pathname.split('/')[1]?.split('?')[0];
      const name = handle.replace(/^@/, '');
      return {
        platform: 'youtube',
        type: 'channel',
        valid: true,
        creator: name,
        creatorHandle: handle,
        title: `${handle} Channel`,
        cleanUrl: urlObj.toString()
      };
    }

    if (pathname.includes('/channel/') || pathname.includes('/c/')) {
      const channelId = pathname.split(/\/channel\/|\/c\//)[1]?.split('/')[0];
      return {
        platform: 'youtube',
        type: 'channel',
        valid: true,
        creator: channelId || 'Creator',
        creatorHandle: `@${channelId || 'channel'}`,
        title: `YouTube Channel (${channelId || 'channel'})`,
        cleanUrl: urlObj.toString()
      };
    }

    return {
      platform: 'youtube',
      type: 'video',
      valid: true,
      title: 'YouTube Content',
      cleanUrl: urlObj.toString()
    };
  }

  // --- 2. INSTAGRAM ---
  if (hostname === 'instagram.com' || hostname === 'instagr.am') {
    if (pathname.includes('/reel/') || pathname.includes('/reels/')) {
      const reelId = pathname.split(/\/reels?\/([^\/?#]+)/)[1];
      return {
        platform: 'instagram',
        type: 'reel',
        valid: true,
        title: reelId ? `Instagram Reel (${reelId})` : 'Instagram Reel',
        cleanUrl: urlObj.toString()
      };
    }

    if (pathname.includes('/p/')) {
      const postId = pathname.split(/\/p\/([^\/?#]+)/)[1];
      return {
        platform: 'instagram',
        type: 'post',
        valid: true,
        title: postId ? `Instagram Post (${postId})` : 'Instagram Post',
        cleanUrl: urlObj.toString()
      };
    }

    // Profile detection
    const segments = pathname.split('/').filter(Boolean);
    const ignoredRoutes = ['explore', 'direct', 'accounts', 'stories', 'reels', 'about', 'legal'];
    if (segments.length === 1 && !ignoredRoutes.includes(segments[0])) {
      const username = segments[0];
      return {
        platform: 'instagram',
        type: 'profile',
        valid: true,
        creator: username,
        creatorHandle: `@${username}`,
        title: `@${username} on Instagram`,
        cleanUrl: urlObj.toString()
      };
    }

    return {
      platform: 'instagram',
      type: 'post',
      valid: true,
      title: 'Instagram Content',
      cleanUrl: urlObj.toString()
    };
  }

  // --- 3. FACEBOOK ---
  if (
    hostname === 'facebook.com' ||
    hostname === 'm.facebook.com' ||
    hostname === 'fb.watch' ||
    hostname === 'fb.com'
  ) {
    if (pathname.includes('/reel/') || pathname.includes('/reels/')) {
      const reelId = pathname.split(/\/reels?\/([^\/?#]+)/)[1];
      return {
        platform: 'facebook',
        type: 'reel',
        valid: true,
        title: reelId ? `Facebook Reel (${reelId})` : 'Facebook Reel',
        cleanUrl: urlObj.toString()
      };
    }

    if (pathname.includes('/watch') || hostname === 'fb.watch') {
      return {
        platform: 'facebook',
        type: 'video',
        valid: true,
        title: 'Facebook Video',
        cleanUrl: urlObj.toString()
      };
    }

    if (pathname.includes('/posts/') || pathname.includes('/story.php') || pathname.includes('/photo')) {
      return {
        platform: 'facebook',
        type: 'post',
        valid: true,
        title: 'Facebook Post',
        cleanUrl: urlObj.toString()
      };
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) {
      const page = segments[0];
      return {
        platform: 'facebook',
        type: 'page',
        valid: true,
        creator: page,
        creatorHandle: `@${page}`,
        title: `${page} Facebook Page`,
        cleanUrl: urlObj.toString()
      };
    }

    return {
      platform: 'facebook',
      type: 'post',
      valid: true,
      title: 'Facebook Content',
      cleanUrl: urlObj.toString()
    };
  }

  // --- 4. TELEGRAM ---
  if (hostname === 't.me' || hostname === 'telegram.me') {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const channel = parts[0];
      const postId = parts[1];
      return {
        platform: 'telegram',
        type: 'post',
        valid: true,
        creator: channel,
        creatorHandle: `@${channel}`,
        title: `Telegram Post ${channel}/${postId}`,
        embedUrl: `https://t.me/${channel}/${postId}?embed=1`,
        cleanUrl: urlObj.toString()
      };
    }

    if (parts.length === 1) {
      const channel = parts[0];
      return {
        platform: 'telegram',
        type: 'telegram_channel',
        valid: true,
        creator: channel,
        creatorHandle: `@${channel}`,
        title: `Telegram Channel @${channel}`,
        cleanUrl: urlObj.toString()
      };
    }

    return {
      platform: 'telegram',
      type: 'telegram_channel',
      valid: true,
      title: 'Telegram Content',
      cleanUrl: urlObj.toString()
    };
  }

  // Not recognized
  return {
    platform: 'youtube',
    type: 'unknown',
    valid: false,
    cleanUrl: trimmed,
    error: "This URL isn't recognized. Supported: YouTube, Instagram, Facebook, Telegram."
  };
}

export function formatContentTypeLabel(type: ContentType): string {
  switch (type) {
    case 'video': return 'Video';
    case 'short': return 'Short';
    case 'reel': return 'Reel';
    case 'post': return 'Post';
    case 'channel': return 'Channel';
    case 'profile': return 'Profile';
    case 'page': return 'Page';
    case 'telegram_channel': return 'Channel';
    case 'unknown': default: return 'Content';
  }
}

export function getPlatformMeta(platform: Platform) {
  switch (platform) {
    case 'youtube':
      return {
        label: 'YouTube',
        color: '#FF0000',
        badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
        accentBorder: 'border-red-500/40',
        canEmbed: true,
        embedReason: 'Native YouTube iframe player supported.'
      };
    case 'instagram':
      return {
        label: 'Instagram',
        color: '#E4405F',
        badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        accentBorder: 'border-pink-500/40',
        canEmbed: false,
        embedReason: 'Instagram security (CSP) blocks direct embedding. Use "Open on Instagram".'
      };
    case 'facebook':
      return {
        label: 'Facebook',
        color: '#1877F2',
        badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        accentBorder: 'border-blue-500/40',
        canEmbed: false,
        embedReason: 'Facebook security blocks cross-origin iframes. Use "Open on Facebook".'
      };
    case 'telegram':
      return {
        label: 'Telegram',
        color: '#229ED9',
        badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        accentBorder: 'border-sky-500/40',
        canEmbed: true,
        embedReason: 'Telegram widget embeds supported for public post links.'
      };
  }
}
