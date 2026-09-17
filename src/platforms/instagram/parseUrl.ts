import { ParsedContent } from '../../types';

export function parseInstagramUrl(url: string): ParsedContent {
  const raw = url.trim();
  let normalizedUrl = raw;
  let type: ParsedContent['type'] = 'reel';
  let contentId = '';
  let title = 'Instagram Content';
  let creator: string | undefined = undefined;
  let creatorHandle: string | undefined = undefined;

  try {
    const parsed = new URL(raw);
    const pathname = parsed.pathname;

    if (pathname.includes('/reel/') || pathname.includes('/reels/')) {
      type = 'reel';
      contentId = pathname.split(/\/reels?\//)[1]?.split('/')[0] || '';
      normalizedUrl = `https://www.instagram.com/reel/${contentId}/`;
      title = `Instagram Reel (${contentId ? contentId.slice(0, 8) : 'clip'})`;
    } else if (pathname.includes('/p/')) {
      type = 'post';
      contentId = pathname.split('/p/')[1]?.split('/')[0] || '';
      normalizedUrl = `https://www.instagram.com/p/${contentId}/`;
      title = `Instagram Post (${contentId ? contentId.slice(0, 8) : 'post'})`;
    } else {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length === 1 && !['explore', 'stories', 'direct', 'reels'].includes(segments[0])) {
        type = 'profile';
        creator = segments[0];
        creatorHandle = `@${segments[0]}`;
        title = `@${creator} Profile`;
        normalizedUrl = `https://www.instagram.com/${creator}/`;
      }
    }
  } catch {
    // fallback
  }

  return {
    url: raw,
    normalizedUrl,
    platform: 'instagram',
    type,
    contentId,
    title,
    creator,
    creatorHandle,
    thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    embedUrl: null,
    canEmbed: false,
    supportedFeatures: ['public_preview', 'external_open', 'metadata_detection'],
  };
}
