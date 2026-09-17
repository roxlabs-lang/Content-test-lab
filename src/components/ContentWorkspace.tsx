import React, { useState } from 'react';
import {
  Film,
  Search,
  ExternalLink,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  Star,
  Plus,
  Radio,
  Share2,
  Tag,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { ContentItem, Experiment, Platform, TestAccount } from '../types';
import { getPlatformConfig, formatContentType } from '../utils/platform';
import { detectContentUrl } from '../services/api';

interface ContentWorkspaceProps {
  experiments: Experiment[];
  activeAccount: TestAccount | undefined;
  onOpenExperiment: (exp: Experiment) => void;
  onCreateExperimentFromUrl: (detected: any, customTitle?: string) => void;
}

export const ContentWorkspace: React.FC<ContentWorkspaceProps> = ({
  experiments,
  activeAccount,
  onOpenExperiment,
  onCreateExperimentFromUrl,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedData, setDetectedData] = useState<any>(null);
  const [customTitle, setCustomTitle] = useState('');

  // Content Library Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);

  const handleDetectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsDetecting(true);
    setDetectedData(null);

    const detected = await detectContentUrl(urlInput.trim());
    setDetectedData(detected);
    setCustomTitle(detected.title || '');
    setIsDetecting(false);
  };

  const handleLaunchExperiment = () => {
    if (!detectedData) return;
    onCreateExperimentFromUrl(detectedData, customTitle || detectedData.title);
    setUrlInput('');
    setDetectedData(null);
  };

  // Extract all unique tags
  const allTags = Array.from(
    new Set(experiments.flatMap((e) => e.tags || []))
  );

  // Filtered experiments
  const filteredExperiments = experiments.filter((exp) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = exp.content.title.toLowerCase().includes(q);
      const matchCreator = exp.content.creator.toLowerCase().includes(q) || exp.content.creatorHandle.toLowerCase().includes(q);
      const matchUrl = exp.content.url.toLowerCase().includes(q);
      const matchNotes = (exp.generalNotes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCreator && !matchUrl && !matchNotes) return false;
    }

    // Platform filter
    if (selectedPlatform !== 'all' && exp.content.platform !== selectedPlatform) {
      return false;
    }

    // Status filter
    if (selectedStatus === 'completed' && !exp.isCompleted) return false;
    if (selectedStatus === 'incomplete' && exp.isCompleted) return false;

    // Rating filter
    if (minRating > 0 && exp.personalRating < minRating) return false;

    // Tag filter
    if (selectedTag !== 'all' && !exp.tags.includes(selectedTag)) return false;

    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Prominent URL Input Hero */}
      <section className="rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Universal Social Content Ingestion
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Paste Content URL
          </h2>
          <p className="text-xs md:text-sm text-zinc-400">
            Enter any YouTube video/Short, Instagram Reel/post, Facebook video, or Telegram link. The lab detects metadata, sets up your experiment, and prepares your testing workspace.
          </p>

          <form onSubmit={handleDetectUrl} className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/shorts/... or instagram.com/reel/..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-zinc-950/90 border border-zinc-700/80 rounded-xl px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isDetecting || !urlInput.trim()}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 shrink-0"
            >
              {isDetecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Detect & Inspect</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Examples Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-zinc-500">
            <span>Supports:</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">YouTube Video & Shorts</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Instagram Reels & Posts</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Facebook Watch & Reels</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300">Telegram Posts & Channels</span>
          </div>
        </div>

        {/* Detection Result Card */}
        {detectedData && (
          <div className="mt-8 max-w-2xl mx-auto rounded-xl bg-zinc-950 border border-indigo-500/40 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-zinc-200">Content Recognized</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${getPlatformConfig(detectedData.platform).tagColor}`}>
                {getPlatformConfig(detectedData.platform).name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-zinc-500 text-[11px]">Content Format</span>
                <p className="text-zinc-200 font-medium">{formatContentType(detectedData.contentType)}</p>
              </div>
              <div>
                <span className="text-zinc-500 text-[11px]">Creator</span>
                <p className="text-zinc-200 font-medium">{detectedData.creatorHandle || detectedData.creator}</p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Experiment Title / Headline
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={detectedData.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium"
              >
                <span>Preview External Link</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleLaunchExperiment}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Launch Experiment in Lab</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Content Library & Filter System */}
      <section className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Content Research Library
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse, filter, and inspect your researched content items and tactical experiments
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search creator, title, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Platform filter pills */}
          <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80">
            {['all', 'youtube', 'instagram', 'facebook', 'telegram'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-2.5 py-1 rounded-lg transition font-medium text-[11px] ${
                  selectedPlatform === p
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p === 'all' ? 'All Platforms' : getPlatformConfig(p as Platform).name}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e: any) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-[11px] rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Experiments</option>
            <option value="incomplete">Incomplete Experiments</option>
          </select>

          {/* Min Rating filter */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-[11px] rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            <option value={0}>Any Rating</option>
            <option value={7}>Rating ≥ 7</option>
            <option value={8}>Rating ≥ 8</option>
            <option value={9}>Rating ≥ 9</option>
          </select>

          {/* Tags filter if available */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-[11px] rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <span className="text-[11px] text-zinc-500 ml-auto font-mono">
            Showing {filteredExperiments.length} of {experiments.length}
          </span>
        </div>

        {/* Content Cards Grid */}
        {filteredExperiments.length === 0 ? (
          <div className="py-12 rounded-2xl bg-zinc-900/30 border border-zinc-800/60 text-center">
            <p className="text-sm text-zinc-400">No content matches your filter criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedPlatform('all');
                setSelectedStatus('all');
                setSelectedTag('all');
                setMinRating(0);
              }}
              className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExperiments.map((exp) => {
              const platformCfg = getPlatformConfig(exp.content.platform);

              return (
                <div
                  key={exp.id}
                  onClick={() => onOpenExperiment(exp)}
                  className="rounded-xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 p-4 transition duration-150 cursor-pointer flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Thumbnail / Header */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800">
                      {exp.content.thumbnailUrl ? (
                        <img
                          src={exp.content.thumbnailUrl}
                          alt={exp.content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                          <Film className="w-8 h-8 mb-1" />
                          <span className="text-[11px] font-mono">{platformCfg.name}</span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded shadow ${platformCfg.tagColor}`}>
                          {platformCfg.name}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded shadow ${
                          exp.isCompleted
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-900/90 text-zinc-400 border border-zinc-700'
                        }`}>
                          {exp.isCompleted ? 'Completed' : 'Draft'}
                        </span>
                      </div>

                      {/* Content Type pill bottom */}
                      <div className="absolute bottom-2 left-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-zinc-300 backdrop-blur-sm">
                          {formatContentType(exp.content.contentType)}
                        </span>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition line-clamp-2">
                        {exp.content.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                        <span className="text-zinc-300 font-medium">{exp.content.creator}</span>
                        <span className="text-zinc-500 text-[11px]">{exp.content.creatorHandle}</span>
                      </p>
                    </div>

                    {/* Tags */}
                    {exp.tags && exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {exp.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {exp.tags.length > 3 && (
                          <span className="text-[10px] font-mono text-zinc-500 self-center">
                            +{exp.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-zinc-200">
                        {exp.personalRating > 0 ? `${exp.personalRating}/10` : 'Unrated'}
                      </span>
                    </div>

                    <span className="text-indigo-400 font-medium group-hover:underline flex items-center gap-1">
                      Open Lab <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
