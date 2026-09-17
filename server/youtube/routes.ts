import { Router, Request, Response } from 'express';
import {
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  fetchAuthenticatedChannel,
  getOAuthCredentials,
} from './oauth';
import {
  saveSession,
  getSession,
  deleteSession,
  getValidAccessToken,
  verifyOAuthState,
} from './tokenStore';
import {
  getVideoDetails,
  getVideoRating,
  rateVideo,
  getComments,
  postComment,
  getChannelSubscription,
  subscribeChannel,
  saveToPlaylist,
} from './api';

export const youtubeRouter = Router();

// Helper to determine redirect URI dynamically or from environment
function getRedirectUri(req: Request): string {
  if (process.env.APP_URL) {
    const base = process.env.APP_URL.replace(/\/$/, '');
    return `${base}/api/youtube/auth/callback`;
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}/api/youtube/auth/callback`;
}

// Helper to get sessionId from cookie or Authorization header
function getSessionIdFromRequest(req: Request): string | undefined {
  if (req.cookies && req.cookies.yt_session_id) {
    return req.cookies.yt_session_id;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return undefined;
}

// 1. CONFIG & STATUS CHECK
youtubeRouter.get('/config', (req: Request, res: Response) => {
  const { clientId, isConfigured } = getOAuthCredentials();
  const hasApiKey = Boolean(process.env.YOUTUBE_API_KEY || process.env.GOOGLE_API_KEY);
  const redirectUri = getRedirectUri(req);

  res.json({
    configured: isConfigured,
    hasApiKey,
    clientIdConfigured: Boolean(clientId),
    redirectUri,
    environmentKeysNeeded: isConfigured
      ? []
      : ['YOUTUBE_CLIENT_ID', 'YOUTUBE_CLIENT_SECRET'],
  });
});

// 2. AUTHENTICATED ACCOUNT INFO
youtubeRouter.get('/account', async (req: Request, res: Response) => {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.json({ connected: false });
  }

  const valid = await getValidAccessToken(sessionId);
  if (!valid) {
    return res.json({ connected: false, expired: true });
  }

  const session = valid.session;
  res.json({
    connected: true,
    channelId: session.channelId || null,
    channelTitle: session.channelTitle || 'Connected YouTube User',
    channelHandle: session.channelHandle || null,
    avatarUrl: session.avatarUrl || null,
    email: session.email || null,
    sessionId: session.sessionId,
  });
});

// 3. START OAUTH POPUP
youtubeRouter.get('/auth/start', (req: Request, res: Response) => {
  const { isConfigured } = getOAuthCredentials();
  if (!isConfigured) {
    return res.status(503).json({
      error: 'YouTube OAuth credentials (YOUTUBE_CLIENT_ID & YOUTUBE_CLIENT_SECRET) are not configured in the environment.',
      needsSetup: true,
      redirectUri: getRedirectUri(req),
    });
  }

  try {
    const redirectUri = getRedirectUri(req);
    const { authUrl, state } = buildAuthorizationUrl(redirectUri);
    res.json({ url: authUrl, state });
  } catch (err: any) {
    console.error('[YouTube Auth] Start error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate OAuth URL.' });
  }
});

// 4. OAUTH CALLBACK
youtubeRouter.get(['/auth/callback', '/auth/callback/'], async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  const error = req.query.error as string;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #09090b; color: #f43f5e; padding: 24px; text-align: center;">
          <h2>Google Authorization Denied</h2>
          <p>${escape(error)}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${escape(error)}' }, '*');
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  // Verify OAuth CSRF state
  const isStateValid = verifyOAuthState(state);
  if (!isStateValid) {
    console.warn('[YouTube OAuth] Invalid or expired OAuth state:', state);
  }

  try {
    const redirectUri = getRedirectUri(req);
    const tokenData = await exchangeAuthorizationCode(code, redirectUri);
    const channelProfile = await fetchAuthenticatedChannel(tokenData.accessToken);

    const session = saveSession({
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: Date.now() + (tokenData.expiresIn || 3600) * 1000,
      channelId: channelProfile.channelId,
      channelTitle: channelProfile.channelTitle,
      channelHandle: channelProfile.channelHandle,
      avatarUrl: channelProfile.avatarUrl,
      email: channelProfile.email,
    });

    // Set secure cross-origin HTTP-only cookie
    res.cookie('yt_session_id', session.sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube Connected</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background-color: #09090b;
              color: #f4f4f5;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: #18181b;
              border: 1px solid #27272a;
              border-radius: 16px;
              padding: 24px;
              text-align: center;
              max-width: 360px;
            }
            .check {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background: rgba(16, 185, 129, 0.2);
              color: #10b981;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              margin: 0 auto 16px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="check">✓</div>
            <h2 style="margin: 0 0 8px 0; font-size: 18px;">YouTube Connected</h2>
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 16px 0;">
              Account: <strong>${escape(channelProfile.channelTitle || 'Google User')}</strong>
            </p>
            <p style="color: #71717a; font-size: 12px; margin: 0;">
              Closing window and returning to Content Test Lab...
            </p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'OAUTH_AUTH_SUCCESS',
                  sessionId: '${session.sessionId}',
                  channelTitle: '${escape(channelProfile.channelTitle || '')}',
                  channelHandle: '${escape(channelProfile.channelHandle || '')}',
                }, '*');
                setTimeout(() => window.close(), 600);
              } else {
                window.location.href = '/';
              }
            } catch (e) {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('[YouTube Auth] Callback handling error:', err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background: #09090b; color: #f43f5e; padding: 24px; text-align: center;">
          <h2>Authentication Failed</h2>
          <p>${escape(err.message || 'Unknown error during token exchange.')}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: '${escape(err.message || '')}' }, '*');
            }
          </script>
        </body>
      </html>
    `);
  }
});

