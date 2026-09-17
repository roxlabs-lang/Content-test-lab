import { PlatformCapabilities } from '../../types';

export function getInstagramCapabilities(): PlatformCapabilities {
  return {
    like: true,
    comment: true,
    share: true,
    save: true,
    follow: true,
    labels: {
      like: 'Like on Instagram',
      comment: 'Comment on Instagram',
      share: 'Share Reel',
      save: 'Save on Instagram',
      follow: 'Follow on Instagram',
      liked: 'Liked on Instagram',
      commented: 'Commented on Instagram',
      shared: 'Reel Shared',
      saved: 'Saved on Instagram',
      followed: 'Following on Instagram',
    },
  };
}
