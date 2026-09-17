import { ContentItem } from '../types';
import { getCurrentUserSync } from './authService';

const CONTENT_STORAGE_PREFIX = 'ctl_user_content_v2_';

const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'cnt_01',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    platform: 'youtube',
    type: 'video',
    title: 'Never Gonna Give You Up (Algorithmic Longevity Case Study)',
    creator: 'Rick Astley',
    creatorHandle: '@RickAstleyYT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'cnt_02',
    url: 'https://www.instagram.com/reel/C3x9_example1',
    platform: 'instagram',
    type: 'reel',
    title: '3 Modern CSS Grid Layout Tricks You Should Know',
    creator: 'CodeCrafts',
    creatorHandle: '@codecrafts_dev',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'cnt_03',
    url: 'https://t.me/durov/230',
    platform: 'telegram',
    type: 'post',
    title: 'Telegram Mini Apps 2.0 & Monetization Update',
    creator: 'Pavel Durov',
    creatorHandle: '@durov',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    embedUrl: 'https://t.me/durov/230?embed=1',
    createdAt: Date.now() - 86400000 * 1,
  },
];

function getStorageKey(uid?: string): string {
  const userId = uid || getCurrentUserSync().uid;
  return `${CONTENT_STORAGE_PREFIX}${userId}`;
}

export async function getContentItems(uid?: string): Promise<ContentItem[]> {
  try {
    const key = getStorageKey(uid);
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to get content items:', err);
  }

  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(INITIAL_CONTENT));
  return INITIAL_CONTENT;
}

export async function getContentItemById(id: string, uid?: string): Promise<ContentItem | null> {
  const items = await getContentItems(uid);
  return items.find((item) => item.id === id) || null;
}

export async function getContentItemByUrl(url: string, uid?: string): Promise<ContentItem | null> {
  const items = await getContentItems(uid);
  const clean = url.trim().toLowerCase();
  return items.find((item) => item.url.trim().toLowerCase() === clean) || null;
}

export async function saveContentItem(item: ContentItem, uid?: string): Promise<ContentItem> {
  const items = await getContentItems(uid);
  const existingIdx = items.findIndex((i) => i.id === item.id);
  const updatedItem = {
    ...item,
    createdAt: item.createdAt || Date.now(),
  };

  if (existingIdx >= 0) {
    items[existingIdx] = updatedItem;
  } else {
    items.unshift(updatedItem);
  }

  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(items));
  return updatedItem;
}

export async function getContent(id?: string, uid?: string): Promise<ContentItem | ContentItem[] | null> {
  if (id) {
    return getContentItemById(id, uid);
  }
  return getContentItems(uid);
}

export async function createContent(item: ContentItem, uid?: string): Promise<ContentItem> {
  return saveContentItem(item, uid);
}

export async function updateContent(item: ContentItem, uid?: string): Promise<ContentItem> {
  return saveContentItem(item, uid);
}

export async function deleteContentItem(id: string, uid?: string): Promise<void> {
  const items = await getContentItems(uid);
  const filtered = items.filter((i) => i.id !== id);
  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export async function deleteContent(id: string, uid?: string): Promise<void> {
  return deleteContentItem(id, uid);
}
