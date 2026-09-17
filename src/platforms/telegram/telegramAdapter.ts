import { PlatformAdapter } from '../types';
import { ParsedContent, PlatformFeature } from '../../types';

export class TelegramAdapter implements PlatformAdapter {
  platform = 'telegram' as const;
  displayName = 'Telegram';

  canHandle(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        host === 't.me' ||
        host.endsWith('.t.me') ||
        host === 'telegram.me'
      );
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedContent {
    const raw = url.trim();
    let normalizedUrl = raw;
    let type: ParsedContent['type'] = 'post';
    let contentId = '';
    let title = 'Telegram Content';
    let creator = 'Telegram Channel';
    let creatorHandle = '@channel';
    let embedUrl: string | null = null;

    try {
      const parsed = new URL(raw);
      const segments = parsed.pathname.split('/').filter(Boolean);

      if (segments.length >= 2) {
        // Channel post: e.g. /durov/230
        const channel = segments[0];
        const postId = segments[1];
        type = 'post';
        contentId = `${channel}/${postId}`;
        creator = channel;
        creatorHandle = `@${channel}`;
        title = `Telegram Post ${creatorHandle}/${postId}`;
        normalizedUrl = `https://t.me/${channel}/${postId}`;
        // Official Telegram post embed widget
        embedUrl = `https://t.me/${channel}/${postId}?embed=1`;
      } else if (segments.length === 1) {
        // Channel / group handle: e.g. /durov
        const channel = segments[0];
        type = 'telegram_channel';
        contentId = channel;
        creator = channel;
        creatorHandle = `@${channel}`;
        title = `Telegram Channel ${creatorHandle}`;
        normalizedUrl = `https://t.me/${channel}`;
      }
    } catch {
      // Fallback
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
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      embedUrl,
      canEmbed: Boolean(embedUrl),
      supportedFeatures: this.getSupportedFeatures()
    };
  }

  getEmbedUrl(content: ParsedContent): string | null {
    if (content.contentId && content.contentId.includes('/')) {
      return `https://t.me/${content.contentId}?embed=1`;
    }
    return null;
  }

  getExternalUrl(content: ParsedContent): string {
    return content.normalizedUrl || content.url;
  }

  getSupportedFeatures(): PlatformFeature[] {
    return [
      'embed',
      'public_preview',
      'external_open',
      'metadata_detection'
    ];
  }
}

export const telegramAdapter = new TelegramAdapter();
