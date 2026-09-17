import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { youtubeRouter } from "./server/youtube/routes";

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// URL Parser & Platform detector
function parseSocialUrl(rawUrl: string) {
  const cleanUrl = rawUrl.trim();
  let platform: 'youtube' | 'instagram' | 'facebook' | 'telegram' | 'tiktok' = 'youtube';
  let contentType = 'generic_url';
  let creator = 'Unknown Creator';
  let creatorHandle = '@creator';
  let title = 'Social Media Content';
  let embedUrl: string | undefined = undefined;

  try {
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      platform = 'youtube';
      if (pathname.includes('/shorts/')) {
        contentType = 'youtube_short';
        const shortId = pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
        if (shortId) embedUrl = `https://www.youtube.com/embed/${shortId}`;
        title = `YouTube Short (${shortId || 'clip'})`;
      } else if (pathname.includes('/watch')) {
        contentType = 'youtube_video';
        const videoId = parsed.searchParams.get('v');
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        title = `YouTube Video (${videoId || 'video'})`;
      } else if (hostname.includes('youtu.be')) {
        contentType = 'youtube_video';
        const videoId = pathname.replace('/', '').split('?')[0];
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
        title = `YouTube Video (${videoId || 'clip'})`;
      } else if (pathname.includes('/@')) {
        contentType = 'youtube_channel';
        const handle = pathname.split('/')[1]?.split('?')[0];
        creator = handle.replace('@', '');
        creatorHandle = handle;
        title = `${creatorHandle} Channel`;
      } else {
        contentType = 'youtube_video';
        title = 'YouTube Content';
      }
    } else if (hostname.includes('instagram.com')) {
      platform = 'instagram';
      if (pathname.includes('/reel/') || pathname.includes('/reels/')) {
        contentType = 'instagram_reel';
        const reelId = pathname.split('/reel')[1]?.replace('s/', '/').split('/')[1];
        title = `Instagram Reel (${reelId || 'video'})`;
      } else if (pathname.includes('/p/')) {
        contentType = 'instagram_post';
        const postId = pathname.split('/p/')[1]?.split('/')[0];
        title = `Instagram Post (${postId || 'photo'})`;
      } else {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 1 && !['explore', 'stories', 'direct'].includes(segments[0])) {
          contentType = 'instagram_profile';
          creator = segments[0];
          creatorHandle = `@${segments[0]}`;
          title = `@${creator} Instagram Profile`;
        } else {
          contentType = 'instagram_post';
          title = 'Instagram Content';
        }
      }
    } else if (hostname.includes('facebook.com') || hostname.includes('fb.watch') || hostname.includes('fb.com')) {
      platform = 'facebook';
      if (pathname.includes('/reel/') || pathname.includes('/watch/')) {
        contentType = pathname.includes('/reel/') ? 'facebook_reel' : 'facebook_video';
        title = 'Facebook Video Content';
      } else if (pathname.includes('/posts/') || pathname.includes('/story.php')) {
        contentType = 'facebook_post';
        title = 'Facebook Post';
      } else {
        contentType = 'facebook_page';
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          creator = segments[0];
          creatorHandle = `@${segments[0]}`;
          title = `${creator} Facebook Page`;
        } else {
          title = 'Facebook Content';
        }
      }
    } else if (hostname.includes('t.me') || hostname.includes('telegram.me')) {
      platform = 'telegram';
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        contentType = 'telegram_post';
        creator = parts[0];
        creatorHandle = `@${parts[0]}`;
        title = `Telegram Post ${parts[0]}/${parts[1]}`;
        // Telegram widget preview endpoint
        embedUrl = `https://t.me/${parts[0]}/${parts[1]}?embed=1`;
      } else if (parts.length === 1) {
        contentType = 'telegram_channel';
        creator = parts[0];
        creatorHandle = `@${parts[0]}`;
        title = `Telegram Channel @${parts[0]}`;
      } else {
        contentType = 'telegram_post';
        title = 'Telegram Content';
      }
    }
  } catch (err) {
    console.error("URL parsing error:", err);
  }

  return {
    platform,
    contentType,
    creator,
    creatorHandle,
    title,
    embedUrl,
    url: cleanUrl
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  // Mount YouTube integration routes
  app.use("/api/youtube", youtubeRouter);

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      app: "Content Test Lab",
      version: "1.0.0",
      time: new Date().toISOString()
    });
  });

  // URL Parsing API
  app.post("/api/content/detect-url", (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "A valid URL string is required." });
    }
    const detected = parseSocialUrl(url);
    res.json({ success: true, data: detected });
  });

  // AI Content Analysis with Gemini
  app.post("/api/gemini/analyze-content", async (req, res) => {
    try {
      const {
        url,
        platform,
        contentType,
        creator,
        title,
        hook,
        first3Seconds,
        topic,
        format,
        editingStyle,
        caption,
        cta,
        userObservations
      } = req.body;

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in the environment. Please check the Secrets panel.",
          fallback: true
        });
      }

      const prompt = `You are an expert Social Media Algorithm & Content Strategist for Content Test Lab.
Analyze the following social media post/video rigorously based strictly on the user-provided data and URL:

URL: ${url || 'N/A'}
Platform: ${platform || 'N/A'}
Content Type: ${contentType || 'N/A'}
Creator: ${creator || 'N/A'}
Title: ${title || 'N/A'}
User-Observed Hook: ${hook || 'N/A'}
First 3 Seconds: ${first3Seconds || 'N/A'}
Topic: ${topic || 'N/A'}
Format: ${format || 'N/A'}
Editing Style: ${editingStyle || 'N/A'}
Caption: ${caption || 'N/A'}
Call to Action (CTA): ${cta || 'N/A'}
User Observations: ${JSON.stringify(userObservations || {})}

IMPORTANT PRODUCT PRINCIPLES:
1. Clearly separate "Observed Facts" from "AI Interpretations".
2. NEVER invent or fabricate unavailable metrics (e.g. do not guess views, likes, shares, or follower counts).
3. Provide rigorous, actionable qualitative breakdowns for:
   - Hook breakdown (why it stops the scroll or fails to)
   - Opening 3-second pacing & retention mechanics
   - Story/narrative arc & structure
   - Visual editing patterns, b-roll, audio pacing
   - Caption & Call to Action friction
   - Target audience appeal & psychology
   - Predicted comment section drivers / debate triggers
   - 3-5 key engagement drivers
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an objective, senior social video analyst. Output structured qualitative breakdowns without fake metrics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hookBreakdown: { type: Type.STRING },
              openingPacing: { type: Type.STRING },
              storyStructure: { type: Type.STRING },
              editingAndVisualPattern: { type: Type.STRING },
              captionAndCtaAnalysis: { type: Type.STRING },
              audienceAppeal: { type: Type.STRING },
              commentThemesPrediction: { type: Type.STRING },
              contentFormatType: { type: Type.STRING },
              engagementDrivers: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              observedFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              aiInterpretations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: [
              "hookBreakdown",
              "openingPacing",
              "storyStructure",
              "editingAndVisualPattern",
              "captionAndCtaAnalysis",
              "audienceAppeal",
              "commentThemesPrediction",
              "contentFormatType",
              "engagementDrivers",
              "observedFacts",
              "aiInterpretations"
            ]
          }
        }
      });

      const responseText = response.text?.trim() || "{}";
      const parsed = JSON.parse(responseText);

      return res.json({
        success: true,
        analysis: {
          ...parsed,
          analyzedAt: new Date().toISOString(),
          modelName: "gemini-3.8-flash"
        }
      });
    } catch (err: any) {
      console.error("Gemini analysis error:", err);
      res.status(500).json({
        error: err.message || "Failed to analyze content using Gemini AI."
      });
    }
  });

  // AI Comment Improvement with Gemini
  app.post("/api/gemini/improve-comment", async (req, res) => {
    try {
      const { originalComment, tone, platform, contentContext } = req.body;

      if (!originalComment || typeof originalComment !== 'string') {
        return res.status(400).json({ error: "Comment text is required." });
      }

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured in the environment.",
          fallback: true
        });
      }

      const prompt = `You are a social media comment strategist for a research testing account on ${platform || 'social media'}.
