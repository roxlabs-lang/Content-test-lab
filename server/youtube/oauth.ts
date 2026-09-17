import { createOAuthState, verifyOAuthState } from './tokenStore';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'openid',
  'profile',
  'email',
];

export function getOAuthCredentials() {
  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
  return {
    clientId: clientId.trim(),
    clientSecret: clientSecret.trim(),
    isConfigured: Boolean(clientId.trim() && clientSecret.trim()),
  };
}

export function buildAuthorizationUrl(redirectUri: string): { authUrl: string; state: string } {
  const { clientId, isConfigured } = getOAuthCredentials();
  if (!isConfigured) {
    throw new Error('YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are not configured on the server.');
  }

  const state = createOAuthState(redirectUri);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent', // Ensure refresh token is generated
    state,
  });

  return {
    authUrl: `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`,
    state,
  };
}

export async function exchangeAuthorizationCode(code: string, redirectUri: string) {
  const { clientId, clientSecret, isConfigured } = getOAuthCredentials();
  if (!isConfigured) {
    throw new Error('OAuth credentials are not configured on the server.');
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[YouTube OAuth] Token exchange error:', response.status, errorBody);
    throw new Error(`Failed to exchange authorization code: ${response.status} ${errorBody}`);
  }

  const tokens = await response.json();
  return {
    accessToken: tokens.access_token as string,
    refreshToken: tokens.refresh_token as string | undefined,
    expiresIn: tokens.expires_in as number, // in seconds
    scope: tokens.scope as string,
  };
}

export async function fetchAuthenticatedChannel(accessToken: string) {
  try {
    // 1. Fetch channel profile via YouTube Data API
    const ytRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    let channelId: string | undefined = undefined;
    let channelTitle: string | undefined = undefined;
    let channelHandle: string | undefined = undefined;
    let avatarUrl: string | undefined = undefined;

    if (ytRes.ok) {
      const ytData = await ytRes.json();
      if (ytData.items && ytData.items.length > 0) {
        const item = ytData.items[0];
        channelId = item.id;
        channelTitle = item.snippet?.title;
        channelHandle = item.snippet?.customUrl;
        avatarUrl = item.snippet?.thumbnails?.default?.url || item.snippet?.thumbnails?.medium?.url;
      }
    } else {
      console.warn('[YouTube OAuth] channels.list returned non-ok:', ytRes.status, await ytRes.text());
    }

    // 2. Fetch Google userinfo for fallback email / display name
    let email: string | undefined = undefined;
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (userRes.ok) {
        const userInfo = await userRes.json();
        email = userInfo.email;
        if (!channelTitle && userInfo.name) {
          channelTitle = userInfo.name;
        }
        if (!avatarUrl && userInfo.picture) {
          avatarUrl = userInfo.picture;
        }
      }
    } catch (e) {
      console.warn('[YouTube OAuth] userinfo fetch failed:', e);
    }

    return {
      channelId,
      channelTitle: channelTitle || email || 'Connected YouTube User',
      channelHandle: channelHandle || (channelTitle ? `@${channelTitle.replace(/\s+/g, '').toLowerCase()}` : undefined),
      avatarUrl,
      email,
    };
  } catch (err) {
    console.error('[YouTube OAuth] Error fetching user profile:', err);
    return {
      channelId: undefined,
      channelTitle: 'YouTube Account',
      channelHandle: undefined,
      avatarUrl: undefined,
      email: undefined,
    };
  }
}
