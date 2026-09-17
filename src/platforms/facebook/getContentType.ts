export function getFacebookContentType(url: string): 'reel' | 'video' | 'post' | 'story' | 'unknown' {
  if (!url) return 'unknown';
  if (url.includes('/reel/') || url.includes('/reels/')) return 'reel';
  if (url.includes('/videos/') || url.includes('/watch')) return 'video';
  return 'post';
}
