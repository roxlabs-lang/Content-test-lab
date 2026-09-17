import { ParsedContent } from '../../types';

export function parseYouTubeUrl(url: string): ParsedContent {
  const raw = url.trim();
  let normalizedUrl = raw;
  let type: ParsedContent['type'] = 'video';
  let contentId = '';
  let title = 'YouTube Content';
  let creator: string | undefined = undefined;
  let creatorHandle: string | undefined = undefined;
  let embedUrl: string | null = null;
  let thumbnailUrl = '';

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (host === 'youtu.be') {
      contentId = pathname.replace(/^\//, '').split('?')[0];
      type = 'video';
      normalizedUrl = `https://www.youtube.com/watch?v=${contentId}`;
    } else if (pathname.includes('/shorts/')) {
      contentId = pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0] || '';
      type = 'short';
      normalizedUrl = `https://www.youtube.com/shorts/${contentId}`;
      title = `YouTube Short (${contentId.slice(0, 8)})`;
    } else if (pathname.includes('/watch')) {
      contentId = parsed.searchParams.get('v') || '';
      type = 'video';
      normalizedUrl = `https://www.youtube.com/watch?v=${contentId}`;
      title = `YouTube Video (${contentId.slice(0, 8)})`;
    } else if (pathname.startsWith('/@')) {
      const handle = pathname.split('/')[1]?.split('?')[0] || '';
      type = 'channel';
      creatorHandle = handle;
      creator = handle.replace('@', '');
      title = `${creatorHandle} Channel`;
      normalizedUrl = `https://www.youtube.com/${creatorHandle}`;
    }

    if (contentId) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${contentId}?rel=0&modestbranding=1&playsinline=1`;
      thumbnailUrl = `https://img.youtube.com/vi/${contentId}/hqdefault.jpg`;
    }
  } catch {
    // fallback
  }

  return {
    url: raw,
    normalizedUrl,
    platform: 'youtube',
    type,
    contentId,
    title,
    creator,
    creatorHandle,
    thumbnailUrl,
    embedUrl,
    canEmbed: Boolean(embedUrl),
    supportedFeatures: ['embed', 'video_player', 'public_preview', 'external_open', 'comments', 'metadata_detection'],
  };
}
