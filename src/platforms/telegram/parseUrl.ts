import { ParsedContent } from '../../types';

export function parseTelegramUrl(url: string): ParsedContent {
  const raw = url.trim();
  let normalizedUrl = raw;
  let type: ParsedContent['type'] = 'post';
  let contentId = '';
  let title = 'Telegram Post';
  let creator: string | undefined = undefined;
  let creatorHandle: string | undefined = undefined;

  try {
    const parsed = new URL(raw);
    const pathname = parsed.pathname;

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      creator = segments[0];
      creatorHandle = `@${segments[0]}`;
      contentId = segments[1];
      normalizedUrl = `https://t.me/${segments[0]}/${segments[1]}`;
      title = `${creatorHandle} Post #${contentId}`;
    } else if (segments.length === 1) {
      creator = segments[0];
      creatorHandle = `@${segments[0]}`;
      normalizedUrl = `https://t.me/${segments[0]}`;
      title = `${creatorHandle} Channel`;
      type = 'channel';
    }
  } catch {
    // fallback
  }

  return {
    url: raw,
    normalizedUrl,
    platform: 'telegram',
    type,
    contentId,
    title,
    creator,
    creatorHandle,
    thumbnailUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=600&auto=format&fit=crop&q=80',
    embedUrl: null,
    canEmbed: false,
    supportedFeatures: ['public_preview', 'external_open', 'metadata_detection'],
  };
}
