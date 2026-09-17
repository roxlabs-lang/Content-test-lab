const TAGS_STORAGE_KEY = 'content_lab_tags_v3';

export const DEFAULT_TAGS = [
  '#hook',
  '#storytelling',
  '#editing',
  '#fitness',
  '#horror',
  '#anime',
  '#shorts',
  '#reels',
  '#thumbnail',
  '#voiceover',
  '#cta',
  '#trend',
  '#pacing',
  '#audio',
  '#retention'
];

export function getTags(): string[] {
  try {
    const raw = localStorage.getItem(TAGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(DEFAULT_TAGS));
      return DEFAULT_TAGS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TAGS;
  }
}

export function createTag(rawTag: string): string[] {
  let cleaned = rawTag.trim().toLowerCase();
  if (!cleaned) return getTags();
  if (!cleaned.startsWith('#')) {
    cleaned = `#${cleaned}`;
  }
  // Remove spaces or invalid chars
  cleaned = cleaned.replace(/\s+/g, '-');

  const current = getTags();
  if (!current.includes(cleaned)) {
    const updated = [...current, cleaned];
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
  return current;
}

export function deleteTag(tagToDelete: string): string[] {
  const current = getTags();
  const updated = current.filter((t) => t.toLowerCase() !== tagToDelete.toLowerCase());
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function assignTag(existingTags: string[], tagToAdd: string): string[] {
  let cleaned = tagToAdd.trim().toLowerCase();
  if (!cleaned) return existingTags;
  if (!cleaned.startsWith('#')) {
    cleaned = `#${cleaned}`;
  }
  cleaned = cleaned.replace(/\s+/g, '-');

  if (existingTags.includes(cleaned)) {
    return existingTags;
  }
  // Also register in the global tag pool
  createTag(cleaned);
  return [...existingTags, cleaned];
}

export function removeTag(existingTags: string[], tagToRemove: string): string[] {
  return existingTags.filter((t) => t.toLowerCase() !== tagToRemove.toLowerCase());
}
