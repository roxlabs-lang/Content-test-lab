import { ParsedContent } from '../../types';

export function parseFacebookUrl(url: string): ParsedContent {
  const raw = url.trim();
  let normalizedUrl = raw;
  let type: ParsedContent['type'] = 'video';
  let contentId = '';
  let title = 'Facebook Video';
  let creator: string | undefined = undefined;

  try {
    const parsed = new URL(raw);
    const pathname = parsed.pathname;

    if (pathname.includes('/reel/') || pathname.includes('/reels/')) {
      type = 'reel';
      contentId = pathname.split(/\/reels?\//)[1]?.split('/')[0] || '';
      normalizedUrl = `https://www.facebook.com/reel/${contentId}`;
      title = `Facebook Reel (${contentId ? contentId.slice(0, 8) : 'clip'})`;
    } else if (pathname.includes('/watch')) {
      contentId = parsed.searchParams.get('v') || '';
      type = 'video';
      normalizedUrl = `https://www.facebook.com/watch/?v=${contentId}`;
      title = `Facebook Watch (${contentId ? contentId.slice(0, 8) : 'video'})`;
    } else if (pathname.includes('/videos/')) {
      contentId = pathname.split('/videos/')[1]?.split('/')[0] || '';
      type = 'video';
      normalizedUrl = `https://www.facebook.com/videos/${contentId}`;
      title = `Facebook Video (${contentId ? contentId.slice(0, 8) : 'video'})`;
    }
  } catch {
    // fallback
  }

  return {
    url: raw,
    normalizedUrl,
    platform: 'facebook',
    type,
    contentId,
    title,
    creator,
    thumbnailUrl: 'https://images.unsplash.com/photo-1579869847556-a9b5f54316a7?w=600&auto=format&fit=crop&q=80',
    embedUrl: null,
    canEmbed: false,
    supportedFeatures: ['public_preview', 'external_open', 'metadata_detection'],
  };
}
