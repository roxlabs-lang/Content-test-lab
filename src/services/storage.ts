import { TestAccount, Experiment, ContentItem, ResearchNote } from '../types';

const ACCOUNTS_KEY = 'ctl_test_accounts_v1';
const EXPERIMENTS_KEY = 'ctl_experiments_v1';
const NOTES_KEY = 'ctl_research_notes_v1';
const ACTIVE_ACCOUNT_KEY = 'ctl_active_account_id_v1';

export const INITIAL_ACCOUNTS: TestAccount[] = [
  {
    id: 'acc-1',
    platform: 'instagram',
    mode: 'manual',
    email: 'lab_scout_insta@testlab.internal',
    username: 'creator_lab_test',
    displayName: 'Lab Scout (IG)',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Dedicated test account for Reels breakdown, hook testing, and creator pacing analysis.',
    notes: 'Used specifically for short-form retention experiments and lifestyle hook evaluation.',
    status: 'connected',
    isActive: true,
    sessionTokenRef: 'tok_ig_sec_8921a9f',
    sessionExpiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-12T14:30:00Z',
  },
  {
    id: 'acc-2',
    platform: 'youtube',
    mode: 'manual',
    email: 'yt_researcher_temp@testlab.internal',
    username: 'algorithm_tester_yt',
    displayName: 'Algo Explorer (YT)',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Clean feed tester for YouTube Shorts & long-form retention drops.',
    notes: 'Kept isolated from personal Google subscriptions so recommendations stay unskewed.',
    status: 'connected',
    isActive: false,
    sessionTokenRef: 'tok_yt_sec_1048b7c',
    sessionExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
    createdAt: '2026-08-20T12:00:00Z',
    updatedAt: '2026-09-10T11:20:00Z',
  },
  {
    id: 'acc-3',
    platform: 'telegram',
    mode: 'manual',
    email: 'tg_intel_bot@testlab.internal',
    username: 'tg_feed_monitor',
    displayName: 'TG Channel Monitor',
    profilePicture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'Observational account monitoring tech news channels and newsletter digests.',
    notes: 'Used to benchmark instant broadcast engagement and community commentary.',
    status: 'connected',
    isActive: false,
    sessionTokenRef: 'tok_tg_sec_6641e2a',
    sessionExpiresAt: new Date(Date.now() + 86400000 * 60).toISOString(),
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-15T09:15:00Z',
  },
  {
    id: 'acc-4',
    platform: 'facebook',
    mode: 'manual',
    email: 'fb_sandbox_media@testlab.internal',
    username: 'sandbox_fb_tester',
    displayName: 'FB Video Sandbox',
    profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Testing Facebook Reels retention and long-form storytelling cadence.',
    notes: 'Targeting middle-demographic virality and shareable emotional hooks.',
    status: 'disconnected',
    isActive: false,
    createdAt: '2026-09-05T15:00:00Z',
    updatedAt: '2026-09-14T16:00:00Z',
  }
];

