import { Experiment } from '../types';

/**
 * Triggers a file download in the browser.
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates clean Markdown for a single experiment matching Requirement 13.
 */
export function exportExperimentToMarkdown(exp: Experiment): string {
  const title = exp.content?.title || 'Social Media Research Experiment';
  const platform = exp.content?.platform || 'Unknown';
  const creator = exp.content?.creatorHandle || exp.content?.creator || '@creator';
  const rating = exp.personalRating || exp.rating || 0;
  const url = exp.content?.url || '';

  const parts: string[] = [];

  parts.push(`# Experiment: ${title}`);
  parts.push(`Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
  parts.push(`Creator: ${creator}`);
  parts.push(`Rating: ${rating}/10`);
  if (url) parts.push(`URL: ${url}`);
  if (exp.tags && exp.tags.length > 0) parts.push(`Tags: ${exp.tags.join(', ')}`);

  // Interactions logged
  const actions: string[] = [];
  if (exp.watched) actions.push(`Watched (${exp.actionTimestamps?.watchedAt || 'logged'})`);
  if (exp.liked) actions.push(`Liked (${exp.actionTimestamps?.likedAt || 'logged'})`);
  if (exp.commented) actions.push(`Commented (${exp.actionTimestamps?.commentedAt || 'logged'})`);
  if (exp.shared) actions.push(`Shared (${exp.actionTimestamps?.sharedAt || 'logged'})`);
  if (exp.followed) actions.push(`Followed (${exp.actionTimestamps?.followedAt || 'logged'})`);
  if (exp.saved || exp.isBookmarked) actions.push(`Saved (${exp.actionTimestamps?.savedAt || 'logged'})`);

  if (actions.length > 0) {
    parts.push(`Interactions: ${actions.join(' • ')}`);
  }

  parts.push('');

  if (exp.hook) {
    parts.push(`## Hook\n${exp.hook}\n`);
  }

  if (exp.firstImpression || exp.opening) {
    parts.push(`## First 3 Seconds\n${exp.firstImpression || exp.opening}\n`);
  }

  if (exp.visuals) {
    parts.push(`## Visuals\n${exp.visuals}\n`);
  }

  if (exp.editing) {
    parts.push(`## Editing & Pacing\n${exp.editing}\n`);
  }

  if (exp.audio) {
    parts.push(`## Audio & Voiceover\n${exp.audio}\n`);
  }

  if (exp.caption) {
    parts.push(`## Caption & Hashtags\n${exp.caption}\n`);
  }

  if (exp.cta) {
    parts.push(`## Call to Action\n${exp.cta}\n`);
  }

  if (exp.audience) {
    parts.push(`## Target Audience\n${exp.audience}\n`);
  }

  if (exp.observations) {
    parts.push(`## Observations\n${exp.observations}\n`);
  }

  if (exp.whatWorked) {
    parts.push(`## What Worked\n${exp.whatWorked}\n`);
  }

  if (exp.whatDidnt) {
    parts.push(`## What Didn't Work\n${exp.whatDidnt}\n`);
  }

  if (exp.recreationIdea) {
    parts.push(`## Recreation Blueprint\n${exp.recreationIdea}\n`);
  }

  if (exp.commentDraft) {
    parts.push(`## Tested Comment Draft\n${exp.commentDraft}\n`);
  }

  return parts.join('\n');
}

/**
 * Generates batch Markdown for multiple experiments.
 */
export function exportExperimentsToMarkdown(experiments: Experiment[]): string {
  const header = `# Content Test Lab — Research Experiments Export\nGenerated: ${new Date().toISOString()}\nTotal items: ${experiments.length}\n\n---\n\n`;
  const body = experiments.map(exportExperimentToMarkdown).join('\n\n---\n\n');
  return header + body;
}

/**
 * Generates standard CSV for experiments.
 */
export function exportExperimentsToCsv(experiments: Experiment[]): string {
  const headers = [
    'ID',
    'Platform',
    'Type',
    'Title',
    'Creator',
    'URL',
    'Rating',
    'Watched',
    'Liked',
    'Commented',
    'Shared',
    'Followed',
    'Saved',
    'Hook',
    'Opening',
    'Visuals',
    'Editing',
    'Audio',
    'Caption',
    'CTA',
    'Audience',
    'Observations',
    'WhatWorked',
    'WhatDidnt',
    'RecreationIdea',
    'Tags',
    'CreatedAt'
  ];

  const escapeCsv = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = experiments.map((exp) => [
    escapeCsv(exp.id),
    escapeCsv(exp.content?.platform || ''),
    escapeCsv(exp.content?.type || ''),
    escapeCsv(exp.content?.title || ''),
    escapeCsv(exp.content?.creatorHandle || exp.content?.creator || ''),
    escapeCsv(exp.content?.url || ''),
    escapeCsv(exp.personalRating || exp.rating || 0),
    escapeCsv(exp.watched ? 'Yes' : 'No'),
    escapeCsv(exp.liked ? 'Yes' : 'No'),
    escapeCsv(exp.commented ? 'Yes' : 'No'),
    escapeCsv(exp.shared ? 'Yes' : 'No'),
    escapeCsv(exp.followed ? 'Yes' : 'No'),
    escapeCsv(exp.saved || exp.isBookmarked ? 'Yes' : 'No'),
    escapeCsv(exp.hook || ''),
    escapeCsv(exp.firstImpression || exp.opening || ''),
    escapeCsv(exp.visuals || ''),
    escapeCsv(exp.editing || ''),
    escapeCsv(exp.audio || ''),
    escapeCsv(exp.caption || ''),
    escapeCsv(exp.cta || ''),
    escapeCsv(exp.audience || ''),
    escapeCsv(exp.observations || ''),
    escapeCsv(exp.whatWorked || ''),
    escapeCsv(exp.whatDidnt || ''),
    escapeCsv(exp.recreationIdea || ''),
    escapeCsv((exp.tags || []).join(';')),
    escapeCsv(new Date(exp.createdAt).toISOString())
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Downloads a single experiment or list of experiments.
 */
export function downloadExport(
  data: Experiment | Experiment[],
  format: 'json' | 'markdown' | 'csv',
  filenamePrefix: string = 'content-test-lab'
): void {
  const isSingle = !Array.isArray(data);
  const items = Array.isArray(data) ? data : [data];
  const dateStr = new Date().toISOString().split('T')[0];

  if (format === 'json') {
    const jsonStr = JSON.stringify(isSingle ? data : items, null, 2);
    downloadFile(jsonStr, `${filenamePrefix}-${dateStr}.json`, 'application/json');
    return;
  }

  if (format === 'markdown') {
    const mdStr = isSingle ? exportExperimentToMarkdown(data as Experiment) : exportExperimentsToMarkdown(items);
    downloadFile(mdStr, `${filenamePrefix}-${dateStr}.md`, 'text/markdown');
    return;
  }

  if (format === 'csv') {
    const csvStr = exportExperimentsToCsv(items);
    downloadFile(csvStr, `${filenamePrefix}-${dateStr}.csv`, 'text/csv');
    return;
  }
}
