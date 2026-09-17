export function getInstagramContentType(url: string): 'reel' | 'post' | 'story' | 'profile' | 'unknown' {
  if (!url) return 'unknown';
  if (url.includes('/reel/') || url.includes('/reels/')) return 'reel';
  if (url.includes('/stories/')) return 'story';
  if (url.includes('/p/')) return 'post';
  return 'post';
}
