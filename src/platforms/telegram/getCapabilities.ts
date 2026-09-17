import { PlatformCapabilities } from '../../types';

export function getTelegramCapabilities(): PlatformCapabilities {
  return {
    like: true,
    comment: true,
    share: true,
    save: true,
    follow: true,
    labels: {
      like: 'React on Telegram',
      comment: 'Comment on Telegram',
      share: 'Forward / Share',
      save: 'Save to Saved Messages',
      follow: 'Join Channel',
      liked: 'Reacted on Telegram',
      commented: 'Commented on Telegram',
      shared: 'Post Forwarded',
      saved: 'Saved in Telegram',
      followed: 'Joined Channel',
    },
  };
}