Refine the following draft comment:

Original Draft: "${originalComment}"
Desired Tone: ${tone || 'engaging and thoughtful'}
Content Context: "${contentContext || 'general research'}"

CRITICAL RULES:
1. You are providing improved variations for human review. Never pretend this comment has been posted.
2. Provide 3 distinct variations:
   - Option A: Clear & Natural (improved grammar and flow while preserving the user's voice)
   - Option B: High-Engagement Question (triggers thoughtful replies or creator responses)
   - Option C: Concise & Punchy (short, high-impact phrasing suitable for quick mobile reading)
3. Also provide a 1-sentence explanation of why these improvements boost conversational value.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optionNatural: { type: Type.STRING },
              optionEngaging: { type: Type.STRING },
              optionConcise: { type: Type.STRING },
              strategicRationale: { type: Type.STRING }
            },
            required: ["optionNatural", "optionEngaging", "optionConcise", "strategicRationale"]
          }
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json({
        success: true,
        improved: parsed
      });
    } catch (err: any) {
      console.error("Comment improvement error:", err);
      res.status(500).json({
        error: err.message || "Failed to improve comment."
      });
    }
  });

  // Legitimate Temporary Email Connector / OTP Helper Endpoint
  // Supports polling authorized disposable inbox APIs (e.g. mail.tm or 1secmail) without faking data
  app.post("/api/temp-email/check-inbox", async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: "Valid email address is required." });
    }

    const [login, domain] = email.split('@');

    // If 1secmail or mail.tm compatible domain:
    if (['1secmail.com', '1secmail.net', '1secmail.org'].includes(domain)) {
      try {
        const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
        if (response.ok) {
          const messages: any[] = await response.json();
          return res.json({
            supported: true,
            provider: '1secmail',
            messagesCount: messages.length,
            messages: messages.slice(0, 5)
          });
        }
      } catch (e) {
        console.warn("External temp email API check failed:", e);
      }
    }

    // Otherwise inform the frontend that this email provider requires standard manual OTP entry
    return res.json({
      supported: false,
      provider: 'custom_or_external',
      message: "Direct API polling not enabled for this domain. Please check your inbox in a separate tab and enter the code manually."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Content Test Lab server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