export const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-001',
    experimentNumber: 'EXP-001',
    testAccountId: 'acc-2',
    contentId: 'cnt-1',
    watched: true,
    liked: true,
    commented: true,
    shared: false,
    followed: true,
    saved: true,
    content: {
      id: 'cnt-1',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      type: 'video',
      contentType: 'youtube_video',
      creator: 'Rick Astley',
      creatorHandle: '@RickAstleyVEVO',
      title: 'Never Gonna Give You Up (Official Music Video)',
      description: 'Iconic pop music video used to test video player embed parameters and audio retention.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      dateAdded: '2026-09-10T14:00:00Z',
      createdAt: '2026-09-10T14:00:00Z'
    },
    startedAt: '2026-09-10T14:05:00Z',
    completedAt: '2026-09-10T14:30:00Z',
    isCompleted: true,
    actions: {
      watched: true,
      liked: true,
      commented: true,
      shared: false,
      followed: true,
      saved: true
    },
    commentDraft: {
      text: 'The drum snare pickup at 0:03 immediately locks attention before the bassline drops.',
      savedAt: '2026-09-10T14:15:00Z',
      posted: true,
      postedAt: '2026-09-10T14:18:00Z'
    },
    personalRating: 9,
    tags: ['#hook', '#editing', '#music', '#retention', '#classic'],
    hook: 'Immediate rhythmic beat without dead air or slow title card.',
    opening: 'Quick camera pan into singer moving in rhythm before first vocal line.',
    editing: 'Dynamic continuous cuts alternating between solo dancer and venue',
    caption: 'Remastered in 4K for modern display standards',
    cta: 'Subscribe to official artist channel',
    observations: 'No intro logos, zero delay before musical cadence begins.',
    whatWorked: 'The choreography creates visual momentum that matches the tempo perfectly.',
    whatDidnt: 'A modern Short would need text overlays in the first 1.5 seconds for sound-off viewers.',
    recreationIdea: 'Starting videos immediately with physical movement rather than talking-head delay.',
    research: {
      hook: 'Immediate rhythmic beat without dead air or slow title card.',
      first3Seconds: 'Quick camera pan into singer moving in rhythm before first vocal line.',
      topic: 'Music Video / Catchy Earworm Mechanics',
      format: 'Music Video / 4K remaster',
      editingStyle: 'Dynamic continuous cuts alternating between solo dancer and venue',
      caption: 'Remastered in 4K for modern display standards',
      cta: 'Subscribe to official artist channel',
      thumbnailNotes: 'High-contrast iconic face shot with warm stage lighting',
      musicAudio: 'Syncopated synth-pop bassline with instant recognizable timbre',
      visualStyle: 'Warm neutral trench coat aesthetic against brick architecture',
      observations: {
        attentionGrabber: 'No intro logos, zero delay before musical cadence begins.',
        whatWorked: 'The choreography creates visual momentum that matches the tempo perfectly.',
        whatDidnt: 'A modern Short would need text overlays in the first 1.5 seconds for sound-off viewers.',
        whatCouldRecreate: 'Starting videos immediately with physical movement rather than talking-head delay.',
        whatLearned: 'Audio-visual synchronization in the first 2 seconds prevents bounce rates.'
      }
    },
    aiAnalysis: {
      analyzedAt: '2026-09-10T14:25:00Z',
      hookBreakdown: 'Zero-latency audio entry. The 3-second window features both auditory cadence and physical motion, creating dual-channel cognitive anchoring.',
      openingPacing: 'BPM is approximately 113, which sits in the sweet spot for natural head-nod engagement.',
      storyStructure: 'A-B alternating narrative: singer performing in urban alley versus empty performance hall.',
      editingAndVisualPattern: 'Cut frequency average: 3.2 seconds. Pacing accelerates during chorus sections to amplify climax feeling.',
      captionAndCtaAnalysis: 'Minimalist legacy caption; modern iteration would benefit from pinned question prompting viewer nostalgia.',
      audienceAppeal: 'Universal broad demographic appeal with high emotional comfort factor.',
      commentThemesPrediction: 'Nostalgia recollection, humorous community memes, appreciation of vocal consistency.',
      contentFormatType: 'Performance-driven music short / video',
      engagementDrivers: [
        'Instant musical hook with no promotional dead space',
        'Distinctive styling and signature physical cadence',
        'Memetic cultural longevity creating habitual re-watch value'
      ],
      observedFacts: [
        'No intro title sequence or sponsor bumper',
        'Audio starts at 0:00 with snare hit',
        'Singer appears on camera within 2 seconds'
      ],
      aiInterpretations: [
        'High retention likely driven by instant dopamine loop of the chord progression',
        'Absence of text overlays relies entirely on auditory curiosity'
      ],
      modelName: 'gemini-3.8-flash'
    },
    generalNotes: 'Benchmark test for zero-friction video openings. Apply this intro pacing to our upcoming product demo.',
    createdAt: '2026-09-10T14:05:00Z',
    updatedAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'exp-002',
    experimentNumber: 'EXP-002',
    testAccountId: 'acc-1',
    contentId: 'cnt-2',
    watched: true,
    liked: true,
    commented: false,
    shared: true,
    followed: false,
    saved: true,
    content: {
      id: 'cnt-2',
      url: 'https://www.instagram.com/reel/C8qKz9PxY1/',
      platform: 'instagram',
      type: 'reel',
      contentType: 'instagram_reel',
      creator: 'minimalist_coder',
      creatorHandle: '@minimalist_coder',
      title: '3 CSS tricks that look like black magic',
      description: 'Quick 25-second breakdown showing subgrid and accent-color features.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      dateAdded: '2026-09-14T09:30:00Z',
      createdAt: '2026-09-14T09:30:00Z'
    },
    startedAt: '2026-09-14T09:35:00Z',
    isCompleted: false,
    actions: {
      watched: true,
      liked: true,
      commented: false,
      shared: true,
      followed: false,
      saved: true
    },
    commentDraft: {
      text: 'Does subgrid handle responsive card aspect ratios without JS resize observers in Safari?',
      savedAt: '2026-09-14T09:45:00Z',
      posted: false
    },
    personalRating: 8,
    tags: ['#reel', '#hook', '#coding', '#css', '#educational'],
    hook: '"Stop using JavaScript for this layout problem."',
    opening: 'Split screen showing 40 lines of messy code crossed out with red X, replaced by 2 lines of CSS.',
    editing: 'Fast zoom-in on code lines with kinetic typing SFX',
    caption: 'Save this for your next dashboard project! #css #webdev',
    cta: 'Comment "CODE" for the GitHub repo link',
    observations: 'Negative framing hook ("Stop doing X") is twice as provocative as "Here is how to do X".',
    whatWorked: 'Visual proof of simplicity (messy code crossed out) gives instant credibility.',
    whatDidnt: 'Font size on mobile was slightly cramped on smaller screens.',
    recreationIdea: 'Using the before-and-after split screen format for quick tutorial reels.',
    research: {
      hook: '"Stop using JavaScript for this layout problem."',
      first3Seconds: 'Split screen showing 40 lines of messy code crossed out with red X, replaced by 2 lines of CSS.',
      topic: 'Frontend Development / Layout Techniques',
      format: 'Vertical Short / Code Screen Recording + Facecam PIP',
      editingStyle: 'Fast zoom-in on code lines with kinetic typing SFX',
      caption: 'Save this for your next dashboard project! #css #webdev',
      cta: 'Comment "CODE" for the GitHub repo link',
      thumbnailNotes: 'High contrast neon text on dark IDE background',
      musicAudio: 'Lo-fi electronic instrumental with subtle click sounds',
      visualStyle: 'VS Code Tokyo Night theme with bold yellow highlights',
      observations: {
        attentionGrabber: 'Negative framing hook ("Stop doing X") is twice as provocative as "Here is how to do X".',
        whatWorked: 'Visual proof of simplicity (messy code crossed out) gives instant credibility.',
        whatDidnt: 'Font size on mobile was slightly cramped on smaller screens.',
        whatCouldRecreate: 'Using the before-and-after split screen format for quick tutorial reels.',
        whatLearned: 'Automated DM keyword CTAs ("Comment CODE") drive comment metrics without asking for generic praise.'
      }
    },
    generalNotes: 'Excellent example of pain-point opening. Test this specific negative-framing hook in our next workflow tutorial.',
    createdAt: '2026-09-14T09:35:00Z',
    updatedAt: '2026-09-14T09:45:00Z',
  },
  {
    id: 'exp-003',
    experimentNumber: 'EXP-003',
    testAccountId: 'acc-3',
    contentId: 'cnt-3',
    watched: true,
    liked: false,
    commented: false,
    shared: true,
    followed: true,
    saved: true,
    content: {
      id: 'cnt-3',
      url: 'https://t.me/durov/230',
      platform: 'telegram',
      type: 'post',
      contentType: 'telegram_post',
      creator: 'Pavel Durov',
      creatorHandle: '@durov',
      title: 'Telegram Mini Apps 2.0 & Monetization Update',
      description: 'Founder announcement covering monetization, stars, and full-screen web app capabilities.',
      embedUrl: 'https://t.me/durov/230?embed=1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      dateAdded: '2026-09-15T11:00:00Z',
      createdAt: '2026-09-15T11:00:00Z'
    },
    startedAt: '2026-09-15T11:05:00Z',
    isCompleted: true,
    actions: {
      watched: true,
      liked: false,
      commented: false,
      shared: true,
      followed: true,
      saved: true
    },
    commentDraft: {
      text: '',
      posted: false
    },
    personalRating: 8,
    tags: ['#telegram', '#strategy', '#broadcast', '#monetization'],
    hook: 'Direct one-sentence executive summary at top of post before detailed bullet points.',
    opening: 'First line visible in preview notification without truncating critical nouns.',
    editing: 'Clean typography, numbered features, short 2-line paragraphs',
    caption: '',
    cta: 'Explore developer documentation link at footer',
    observations: 'No pleasantries or filler greeting. First word is the key product update.',
    whatWorked: 'High density of factual value per line kept readers scrolling.',
    whatDidnt: 'Could have included a 15-second teaser video for visual learners.',
    recreationIdea: 'Formatting our release announcements with bold lead words for rapid scanning.',
    research: {
      hook: 'Direct one-sentence executive summary at top of post before detailed bullet points.',
      first3Seconds: 'First line visible in preview notification without truncating critical nouns.',
      topic: 'Platform Ecosystem & Developer Economy',
      format: 'Rich formatted Telegram broadcast with inline bullet points and bold headers',
      editingStyle: 'Clean typography, numbered features, short 2-line paragraphs',
      caption: '',
      cta: 'Explore developer documentation link at footer',
      thumbnailNotes: 'Geometric dark vector preview graphic',
      musicAudio: 'N/A (text broadcast)',
      visualStyle: 'Dark mode native Telegram text formatting',
      observations: {
        attentionGrabber: 'No pleasantries or filler greeting. First word is the key product update.',
        whatWorked: 'High density of factual value per line kept readers scrolling.',
        whatDidnt: 'Could have included a 15-second teaser video for visual learners.',
        whatCouldRecreate: 'Formatting our release announcements with bold lead words for rapid scanning.',
        whatLearned: 'Broadcast channels reward density over conversational fluff.'
      }
    },
    generalNotes: 'Study for channel communication strategy: clear headers and zero fluff perform best in direct messenger feeds.',
    createdAt: '2026-09-15T11:05:00Z',
    updatedAt: '2026-09-15T11:05:00Z',
  }
];

