import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  Clock,
  CheckCircle2,
  Tag,
  ArrowUpRight,
  SlidersHorizontal,
  Eye,
  Heart,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { Experiment, Platform, TestAccount } from '../types';
import { getPlatformConfig, formatContentType } from '../utils/platform';

interface ExperimentListProps {
  experiments: Experiment[];
  activeAccount: TestAccount | undefined;
  onOpenExperiment: (exp: Experiment) => void;
  onOpenNewExperimentModal: () => void;
  onDeleteExperiment: (id: string) => void;
}

export const ExperimentList: React.FC<ExperimentListProps> = ({
  experiments,
  activeAccount,
  onOpenExperiment,
  onOpenNewExperimentModal,
  onDeleteExperiment,
}) => {
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'number'>('newest');

  // Filtered and sorted experiments
  const filtered = experiments
    .filter((exp) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = exp.content.title.toLowerCase().includes(q);
        const matchCreator = exp.content.creator.toLowerCase().includes(q) || exp.content.creatorHandle.toLowerCase().includes(q);
        const matchNotes = (exp.generalNotes || '').toLowerCase().includes(q);
        const matchTags = exp.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchCreator && !matchNotes && !matchTags) return false;
      }

      if (platformFilter !== 'all' && exp.content.platform !== platformFilter) {
        return false;
      }

      if (statusFilter === 'completed' && !exp.isCompleted) return false;
      if (statusFilter === 'draft' && exp.isCompleted) return false;

      if (minRating > 0 && exp.personalRating < minRating) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.personalRating - a.personalRating;
      }
      if (sortBy === 'number') {
        return b.experimentNumber.localeCompare(a.experimentNumber);
      }
      return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
    });

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-400" />
            Social Media Experiments
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Systematic testing logs tracking content exposure, engagement mechanics, and qualitative ratings.
          </p>
        </div>

        <button
          onClick={onOpenNewExperimentModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search experiments by title, creator, #tags, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Platform filter */}
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="telegram">Telegram</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="draft">In Progress</option>
            </select>

            {/* Min Rating */}
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value={0}>Any Rating</option>
              <option value={8}>Rating ≥ 8</option>
              <option value={9}>Rating ≥ 9</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Sort: Newest</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="number">Sort: Experiment #</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>{filtered.length} experiments matched</span>
        </div>
      </div>

      {/* Experiment List Items */}
      {filtered.length === 0 ? (
        <div className="py-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center">
          <FlaskConical className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-300">No experiments match your filters</p>
          <button
            onClick={() => {
              setSearch('');
              setPlatformFilter('all');
              setStatusFilter('all');
              setMinRating(0);
            }}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exp) => {
            const platformCfg = getPlatformConfig(exp.content.platform);
            const dateStr = new Date(exp.startedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Status Indicator */}
                  <div className="pt-0.5 shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        exp.isCompleted ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                      }`}
                      title={exp.isCompleted ? 'Completed' : 'In Progress'}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                        {exp.experimentNumber}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded ${platformCfg.tagColor}`}>
                        {platformCfg.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {formatContentType(exp.content.contentType)}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                        • {dateStr}
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenExperiment(exp)}
                      className="text-sm font-semibold text-zinc-100 hover:text-indigo-300 transition cursor-pointer truncate"
                    >
                      {exp.content.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                      <span>Creator: <strong className="text-zinc-200">{exp.content.creator}</strong></span>

                      {/* Action Badges */}
                      <div className="flex items-center gap-1.5 ml-2">
                        {Boolean(exp.watched || exp.actions?.watched) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Watched
                          </span>
                        )}
                        {Boolean(exp.liked || exp.actions?.liked) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Liked
                          </span>
                        )}
                        {Boolean(exp.commented || exp.actions?.commented) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Commented
                          </span>
                        )}
                        {Boolean(exp.saved || exp.isBookmarked || exp.actions?.saved) && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Saved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {exp.tags && exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {exp.tags.map((t) => (
                          <span key={t} className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800/60">
                  {/* Personal Rating */}
                  <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-mono font-semibold text-zinc-200">
                      {exp.personalRating > 0 ? `${exp.personalRating}/10` : '—'}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenExperiment(exp)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1"
                  >
                    <span>Open Lab</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete experiment ${exp.experimentNumber}?`)) {
                        onDeleteExperiment(exp.id);
                      }
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Delete Experiment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
