export function getFacebookExternalUrl(url: string, contentId?: string): string {
  if (contentId) {
    return `https://www.facebook.com/reel/${contentId}`;
  }
  return url;
}