export const INITIAL_NOTES: ResearchNote[] = [
  {
    id: 'note-1',
    title: 'The 3-Second Retention Framework for Short-Form Video',
    category: 'hook_templates',
    content: `Observed patterns across top-performing test feeds:
1. Audio-Visual Collision: Start with sound and physical movement simultaneously. Never start on a frozen posture.
2. The Negative Premise: "Stop doing X" creates cognitive dissonance faster than "Do Y".
3. Immediate Stakes: The viewer must know within 2.5 seconds what payoff awaits them at second 25.
4. B-roll Cut Pacing: Keep the first cut under 1.8 seconds, then relax pacing to 3-4 seconds once hook is secure.`,
    tags: ['#retention', '#shortform', '#video-editing', '#psychology'],
    updatedAt: '2026-09-15T16:00:00Z'
  },
  {
    id: 'note-2',
    title: 'Platform Comparison: Native Embed vs External Launcher Workflow',
    category: 'strategy',
    content: `Security & research observations:
- YouTube: High embed compatibility via iframe. Player events can be monitored for study.
- Instagram & Facebook: Strict X-Frame-Options/CSP policies prevent cross-origin embedding inside iframes. Testing accounts must use "Open in Platform" with clean state preservation in Content Test Lab.
- Telegram: Web widgets allow post embedding; channel feeds require deep-link inspection.
- Research Rule: Always document actions manually in Content Test Lab to avoid polluting personal account recommendation algorithms.`,
    tags: ['#architecture', '#security', '#platform-rules', '#workflow'],
    updatedAt: '2026-09-14T10:00:00Z'
  }
];

