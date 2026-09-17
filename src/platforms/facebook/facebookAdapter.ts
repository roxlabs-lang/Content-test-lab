import { PlatformAdapter } from '../types';
import { ParsedContent, PlatformFeature } from '../../types';

export class FacebookAdapter implements PlatformAdapter {
  platform = 'facebook' as const;
  displayName = 'Facebook';

  canHandle(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url.trim());
      const host = parsed.hostname.toLowerCase();
      return (
        host === 'facebook.com' ||
        host.endsWith('.facebook.com') ||
        host === 'fb.watch' ||
        host === 'fb.com'
      );
    } catch {
      return false;
    }
  }

  parseUrl(url: string): ParsedContent {
    const raw = url.trim();
    let normalizedUrl = raw;
    let type: ParsedContent['type'] = 'video';
    let contentId = '';
    let title = 'Facebook Video';
    let creator: string | undefined = undefined;
    let creatorHandle: string | undefined = undefined;

    try {
      const parsed = new URL(raw);
      const host = parsed.hostname.toLowerCase();
      const pathname = parsed.pathname;

      if (host === 'fb.watch') {
        contentId = pathname.replace(/^\//, '').split('?')[0];
        type = 'video';
        title = `Facebook Watch Video (${contentId})`;
      } else if (pathname.includes('/reel/')) {
        contentId = pathname.split('/reel/')[1]?.split('/')[0] || '';
        type = 'reel';
        normalizedUrl = `https://www.facebook.com/reel/${contentId}`;
        title = `Facebook Reel (${contentId.slice(0, 8)})`;
      } else if (pathname.includes('/watch/')) {
        contentId = parsed.searchParams.get('v') || pathname.split('/watch/')[1]?.split('/')[0] || '';
        type = 'video';
        title = `Facebook Video (${contentId.slice(0, 8)})`;
      } else if (pathname.includes('/posts/') || pathname.includes('/story.php')) {
        type = 'post';
        title = 'Facebook Post';
      } else {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          creator = segments[0];
          creatorHandle = `@${segments[0]}`;
          type = 'page';
          title = `${creator} Page`;
        }
      }
    } catch {
      // Fallback
    }

    return {
      url: raw,
      normalizedUrl,
      platform: 'facebook',
      type,
      contentId,
      title,
      creator,
      creatorHandle,
      thumbnailUrl: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=600&auto=format&fit=crop&q=80',
      embedUrl: null, // Facebook requires strict platform SDK/X-Frame protections
      canEmbed: false,
      supportedFeatures: this.getSupportedFeatures()
    };
  }

  getEmbedUrl(_content: ParsedContent): string | null {
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

export const facebookAdapter = new FacebookAdapter();
