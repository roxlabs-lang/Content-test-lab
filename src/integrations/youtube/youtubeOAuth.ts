import { getYouTubeAccount } from './youtubeApi';
import { YouTubeAccount } from './youtubeTypes';

export async function initiateYouTubeOAuth(
  onSuccess: (account: YouTubeAccount) => void,
  onError: (error: string) => void
): Promise<Window | null> {
  try {
    // 1. Fetch authorization URL from server
    const response = await fetch('/api/youtube/auth/start');
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to initiate YouTube authorization.');
    }

    const { url } = await response.json();
    if (!url) {
      throw new Error('No authorization URL returned from server.');
    }

    // 2. Open provider's OAuth URL directly in popup (per OAuth preview constraints)
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'youtube_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      onError('Popup blocked. Please allow popups in your browser to connect your YouTube account.');
      return null;
    }

    // 3. Listen for postMessage from callback window
    const messageHandler = async (event: MessageEvent) => {
      // Validate origin if not local
      if (
        !event.origin.includes('localhost') &&
        !event.origin.endsWith('.run.app')
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        try {
          const account = await getYouTubeAccount();
          onSuccess(account);
        } catch (e: any) {
          onError(e.message || 'Failed to fetch account after authorization.');
        }
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        onError(event.data.error || 'Authorization was cancelled or denied.');
      }
    };

    window.addEventListener('message', messageHandler);

    // Clean up listener if window is closed without message
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
      }
    }, 1000);

    return popup;
  } catch (err: any) {
    console.error('[YouTube OAuth] Initiation error:', err);
    onError(err.message || 'Failed to connect YouTube account.');
    return null;
  }
}
