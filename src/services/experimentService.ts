import { Experiment, ContentItem, TestAccount, Platform, ContentType } from '../types';
import { getCurrentUserSync } from './authService';
import { saveContentItem, getContentItemById, getContentItems } from './contentService';
import { parsePlatformUrl } from '../lib/platformParser';
import { normalizeContentUrl, parseContentUrl } from '../platforms/platformRegistry';

const EXPERIMENTS_STORAGE_PREFIX = 'ctl_user_experiments_v2_';

const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp_01',
    contentId: 'cnt_01',
    testAccountId: 'acc_yt_01',
    watched: true,
    liked: true,
    commented: true,
    shared: false,
    followed: true,
    saved: true,
    commentDraft: 'Notice the immediate acoustic burst in the first 0.8 seconds. Perfect retention trigger.',
    commentPosted: false,
    hook: 'Visual and auditory pattern interrupt within first frame.',
    opening: 'High tempo drum beat and dynamic movement without intro logo filler.',
    editing: 'Cut frequency every 1.8 seconds matching rhythmic pacing.',
    caption: 'Classic algorithmic longevity case study.',
    cta: 'Subscribe for daily music breakdowns.',
    observations: 'High energy start immediately anchors retention.',
    whatWorked: 'Instant acoustic hook and zero dead space.',
    whatDidnt: 'Could have had captions for sound-off viewers.',
    recreationIdea: 'Use sudden music collision as a video opener for software tutorials.',
    rating: 9,
    tags: ['#youtube', '#hook', '#retention', '#audio-sync'],
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'exp_02',
    contentId: 'cnt_02',
    testAccountId: 'acc_ig_02',
    watched: true,
    liked: true,
    commented: false,
    shared: true,
    followed: false,
    saved: true,
    commentDraft: 'Does subgrid work well with dynamic aspect ratios in Safari?',
    commentPosted: false,
    hook: '"Stop using JavaScript for this layout problem."',
    opening: 'Split screen showing 40 lines of messy code crossed out with red X, replaced by 2 lines of CSS.',
    editing: 'Fast zoom-in on code lines with kinetic typing SFX.',
    caption: 'Save this for your next dashboard project! #css #webdev',
    cta: 'Comment "CODE" for the GitHub repo link.',
    observations: 'Negative premise hook ("Stop doing X") stops the scroll much faster.',
    whatWorked: 'Visual proof of simplicity gives instant credibility.',
    whatDidnt: 'Font size was slightly small for mobile screens.',
    recreationIdea: 'Use before/after messy vs clean split screen format for quick tips.',
    rating: 8,
    tags: ['#reel', '#hook', '#coding', '#css', '#educational'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'exp_03',
    contentId: 'cnt_03',
    testAccountId: 'acc_tg_04',
    watched: true,
    liked: false,
    commented: false,
    shared: true,
    followed: true,
    saved: true,
    commentDraft: '',
    commentPosted: false,
    hook: 'Direct one-sentence executive summary at top before bullet points.',
    opening: 'First line visible in preview notification without truncating critical nouns.',
    editing: 'Clean typography, numbered features, short 2-line paragraphs.',
    caption: 'Telegram Mini Apps 2.0 release overview.',
    cta: 'Explore developer documentation link at footer.',
    observations: 'High density of factual value per line kept readers scrolling.',
    whatWorked: 'No conversational fluff; immediate technical payload.',
    whatDidnt: 'Could have used an attached 15-second visual teaser.',
    recreationIdea: 'Bold lead words for rapid scanning in newsletter broadcasts.',
    rating: 8,
    tags: ['#telegram', '#strategy', '#broadcast', '#monetization'],
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 3600000 * 4,
  },
];

function getStorageKey(uid?: string): string {
  const userId = uid || getCurrentUserSync().uid;
  return `${EXPERIMENTS_STORAGE_PREFIX}${userId}`;
}

/**
 * Hydrates experiment with associated ContentItem
 */
async function hydrateExperiment(exp: Experiment, uid?: string): Promise<Experiment> {
  const content = await getContentItemById(exp.contentId, uid);
  return {
    ...exp,
    content: content || exp.content,
  };
}

