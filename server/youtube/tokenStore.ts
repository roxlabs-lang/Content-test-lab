import crypto from 'crypto';

export interface YouTubeSession {
  sessionId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // timestamp in ms
  channelId?: string;
  channelTitle?: string;
  channelHandle?: string;
  avatarUrl?: string;
  email?: string;
  createdAt: number;
}

// In-memory token store for sessions and OAuth state tokens
const sessions = new Map<string, YouTubeSession>();
const oauthStates = new Map<string, { createdAt: number; redirectUri: string }>();

// Clean up stale states every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.createdAt > 15 * 60 * 1000) {
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

export function createOAuthState(redirectUri: string): string {
  const state = crypto.randomBytes(24).toString('hex');
  oauthStates.set(state, { createdAt: Date.now(), redirectUri });
  return state;
}

export function verifyOAuthState(state: string): boolean {
  if (!state || !oauthStates.has(state)) {
    return false;
  }
  oauthStates.delete(state);
  return true;
}

export function saveSession(sessionData: Omit<YouTubeSession, 'sessionId' | 'createdAt'>, existingSessionId?: string): YouTubeSession {
  const sessionId = existingSessionId || crypto.randomUUID();
  const session: YouTubeSession = {
    ...sessionData,
    sessionId,
    createdAt: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

export function getSession(sessionId?: string): YouTubeSession | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;
  return session;
}

export function deleteSession(sessionId?: string): boolean {
  if (!sessionId) return false;
  return sessions.delete(sessionId);
}

export async function getValidAccessToken(sessionId?: string): Promise<{ accessToken: string; session: YouTubeSession } | null> {
  const session = getSession(sessionId);
  if (!session) return null;

  // If token is valid for at least 60 more seconds, return it directly
  if (Date.now() < session.expiresAt - 60 * 1000) {
    return { accessToken: session.accessToken, session };
  }

  // Token expired or about to expire; attempt refresh if refresh token exists
  if (!session.refreshToken) {
    console.warn('[YouTube Auth] Token expired and no refresh token available for session:', sessionId);
    return null;
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('[YouTube Auth] Cannot refresh token: missing CLIENT_ID or CLIENT_SECRET');
    return null;
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: session.refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[YouTube Auth] Token refresh failed:', response.status, errBody);
      return null;
    }

    const data = await response.json();
    session.accessToken = data.access_token;
    session.expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    sessions.set(session.sessionId, session);

    return { accessToken: session.accessToken, session };
  } catch (err) {
    console.error('[YouTube Auth] Network error refreshing token:', err);
    return null;
  }
}
