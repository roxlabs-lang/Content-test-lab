export function getTelegramContentType(url: string): 'post' | 'channel' | 'group' | 'unknown' {
  if (!url) return 'unknown';
  const segments = url.split('/').filter(Boolean);
  if (segments.length >= 2) return 'post';
  return 'channel';
}