// 5. DISCONNECT
youtubeRouter.post('/auth/disconnect', (req: Request, res: Response) => {
  const sessionId = getSessionIdFromRequest(req);
  if (sessionId) {
    deleteSession(sessionId);
  }
  res.clearCookie('yt_session_id', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ success: true, connected: false });
});

// 6. VIDEO METADATA & PUBLIC STATISTICS
youtubeRouter.get('/videos/:videoId', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Valid videoId is required.' });
  }

  const sessionId = getSessionIdFromRequest(req);
  const auth = sessionId ? await getValidAccessToken(sessionId) : null;

  try {
    const videoData = await getVideoDetails(videoId, auth?.accessToken);
    res.json({ success: true, video: videoData });
  } catch (err: any) {
    console.error(`[YouTube API] Failed to fetch video ${videoId}:`, err);
    const status = err.status || 500;
    let message = err.message || 'Failed to fetch YouTube video details.';
    if (status === 404) message = "This YouTube content couldn't be found.";
    if (status === 403) message = "YouTube authorization doesn't allow fetching this video.";
    if (status === 429) message = 'YouTube API quota limit reached.';
    res.status(status).json({ error: message, status });
  }
});

// 7. GET VIDEO USER RATING
youtubeRouter.get('/videos/:videoId/rating', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.status(401).json({ error: 'YouTube account needs to be connected.', rating: 'none' });
  }

  const auth = await getValidAccessToken(sessionId);
  if (!auth) {
    return res.status(401).json({ error: 'YouTube session expired. Please reconnect.', rating: 'none' });
  }

  try {
    const rating = await getVideoRating(videoId, auth.accessToken);
    res.json({ success: true, rating });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to retrieve rating.', rating: 'none' });
  }
});

// 8. RATE VIDEO (LIKE / UNLIKE)
youtubeRouter.post('/videos/:videoId/rate', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { rating } = req.body; // 'like' | 'none'

  if (rating !== 'like' && rating !== 'none') {
    return res.status(400).json({ error: "Invalid rating value. Must be 'like' or 'none'." });
  }

  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.status(401).json({ error: 'YouTube account needs to be connected to like videos.' });
  }

  const auth = await getValidAccessToken(sessionId);
  if (!auth) {
    return res.status(401).json({ error: 'YouTube session expired. Please reconnect.' });
  }

  try {
    await rateVideo(videoId, rating, auth.accessToken);
    res.json({
      success: true,
      videoId,
      rating,
      confirmedAt: Date.now(),
      notice: 'Rating updated on YouTube. Google notes videos.rate does not alter public like counters.',
    });
  } catch (err: any) {
    const status = err.status || 500;
    let message = err.message || 'Failed to update video rating.';
    if (status === 403) message = "YouTube authorization doesn't allow this action.";
    if (status === 401) message = 'YouTube account needs to be connected.';
    if (status === 429) message = 'YouTube API quota limit reached.';
    res.status(status).json({ error: message, status });
  }
});