export async function getExperiments(uid?: string): Promise<Experiment[]> {
  try {
    const key = getStorageKey(uid);
    const raw = localStorage.getItem(key);
    let experiments: Experiment[] = [];
    if (raw) {
      experiments = JSON.parse(raw);
    } else {
      experiments = INITIAL_EXPERIMENTS;
      localStorage.setItem(key, JSON.stringify(INITIAL_EXPERIMENTS));
    }

    const contentItems = await getContentItems(uid);
    const contentMap = new Map(contentItems.map((c) => [c.id, c]));

    return experiments.map((e) => ({
      ...e,
      content: contentMap.get(e.contentId) || e.content,
    }));
  } catch (err) {
    console.error('Failed to get experiments:', err);
    return INITIAL_EXPERIMENTS;
  }
}

export async function getExperimentById(id: string, uid?: string): Promise<Experiment | null> {
  const experiments = await getExperiments(uid);
  const found = experiments.find((e) => e.id === id);
  if (!found) return null;
  return hydrateExperiment(found, uid);
}

export const getExperiment = getExperimentById;

export async function getExperimentByUrl(url: string, uid?: string): Promise<Experiment | null> {
  const clean = normalizeContentUrl(url).toLowerCase();
  const rawClean = url.trim().toLowerCase();
  const experiments = await getExperiments(uid);
  const found = experiments.find((e) => {
    const itemUrl = e.content?.url ? normalizeContentUrl(e.content.url).toLowerCase() : '';
    const itemRaw = (e.content?.url || '').trim().toLowerCase();
    return itemUrl === clean || itemRaw === rawClean;
  });
  return found ? hydrateExperiment(found, uid) : null;
}

/**
 * Requirement 5: Create Experiment reusable factory function
 */
export async function createExperiment(
  content: ContentItem,
  testAccount?: TestAccount,
  uid?: string
): Promise<Experiment> {
  // 1. Ensure content item is saved
  const savedContent = await saveContentItem(content, uid);

  // 2. Build experiment object
  const now = Date.now();
  const count = (await getExperiments(uid)).length + 1;
  const newExp: Experiment = {
    id: `exp_${now}_${Math.random().toString(36).slice(2, 6)}`,
    contentId: savedContent.id,
    testAccountId: testAccount?.id,
    watched: false,
    liked: false,
    commented: false,
    shared: false,
    followed: false,
    saved: false,
    commentDraft: '',
    commentPosted: false,
    hook: '',
    opening: '',
    editing: '',
    caption: '',
    cta: '',
    observations: '',
    whatWorked: '',
    whatDidnt: '',
    recreationIdea: '',
    rating: 0,
    tags: [`#${content.platform}`, `#${content.type}`],
    createdAt: now,
    updatedAt: now,
    content: savedContent,
  };

  // 3. Save experiment to storage
  const experiments = await getExperiments(uid);
  experiments.unshift(newExp);
  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(experiments));

  return newExp;
}

export async function createExperimentFromUrl(
  url: string,
  testAccountId?: string,
  uid?: string
): Promise<Experiment> {
  // Check for duplicate experiment first using normalized URL
  const existing = await getExperimentByUrl(url, uid);
  if (existing) {
    return existing;
  }

  const parsed = parseContentUrl(url);
  const now = Date.now();
  const content: ContentItem = {
    id: `cnt_${now}_${Math.random().toString(36).slice(2, 6)}`,
    url: parsed.url,
    normalizedUrl: parsed.normalizedUrl,
    platform: parsed.platform,
    type: parsed.type,
    title: parsed.title || 'Social Media Research Item',
    creator: parsed.creator || 'Creator',
    creatorHandle: parsed.creatorHandle || '@handle',
    embedUrl: parsed.embedUrl || undefined,
    thumbnailUrl: parsed.thumbnailUrl || undefined,
    createdAt: now,
  };

  const savedContent = await saveContentItem(content, uid);
  const newExp: Experiment = {
    id: `exp_${now}_${Math.random().toString(36).slice(2, 6)}`,
    contentId: savedContent.id,
    testAccountId,
    watched: false,
    liked: false,
    commented: false,
    shared: false,
    followed: false,
    saved: false,
    actionTimestamps: {},
    commentDraft: '',
    commentPosted: false,
    hook: '',
    firstImpression: '',
    opening: '',
    visuals: '',
    editing: '',
    pacing: '',
    audio: '',
    caption: '',
    cta: '',
    audience: '',
    observations: '',
    randomObservations: '',
    whatWorked: '',
    whatDidnt: '',
    recreationIdea: '',
    rating: 0,
    tags: [`#${content.platform}`, `#${content.type}`],
    createdAt: now,
    updatedAt: now,
    content: savedContent,
  };

  const experiments = await getExperiments(uid);
  experiments.unshift(newExp);
  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(experiments));

  return newExp;
}

