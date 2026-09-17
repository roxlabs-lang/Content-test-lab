import { PlatformCapabilities } from '../../types';

export function getFacebookCapabilities(): PlatformCapabilities {
  return {
    like: true,
    comment: true,
    share: true,
    save: true,
    follow: true,
    labels: {
      like: 'Like on Facebook',
      comment: 'Comment on Facebook',
      share: 'Share Post',
      save: 'Save on Facebook',
      follow: 'Follow on Facebook',
      liked: 'Liked on Facebook',
      commented: 'Commented on Facebook',
      shared: 'Post Shared',
      saved: 'Saved on Facebook',
      followed: 'Following on Facebook',
    },
  };
}
