import { PlatformAdapter } from '../types';
import { ParsedContent, PlatformFeature } from '../../types';

export class InstagramAdapter implements PlatformAdapter {
  platform = 'instagram' as const;
  displayName = 'Instagram';

  canHandle(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        host === 'instagram.com' ||
        host.endsWith('.instagram.com') ||
        host === 'instagr.am'
      );
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedContent {
    const raw = url.trim();
    let normalizedUrl = raw;
    let type: ParsedContent['type'] = 'reel';
    let contentId = '';
    let title = 'Instagram Reel';
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
        title = `Instagram Post (${contentId ? contentId.slice(0, 8) : 'photo'})`;
      } else {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 1 && !['explore', 'stories', 'direct', 'reels'].includes(segments[0])) {
          type = 'profile';
          creator = segments[0];
          creatorHandle = `@${segments[0]}`;
          title = `@${creator} Profile`;
          normalizedUrl = `https://www.instagram.com/${creator}/`;
        } else {
          type = 'post';
          title = 'Instagram Content';
        }
      }
    } catch {
      // Fallback
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
      embedUrl: null, // Instagram disallows third-party iframe embedding via CSP
      canEmbed: false,
      supportedFeatures: this.getSupportedFeatures()
    };
  }

  getEmbedUrl(_content: ParsedContent): string | null {
    // Intentionally returns null because Instagram strictly blocks third-party iframe embeds
    return null;
  }

  getExternalUrl(content: ParsedContent): string {
    return content.normalizedUrl || content.url;
  }

  getSupportedFeatures(): PlatformFeature[] {
    return [
      'public_preview',
      'external_open',
      'metadata_detection'
    ];
  }
}

export const instagramAdapter = new InstagramAdapter();