export function getStoredAccounts(): TestAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read accounts from storage", e);
  }
  saveStoredAccounts(INITIAL_ACCOUNTS);
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(accounts: TestAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save accounts to storage", e);
  }
}

export function getTestAccounts(): TestAccount[] {
  return getStoredAccounts();
}

export function saveTestAccount(account: TestAccount): void {
  const accounts = getStoredAccounts();
  const existingIdx = accounts.findIndex((a) => a.id === account.id);
  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }
  if (account.isActive) {
    accounts.forEach((a) => {
      if (a.id !== account.id) a.isActive = false;
    });
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, account.id);
  }
  saveStoredAccounts(accounts);
}

export function deleteTestAccount(id: string): void {
  const accounts = getStoredAccounts().filter((a) => a.id !== id);
  saveStoredAccounts(accounts);
}

export function getActiveTestAccount(): TestAccount | undefined {
  const accounts = getStoredAccounts();
  const activeId = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  if (activeId) {
    const found = accounts.find((a) => a.id === activeId);
    if (found) return found;
  }
  return accounts.find((a) => a.isActive) || accounts[0];
}

export function setActiveTestAccountId(id: string): void {
  const accounts = getStoredAccounts();
  accounts.forEach((a) => {
    a.isActive = a.id === id;
  });
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  saveStoredAccounts(accounts);
}

