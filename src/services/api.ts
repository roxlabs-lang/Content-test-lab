import { AIContentAnalysisResult, ContentItem, Platform } from '../types';

export interface DetectUrlResult {
  platform: Platform;
  contentType: string;
  creator: string;
  creatorHandle: string;
  title: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  url: string;
}

export interface CommentImprovementResult {
  optionNatural: string;
  optionEngaging: string;
  optionConcise: string;
  strategicRationale: string;
}

export async function checkServerHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Health check error:", e);
  }
  return { status: 'offline', hasGeminiKey: false };
}

export async function detectContentUrl(url: string): Promise<DetectUrlResult> {
  try {
    const res = await fetch('/api/content/detect-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (e) {
    console.warn("Server detect-url failed, using client fallback", e);
  }

  // Fallback client detection
  return fallbackClientDetectUrl(url);
}

function fallbackClientDetectUrl(url: string): DetectUrlResult {
  const clean = url.trim();
  let platform: Platform = 'youtube';
  let contentType = 'generic_url';
  let creator = 'Unknown Creator';
  let creatorHandle = '@creator';
  let title = 'Social Media Content';
  let embedUrl: string | undefined = undefined;

  try {
    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;

    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      platform = 'youtube';
      if (path.includes('/shorts/')) {
        contentType = 'youtube_short';
        const id = path.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
        if (id) embedUrl = `https://www.youtube.com/embed/${id}`;
        title = `YouTube Short (${id || 'clip'})`;
      } else if (path.includes('/watch')) {
        contentType = 'youtube_video';
        const v = parsed.searchParams.get('v');
        if (v) embedUrl = `https://www.youtube.com/embed/${v}`;
        title = `YouTube Video (${v || 'video'})`;
      } else {
        contentType = 'youtube_video';
        title = 'YouTube Video';
      }
    } else if (host.includes('instagram.com')) {
      platform = 'instagram';
      if (path.includes('/reel/')) {
        contentType = 'instagram_reel';
        title = 'Instagram Reel';
      } else if (path.includes('/p/')) {
        contentType = 'instagram_post';
        title = 'Instagram Post';
      } else {
        contentType = 'instagram_profile';
        title = 'Instagram Profile';
      }
    } else if (host.includes('facebook.com') || host.includes('fb.watch')) {
      platform = 'facebook';
      contentType = path.includes('/reel') ? 'facebook_reel' : 'facebook_video';
      title = 'Facebook Video';
    } else if (host.includes('t.me') || host.includes('telegram.me')) {
      platform = 'telegram';
      contentType = 'telegram_post';
      title = 'Telegram Post';
      const parts = path.split('/').filter(Boolean);
      if (parts.length >= 2) {
        embedUrl = `https://t.me/${parts[0]}/${parts[1]}?embed=1`;
        creator = parts[0];
        creatorHandle = `@${parts[0]}`;
      }
    }
  } catch (e) {
    console.error("Invalid URL:", e);
  }

  return {
    platform,
    contentType,
    creator,
    creatorHandle,
    title,
    embedUrl,
    url: clean
  };
}

export async function analyzeContentWithGemini(payload: {
  url: string;
  platform: string;
  contentType: string;
  creator: string;
  title: string;
  hook?: string;
  first3Seconds?: string;
  topic?: string;
  format?: string;
  editingStyle?: string;
  caption?: string;
  cta?: string;
  userObservations?: Record<string, string>;
}): Promise<{ success: boolean; analysis?: AIContentAnalysisResult; error?: string }> {
  try {
    const res = await fetch('/api/gemini/analyze-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Server error occurred during analysis.' };
    }
    return { success: true, analysis: data.analysis };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Gemini analyzer.'
    };
  }
}

export async function improveCommentWithGemini(payload: {
  originalComment: string;
  tone: string;
  platform: string;
  contentContext?: string;
}): Promise<{ success: boolean; improved?: CommentImprovementResult; error?: string }> {
  try {
    const res = await fetch('/api/gemini/improve-comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to refine comment with Gemini.' };
    }
    return { success: true, improved: data.improved };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Gemini comment assistant.'
    };
  }
}

export type CommentAiAction = 'improve' | 'shorten' | 'make_clearer' | 'fix_grammar';

export async function processCommentWithAi(
  originalComment: string,
  action: CommentAiAction,
  platform: string = 'social media'
): Promise<{ text: string; rationale?: string }> {
  try {
    const toneMap: Record<CommentAiAction, string> = {
      improve: 'engaging, thoughtful, and high-quality',
      shorten: 'concise, punchy, and brief',
      make_clearer: 'crystal clear, structured, and easy to understand',
      fix_grammar: 'grammatically flawless and natural flow'
    };

    const res = await improveCommentWithGemini({
      originalComment,
      tone: toneMap[action] || 'engaging',
      platform,
      contentContext: `Action requested: ${action}`
    });

    if (res.success && res.improved) {
      if (action === 'shorten') {
        return {
          text: res.improved.optionConcise || res.improved.optionNatural,
          rationale: res.improved.strategicRationale
        };
      }
      if (action === 'make_clearer') {
        return {
          text: res.improved.optionNatural || res.improved.optionEngaging,
          rationale: res.improved.strategicRationale
        };
      }
      if (action === 'fix_grammar') {
        return {
          text: res.improved.optionNatural,
          rationale: 'Cleaned grammar and punctuation'
        };
      }
      return {
        text: res.improved.optionEngaging || res.improved.optionNatural,
        rationale: res.improved.strategicRationale
      };
    }
  } catch (err) {
    console.warn('AI comment assistance error:', err);
  }

  // Client-side heuristic fallback so tool is functional even offline
  const trimmed = originalComment.trim();
  if (action === 'shorten') {
    const sentences = trimmed.split(/(?<=[.?!])\s+/);
    const shortened = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join(' ');
    return { text: shortened || trimmed, rationale: 'Condensed sentences for fast mobile reading' };
  }
  if (action === 'fix_grammar') {
    // Capitalize first letter and ensure ending period
    const cleaned = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    const withPeriod = /[.?!]$/.test(cleaned) ? cleaned : `${cleaned}.`;
    return { text: withPeriod, rationale: 'Formatted sentence capitalization and punctuation' };
  }
  if (action === 'make_clearer') {
    const cleaned = trimmed.replace(/\s+/g, ' ');
    return { text: cleaned, rationale: 'Clarified spacing and structure' };
  }

  return {
    text: trimmed,
    rationale: 'Draft preserved'
  };
}

export async function improveCommentDraft(
  commentText: string,
  tone: string = 'engaging and thoughtful',
  platform: string = 'instagram',
  contentTitle?: string
): Promise<{ success: boolean; improved?: any; error?: string }> {
  return improveCommentWithGemini({
    originalComment: commentText,
    tone,
    platform,
    contentContext: contentTitle
  });
}

export async function checkTempEmailInbox(email: string): Promise<{
  supported: boolean;
  provider: string;
  message?: string;
  messages?: Array<{ id: number; from: string; subject: string; date: string }>;
}> {
  try {
    const res = await fetch('/api/temp-email/check-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Temp email check failed:", e);
  }
  return {
    supported: false,
    provider: 'manual',
    message: 'Manual OTP verification enabled.'
  };
}