// 9. COMMENTS LIST
youtubeRouter.get('/videos/:videoId/comments', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const pageToken = req.query.pageToken as string | undefined;

  const sessionId = getSessionIdFromRequest(req);
  const auth = sessionId ? await getValidAccessToken(sessionId) : null;

  try {
    const data = await getComments(videoId, pageToken, auth?.accessToken);
    res.json({ success: true, ...data });
  } catch (err: any) {
    const status = err.status || 500;
    let message = err.message || 'Failed to load comments.';
    if (status === 403) message = err.reason === 'commentsDisabled' ? 'Comments are disabled for this video.' : "YouTube authorization doesn't allow viewing comments.";
    if (status === 429) message = 'YouTube API quota limit reached.';
    res.status(status).json({ error: message, status });
  }
});

// 10. POST COMMENT
youtubeRouter.post('/videos/:videoId/comments', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Comment text cannot be empty.' });
  }

  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.status(401).json({ error: 'YouTube account needs to be connected to post comments.' });
  }

  const auth = await getValidAccessToken(sessionId);
  if (!auth) {
    return res.status(401).json({ error: 'YouTube session expired. Please reconnect.' });
  }

  try {
    const created = await postComment(videoId, text.trim(), auth.accessToken);
    res.json({
      success: true,
      commentId: created.id,
      text: text.trim(),
      postedAt: Date.now(),
      method: 'youtube_api',
      created,
    });
  } catch (err: any) {
    const status = err.status || 500;
    let message = err.message || 'Failed to post comment to YouTube.';
    if (err.reason === 'commentsDisabled') message = 'Comments are disabled for this video.';
    if (status === 403) message = "YouTube authorization doesn't allow posting comments with this account.";
    if (status === 401) message = 'YouTube account needs to be connected.';
    if (status === 429) message = 'YouTube API quota limit reached.';
    res.status(status).json({ error: message, status });
  }
});

// 11. CHECK CHANNEL SUBSCRIPTION
youtubeRouter.get('/channels/:channelId/subscription', async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.json({ isSubscribed: false, connected: false });
  }

  const auth = await getValidAccessToken(sessionId);
  if (!auth) {
    return res.json({ isSubscribed: false, connected: false });
  }

  try {
    const result = await getChannelSubscription(channelId, auth.accessToken);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.json({ isSubscribed: false, error: err.message });
  }
});

// 12. SUBSCRIBE TO CHANNEL
youtubeRouter.post('/channels/:channelId/subscribe', async (req: Request, res: Response) => {
  const { channelId } = req.params;
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.status(401).json({ error: 'YouTube account needs to be connected to subscribe to channels.' });
  }

  const auth = await getValidAccessToken(sessionId);
  if (!auth) {
    return res.status(401).json({ error: 'YouTube session expired. Please reconnect.' });
  }

  try {
    const result = await subscribeChannel(channelId, auth.accessToken);
    res.json({
      success: true,
      subscribedAt: Date.now(),
      channelId,
      subscriptionId: result.subscriptionId,
    });
  } catch (err: any) {
    const status = err.status || 500;
    let message = err.message || 'Failed to subscribe to channel.';
    if (status === 403) message = "YouTube authorization doesn't allow subscribing with this account.";
    if (status === 401) message = 'YouTube account needs to be connected.';
    if (status === 429) message = 'YouTube API quota limit reached.';
    res.status(status).json({ error: message, status });
  }
});

// 13. SAVE TO PLAYLIST ("Content Test Lab Saves")
youtubeRouter.post('/videos/:videoId/save', async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) {
    return res.status(401).json({ error: 'YouTube account needs to be connected to save videos.' });
  }

  const auth = await getValidAccessToken(sessionId);
  if (!auth) {
    return res.status(401).json({ error: 'YouTube session expired. Please reconnect.' });
  }

  try {
    const result = await saveToPlaylist(videoId, auth.accessToken);
    res.json({
      success: true,
      savedAt: Date.now(),
      videoId,
      playlistId: result.playlistId,
      playlistTitle: result.playlistTitle,
      itemId: result.itemId,
    });
  } catch (err: any) {
    const status = err.status || 500;
    let message = err.message || 'Failed to save video to YouTube playlist.';
    if (status === 403) message = "YouTube authorization doesn't allow playlist modifications.";
    if (status === 401) message = 'YouTube account needs to be connected.';
    if (status === 429) message = 'YouTube API quota limit reached.';
    res.status(status).json({ error: message, status });
  }
});
