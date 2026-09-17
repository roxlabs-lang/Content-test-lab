export function getYouTubeExternalUrl(url: string, contentId?: string): string {
  if (contentId) {
    return `https://www.youtube.com/watch?v=${contentId}`;
  }
  return url;
}
