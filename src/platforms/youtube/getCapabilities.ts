import { PlatformCapabilities } from '../../types';

export function getYouTubeCapabilities(): PlatformCapabilities {
  return {
    like: true,
    comment: true,
    share: true,
    save: true,
    follow: true,
    labels: {
      like: 'Like on YouTube',
      comment: 'Comment on YouTube',
      share: 'Share Link',
      save: 'Save on YouTube',
      follow: 'Subscribe on YouTube',
      liked: 'Liked on YouTube',
      commented: 'Commented on YouTube',
      shared: 'Link Shared',
      saved: 'Saved on YouTube',
      followed: 'Subscribed on YouTube',
    },
  };
}
