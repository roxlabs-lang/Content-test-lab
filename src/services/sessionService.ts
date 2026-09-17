import { WorkspaceSession, ParsedContent } from '../types';

const SESSION_STORAGE_KEY = 'content_lab_workspace_session_v3';
const RECENT_CONTENT_STORAGE_KEY = 'content_lab_recent_content_v3';

export function getWorkspaceSession(): WorkspaceSession {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse workspace session:', err);
  }

  return {
    openedAt: Date.now()
  };
}

export function saveWorkspaceSession(update: Partial<WorkspaceSession>): WorkspaceSession {
  const current = getWorkspaceSession();
  const next: WorkspaceSession = {
    ...current,
    ...update,
    openedAt: current.openedAt || Date.now()
  };

  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('Failed to save workspace session:', err);
  }

  return next;
}

export function clearWorkspaceSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear workspace session:', err);
  }
}

export function getRecentContent(): ParsedContent[] {
  try {
    const raw = localStorage.getItem(RECENT_CONTENT_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read recent content:', err);
  }

  // Sensible initial list showing supported platforms
  return [
    {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      normalizedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      type: 'video',
      title: 'Never Gonna Give You Up',
      creator: 'Rick Astley',
      creatorHandle: '@RickAstleyVEVO',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0',
      canEmbed: true,
      supportedFeatures: ['embed', 'video_player', 'public_preview', 'external_open', 'comments']
    },
    {
      url: 'https://www.instagram.com/reel/C8qKz9PxY1/',
      normalizedUrl: 'https://www.instagram.com/reel/C8qKz9PxY1/',
      platform: 'instagram',
      type: 'reel',
      title: '3 CSS tricks that look like black magic',
      creator: 'minimalist_coder',
      creatorHandle: '@minimalist_coder',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      embedUrl: null,
      canEmbed: false,
      supportedFeatures: ['public_preview', 'external_open', 'metadata_detection']
    },
    {
      url: 'https://t.me/durov/230',
      normalizedUrl: 'https://t.me/durov/230',
      platform: 'telegram',
      type: 'post',
      title: 'Telegram Mini Apps 2.0 & Monetization Update',
      creator: 'Pavel Durov',
      creatorHandle: '@durov',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      embedUrl: 'https://t.me/durov/230?embed=1',
      canEmbed: true,
      supportedFeatures: ['embed', 'public_preview', 'external_open', 'metadata_detection']
    }
  ];
}

export function addRecentContent(item: ParsedContent): void {
  try {
    const list = getRecentContent();
    // Filter out item with same normalized URL or raw URL
    const targetUrl = item.normalizedUrl || item.url;
    const filtered = list.filter((r) => (r.normalizedUrl || r.url) !== targetUrl);
    // Prepend
    const updated = [item, ...filtered].slice(0, 8); // Keep top 8
    localStorage.setItem(RECENT_CONTENT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to add recent content:', err);
  }
}
