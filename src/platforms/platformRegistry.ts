import { Platform, ParsedContent, ContentItem } from '../types';
import { PlatformAdapter } from './types';
import { youtubeAdapter } from './youtube/youtubeAdapter';
import { instagramAdapter } from './instagram/instagramAdapter';
import { facebookAdapter } from './facebook/facebookAdapter';
import { telegramAdapter } from './telegram/telegramAdapter';

export const PLATFORM_ADAPTERS: PlatformAdapter[] = [
  youtubeAdapter,
  instagramAdapter,
  facebookAdapter,
  telegramAdapter,
];

/**
 * Normalizes a social media content URL by stripping harmless tracking/telemetry
 * parameters while keeping essential routing parameters (such as `v` on YouTube).
 */
export function normalizeContentUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  try {
    const parsed = new URL(trimmed);
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'igsh',
      'si',
      'feature',
      'ref',
      'ref_src',
      's',
      't',
      'share_id',
      'source'
    ];

    // Remove tracking queries
    trackingParams.forEach((param) => {
      parsed.searchParams.delete(param);
    });

    // YouTube youtu.be canonicalization
    if (parsed.hostname === 'youtu.be') {
      const vid = parsed.pathname.replace(/^\//, '').split('?')[0];
      if (vid) {
        return `https://www.youtube.com/watch?v=${vid}`;
      }
    }

    // Instagram trailing slash consistency
    if (parsed.hostname.includes('instagram.com')) {
      parsed.search = '';
      let path = parsed.pathname;
      if (!path.endsWith('/')) path += '/';
      parsed.pathname = path;
    }

    // Facebook clean query
    if (parsed.hostname.includes('facebook.com') || parsed.hostname.includes('fb.watch')) {
      if (parsed.pathname.includes('/reel/')) {
        parsed.search = '';
      }
    }

    // If query string is now empty, omit the '?'
    const cleanSearch = parsed.searchParams.toString();
    const portPart = parsed.port && parsed.port !== '80' && parsed.port !== '443' ? `:${parsed.port}` : '';
    return `${parsed.protocol}//${parsed.hostname}${portPart}${parsed.pathname}${cleanSearch ? `?${cleanSearch}` : ''}${parsed.hash}`;
  } catch {
    return trimmed;
  }
}

/**
 * Resolves the platform adapter capable of handling a given URL.
 */
export function getAdapterForUrl(url: string): PlatformAdapter | null {
  if (!url) return null;
  for (const adapter of PLATFORM_ADAPTERS) {
    if (adapter.canHandle(url)) {
      return adapter;
    }
  }
  return null;
}

/**
 * Resolves the platform adapter by platform identifier.
 */
export function getAdapterForPlatform(platform: Platform): PlatformAdapter {
  const found = PLATFORM_ADAPTERS.find((a) => a.platform === platform);
  if (found) return found;
  return youtubeAdapter; // Fallback
}

/**
 * Universal parser combining adapter detection, URL normalization, and metadata resolution.
 */
export function parseContentUrl(url: string): ParsedContent {
  const normalized = normalizeContentUrl(url);
  const adapter = getAdapterForUrl(normalized) || getAdapterForUrl(url);

  if (adapter) {
    const parsed = adapter.parseUrl(normalized || url);
    return {
      ...parsed,
      normalizedUrl: normalized || parsed.normalizedUrl
    };
  }

  // Generic fallback if unknown URL
  return {
    url,
    normalizedUrl: normalized || url,
    platform: 'youtube',
    type: 'unknown',
    title: 'Social Media Content',
    creator: undefined,
    creatorHandle: undefined,
    thumbnailUrl: '',
    embedUrl: null,
    canEmbed: false,
    supportedFeatures: ['external_open']
  };
}

/**
 * Opens content in its native platform in a separate tab while preserving the user's research session.
 */
export function openExternalContent(content: { url: string; platform?: Platform; normalizedUrl?: string }): void {
  const targetUrl = content.normalizedUrl || content.url;
  if (!targetUrl) return;

  try {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.error('Failed to open external URL:', err);
    // Fallback location change if window.open was blocked
    window.location.href = targetUrl;
  }
}

export * from './types';
