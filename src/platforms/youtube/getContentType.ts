export function getYouTubeContentType(url: string): 'video' | 'short' | 'channel' | 'post' | 'unknown' {
  if (!url) return 'unknown';
  if (url.includes('/shorts/')) return 'short';
  if (url.includes('/@') || url.includes('/channel/')) return 'channel';
  if (url.includes('watch') || url.includes('youtu.be')) return 'video';
  return 'video';
}
