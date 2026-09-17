import { Platform, PlatformFeature, ParsedContent, ContentItem } from '../types';

export interface PlatformAdapter {
  platform: Platform;
  displayName: string;
  canHandle(url: string): boolean;
  parseUrl(url: string): ParsedContent;
  getEmbedUrl?(content: ParsedContent): string | null;
  getExternalUrl(content: ParsedContent): string;
  getSupportedFeatures(): PlatformFeature[];
}