export async function saveExperiment(experiment: Experiment, uid?: string): Promise<Experiment> {
  const experiments = await getExperiments(uid);
  const now = Date.now();
  const updated = {
    ...experiment,
    updatedAt: now,
    createdAt: experiment.createdAt || now,
  };

  const existingIdx = experiments.findIndex((e) => e.id === experiment.id);
  if (existingIdx >= 0) {
    experiments[existingIdx] = updated;
  } else {
    experiments.unshift(updated);
  }

  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(experiments));
  return updated;
}

export async function updateExperiment(
  updates: Partial<Experiment> & { id: string },
  uid?: string
): Promise<Experiment> {
  const existing = await getExperimentById(updates.id, uid);
  if (!existing) {
    throw new Error(`Experiment with ID ${updates.id} not found.`);
  }

  const merged: Experiment = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  return saveExperiment(merged, uid);
}

export async function deleteExperiment(id: string, uid?: string): Promise<void> {
  const experiments = await getExperiments(uid);
  const filtered = experiments.filter((e) => e.id !== id);
  const key = getStorageKey(uid);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function calculateAnalytics(experiments: Experiment[]) {
  const platformCounts: Record<Platform, number> = {
    youtube: 0,
    instagram: 0,
    facebook: 0,
    telegram: 0,
  };

  const typeCounts: Record<string, number> = {};
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
    if (exp.content?.platform && platformCounts[exp.content.platform] !== undefined) {
      platformCounts[exp.content.platform]++;
    }

    if (exp.content?.type) {
      typeCounts[exp.content.type] = (typeCounts[exp.content.type] || 0) + 1;
    }

    if (exp.rating && exp.rating > 0) {
      totalRating += exp.rating;
      ratedCount++;
    }

    if (exp.watched) actionTotals.watched++;
    if (exp.liked) actionTotals.liked++;
    if (exp.commented) actionTotals.commented++;
    if (exp.shared) actionTotals.shared++;
    if (exp.followed) actionTotals.followed++;
    if (exp.saved) actionTotals.saved++;

    if (Array.isArray(exp.tags)) {
      exp.tags.forEach((tag) => {
        const clean = tag.trim().toLowerCase();
        if (clean) tagCounts[clean] = (tagCounts[clean] || 0) + 1;
      });
    }
  });

  const total = experiments.length;

  return {
    totalExperiments: total,
    byPlatform: platformCounts,
    byType: typeCounts,
    averageRating: ratedCount > 0 ? Number((totalRating / ratedCount).toFixed(1)) : 0,
    topTags: Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    actionRates: {
      watched: total > 0 ? Math.round((actionTotals.watched / total) * 100) : 0,
      liked: total > 0 ? Math.round((actionTotals.liked / total) * 100) : 0,
      commented: total > 0 ? Math.round((actionTotals.commented / total) * 100) : 0,
      shared: total > 0 ? Math.round((actionTotals.shared / total) * 100) : 0,
      followed: total > 0 ? Math.round((actionTotals.followed / total) * 100) : 0,
      saved: total > 0 ? Math.round((actionTotals.saved / total) * 100) : 0,
    },
  };
}