export function getStoredExperiments(): Experiment[] {
  try {
    const raw = localStorage.getItem(EXPERIMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read experiments from storage", e);
  }
  saveStoredExperiments(INITIAL_EXPERIMENTS);
  return INITIAL_EXPERIMENTS;
}

export function saveStoredExperiments(experiments: Experiment[]): void {
  try {
    localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(experiments));
  } catch (e) {
    console.error("Failed to save experiments to storage", e);
  }
}

export function getExperiments(): Experiment[] {
  return getStoredExperiments();
}

export function saveExperiment(experiment: Experiment): void {
  const experiments = getStoredExperiments();
  const existingIdx = experiments.findIndex((e) => e.id === experiment.id);
  if (existingIdx >= 0) {
    experiments[existingIdx] = experiment;
  } else {
    experiments.unshift(experiment);
  }
  saveStoredExperiments(experiments);
}

export function deleteExperiment(id: string): void {
  const experiments = getStoredExperiments().filter((e) => e.id !== id);
  saveStoredExperiments(experiments);
}

export function createEmptyExperiment(content: any, testAccountId?: string): Experiment {
  const count = getStoredExperiments().length + 1;
  const numStr = count < 10 ? `00${count}` : count < 100 ? `0${count}` : `${count}`;
  return {
    id: `exp-${Date.now()}`,
    experimentNumber: `EXP-${numStr}`,
    testAccountId: testAccountId || 'acc-1',
    contentId: content.id || `cnt-${Date.now()}`,
    content,
    startedAt: new Date().toISOString(),
    isCompleted: false,
    watched: false,
    liked: false,
    commented: false,
    shared: false,
    followed: false,
    saved: false,
    actions: {
      watched: false,
      liked: false,
      commented: false,
      shared: false,
      followed: false,
      saved: false,
    },
    personalRating: 0,
    tags: ['#research'],
    hook: '',
    opening: '',
    editing: '',
    caption: '',
    cta: '',
    observations: '',
    whatWorked: '',
    whatDidnt: '',
    recreationIdea: '',
    research: {
      hook: '',
      first3Seconds: '',
      topic: '',
      format: content.contentType?.replace(/_/g, ' ') || '',
      editingStyle: '',
      caption: '',
      cta: '',
      thumbnailNotes: '',
      musicAudio: '',
      visualStyle: '',
      observations: {
        attentionGrabber: '',
        whatWorked: '',
        whatDidnt: '',
        whatCouldRecreate: '',
        whatLearned: '',
      },
    },
    commentDraft: {
      text: '',
      posted: false,
    },
    generalNotes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function getStoredNotes(): ResearchNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read notes from storage", e);
  }
  saveStoredNotes(INITIAL_NOTES);
  return INITIAL_NOTES;
}

