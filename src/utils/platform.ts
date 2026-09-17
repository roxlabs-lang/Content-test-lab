import { Platform, PlatformCapabilities } from '../types';

export interface PlatformConfig {
  id: Platform;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tagColor: string;
  allowsDirectIframe: boolean;
  notes: string;
  interactionNotice: string;
}

export function getPlatformCapabilities(platform: Platform): PlatformCapabilities {
  switch (platform) {
    case 'youtube':
      return {
        like: true,
        comment: true,
        share: true,
        save: true,
        follow: true,
        labels: {
          like: 'Like',
          liked: 'Liked',
          comment: 'Comment',
          commented: 'Commented',
          share: 'Share',
          shared: 'Shared',
          save: 'Save',
          saved: 'Saved',
          follow: 'Subscribe',
          followed: 'Subscribed'
        }
      };
    case 'instagram':
      return {
        like: true,
        comment: true,
        share: true,
        save: true,
        follow: true,
        labels: {
          like: 'Like',
          liked: 'Liked',
          comment: 'Comment',
          commented: 'Commented',
          share: 'Share',
          shared: 'Shared',
          save: 'Save',
          saved: 'Saved',
          follow: 'Follow',
          followed: 'Following'
        }
      };
    case 'facebook':
      return {
        like: true,
        comment: true,
        share: true,
        save: true,
        follow: true,
        labels: {
          like: 'Like',
          liked: 'Liked',
          comment: 'Comment',
          commented: 'Commented',
          share: 'Share',
          shared: 'Shared',
          save: 'Save',
          saved: 'Saved',
          follow: 'Follow',
          followed: 'Following'
        }
      };
    case 'telegram':
      return {
        like: true,
        comment: true,
        share: true,
        save: true,
        follow: true,
        labels: {
          like: 'React',
          liked: 'Reacted',
          comment: 'Comment',
          commented: 'Commented',
          share: 'Share',
          shared: 'Shared',
          save: 'Save',
          saved: 'Saved',
          follow: 'Join Channel',
          followed: 'Joined'
        }
      };
    default:
      return {
        like: true,
        comment: true,
        share: true,
        save: true,
        follow: true,
        labels: {
          like: 'Like',
          liked: 'Liked',
          comment: 'Comment',
          commented: 'Commented',
          share: 'Share',
          shared: 'Shared',
          save: 'Save',
          saved: 'Saved',
          follow: 'Follow',
          followed: 'Followed'
        }
      };
  }
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    tagColor: 'text-red-400 border-red-500/20 bg-red-950/40',
    allowsDirectIframe: true,
    notes: 'Direct iframe playback supported for public videos and Shorts.',
    interactionNotice: 'Log actions in Content Test Lab or click Open on YouTube to like/comment with your test account.'
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    tagColor: 'text-pink-400 border-pink-500/20 bg-pink-950/40',
    allowsDirectIframe: false,
    notes: 'Meta CSP policies restrict embedded browsing. Use Open in Instagram to preserve session boundary.',
    interactionNotice: 'Logged inside Content Test Lab sandbox. Click Open on Instagram to execute interactions.'
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    tagColor: 'text-blue-400 border-blue-500/20 bg-blue-950/40',
    allowsDirectIframe: false,
    notes: 'Direct cross-domain embed blocked by security headers. External launcher workflow available.',
    interactionNotice: 'Logged inside Content Test Lab. Click Open on Facebook to execute manual testing.'
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    tagColor: 'text-sky-400 border-sky-500/20 bg-sky-950/40',
    allowsDirectIframe: true,
    notes: 'Public post preview widgets supported. Direct channel feeds open in Telegram web or app.',
    interactionNotice: 'Observations tracked in workspace. Use Open in Telegram for channel participation.'
  }
};

export function getPlatformConfig(platform: Platform): PlatformConfig {
  return PLATFORMS[platform] || PLATFORMS.youtube;
}

export function formatContentType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
