export function getInstagramExternalUrl(url: string, contentId?: string): string {
  if (contentId) {
    return `https://www.instagram.com/reel/${contentId}/`;
  }
  return url;
}