export function saveStoredNotes(notes: ResearchNote[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes to storage", e);
  }
}

export function calculateAnalytics(experiments: Experiment[]) {
  const byPlatform: Record<string, number> = {
    youtube: 0,
    instagram: 0,
    facebook: 0,
    telegram: 0,
  };

  const topicCounts: Record<string, number> = {};
  const formatCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  let totalRating = 0;
  let ratedCount = 0;

  const actionTotals = {
    watched: 0,
    liked: 0,
    commented: 0,
    shared: 0,
    followed: 0,
    saved: 0,
  };

  experiments.forEach((exp) => {
    const platform = exp.content?.platform || 'youtube';
    if (byPlatform[platform] !== undefined) {
      byPlatform[platform]++;
    }

    const rating = exp.personalRating || exp.rating || 0;
    if (rating > 0) {
      totalRating += rating;
      ratedCount++;
    }

    if (exp.watched || exp.actions?.watched) actionTotals.watched++;
    if (exp.liked || exp.actions?.liked) actionTotals.liked++;
    if (exp.commented || exp.actions?.commented) actionTotals.commented++;
    if (exp.shared || exp.actions?.shared) actionTotals.shared++;
    if (exp.followed || exp.actions?.followed) actionTotals.followed++;
    if (exp.saved || exp.actions?.saved) actionTotals.saved++;

    if (exp.research?.topic) {
      const t = exp.research.topic.trim();
      if (t) topicCounts[t] = (topicCounts[t] || 0) + 1;
    }

    if (exp.content?.contentType) {
      const f = exp.content.contentType.replace(/_/g, ' ');
      formatCounts[f] = (formatCounts[f] || 0) + 1;
    }

    if (Array.isArray(exp.tags)) {
      exp.tags.forEach((tag) => {
        const cleanTag = tag.trim().toLowerCase();
        if (cleanTag) tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    }
  });

  const total = experiments.length;

  const mostResearchedTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const mostCommonFormats = Object.entries(formatCounts)
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const frequentlyUsedTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalExperiments: total,
    byPlatform,
    mostResearchedTopics,
    mostCommonFormats,
    averageRating: ratedCount > 0 ? Number((totalRating / ratedCount).toFixed(1)) : 0,
    frequentlyUsedTags,
    actionCompletionRates: {
      watched: total > 0 ? Math.round((actionTotals.watched / total) * 100) : 0,
      liked: total > 0 ? Math.round((actionTotals.liked / total) * 100) : 0,
      commented: total > 0 ? Math.round((actionTotals.commented / total) * 100) : 0,
      shared: total > 0 ? Math.round((actionTotals.shared / total) * 100) : 0,
      followed: total > 0 ? Math.round((actionTotals.followed / total) * 100) : 0,
      saved: total > 0 ? Math.round((actionTotals.saved / total) * 100) : 0,
    }
  };
}

/**
 * Backup all laboratory data to serialized JSON
 */
export function exportAllLabData(): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    accounts: getTestAccounts(),
    experiments: getExperiments(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Restore laboratory data from JSON
 */
export function importLabData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data.accounts)) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data.accounts));
    }
    if (Array.isArray(data.experiments)) {
      localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(data.experiments));
    }
    return true;
  } catch (err) {
    console.error('Failed to import lab data:', err);
    return false;
  }
}

/**
 * Reset workspace to initial seed data
 */
export function resetToSeedData(): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(INITIAL_ACCOUNTS));
  localStorage.setItem(EXPERIMENTS_KEY, JSON.stringify(INITIAL_EXPERIMENTS));
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, INITIAL_ACCOUNTS[0].id);
}

