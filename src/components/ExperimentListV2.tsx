import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Star,
  ExternalLink,
  ChevronRight,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  FlaskConical,
  Trash2,
  Tag
} from 'lucide-react';
import { Experiment, Platform, ContentType } from '../types';
import { getPlatformMeta, formatContentTypeLabel } from '../lib/platformParser';
import { useActiveAccount } from '../context/ActiveAccountContext';
import { deleteExperiment } from '../services/experimentService';
import { useToast } from '../context/ToastContext';

interface ExperimentListV2Props {
  experiments: Experiment[];
  onSelectExperiment: (exp: Experiment) => void;
  onRefresh: () => void;
  onNewExperimentClick: () => void;
}

export const ExperimentListV2: React.FC<ExperimentListV2Props> = ({
  experiments,
  onSelectExperiment,
  onRefresh,
  onNewExperimentClick,
}) => {
  const { accounts } = useActiveAccount();
  const { showToast } = useToast();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [watchedOnly, setWatchedOnly] = useState<boolean>(false);
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    experiments.forEach((e) => {
      e.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [experiments]);

  // Filter logic
  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const title = exp.content?.title?.toLowerCase() || '';
        const creator = exp.content?.creator?.toLowerCase() || '';
        const handle = exp.content?.creatorHandle?.toLowerCase() || '';
        const url = exp.content?.url?.toLowerCase() || '';
        const hook = exp.hook?.toLowerCase() || '';
        const notes = exp.observations?.toLowerCase() || '';
        const whatWorked = exp.whatWorked?.toLowerCase() || '';
        const platform = exp.content?.platform?.toLowerCase() || '';
        const tags = exp.tags?.join(' ').toLowerCase() || '';

        const matches =
          title.includes(query) ||
          creator.includes(query) ||
          handle.includes(query) ||
          url.includes(query) ||
          hook.includes(query) ||
          notes.includes(query) ||
          whatWorked.includes(query) ||
          platform.includes(query) ||
          tags.includes(query);

        if (!matches) return false;
      }

      // 2. Platform filter
      if (selectedPlatform !== 'all' && exp.content?.platform !== selectedPlatform) {
        return false;
      }

      // 3. Content Type filter
      if (selectedType !== 'all' && exp.content?.type !== selectedType) {
        return false;
      }

      // 4. Rating filter
      if (minRating > 0 && (exp.rating || 0) < minRating) {
        return false;
      }

      // 5. Account filter
      if (selectedAccount !== 'all' && exp.testAccountId !== selectedAccount) {
        return false;
      }

      // 6. Tag filter
      if (selectedTag !== 'all' && !exp.tags?.includes(selectedTag)) {
        return false;
      }

      // 7. Watched filter
      if (watchedOnly && !exp.watched) {
        return false;
      }

      // 8. Saved filter
      if (savedOnly && !exp.saved && !exp.isBookmarked) {
        return false;
      }

      // 9. Completion status (has research notes)
      const hasNotes = Boolean(exp.hook || exp.opening || exp.whatWorked || exp.recreationIdea);
      if (completionFilter === 'completed' && !hasNotes) return false;
      if (completionFilter === 'incomplete' && hasNotes) return false;

      return true;
    });
  }, [
    experiments,
    searchQuery,
    selectedPlatform,
    selectedType,
    minRating,
    selectedAccount,
    selectedTag,
    watchedOnly,
    savedOnly,
    completionFilter,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedPlatform !== 'all' ||
    selectedType !== 'all' ||
    minRating > 0 ||
    selectedAccount !== 'all' ||
    selectedTag !== 'all' ||
    watchedOnly ||
    savedOnly ||
    completionFilter !== 'all';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedType('all');
    setMinRating(0);
    setSelectedAccount('all');
    setSelectedTag('all');
    setWatchedOnly(false);
    setSavedOnly(false);
    setCompletionFilter('all');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this experiment and research record?')) {
      setIsDeleting(id);
      try {
        await deleteExperiment(id);
        showToast('Experiment deleted', 'info');
        onRefresh();
      } catch {
        showToast('Failed to delete experiment.', 'error');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments by creator, title, tag, hook, or notes (Press '/' to focus)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Platform Select Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['all', 'youtube', 'instagram', 'facebook', 'telegram'] as const).map((p) => {
              const isSelected = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-zinc-800/80 text-xs">
          {/* Content Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Formats</option>
            <option value="video">Video</option>
            <option value="short">Short</option>
            <option value="reel">Reel</option>
            <option value="post">Post</option>
            <option value="channel">Channel</option>
          </select>

          {/* Score / Rating Filter */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="0">Any Score</option>
            <option value="8">Score: 8+ ⭐</option>
            <option value="5">Score: 5+ ⭐</option>
          </select>

          {/* Completion Status */}
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Documented (Has Notes)</option>
            <option value="incomplete">Incomplete (Needs Notes)</option>
          </select>

          {/* Account Filter */}
          {accounts.length > 0 && (
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Test Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.displayName || acc.username} ({acc.platform})
                </option>
              ))}
            </select>
          )}

          {/* Watched Filter Button */}
          <button
            type="button"
            onClick={() => setWatchedOnly(!watchedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              watchedOnly
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Watched</span>
          </button>

          {/* Saved / Bookmarked Filter Button */}
          <button
            type="button"
            onClick={() => setSavedOnly(!savedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              savedOnly
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-zinc-950' : ''}`} />
            <span>Saved</span>
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition ml-auto"
            >
              <X className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Tags Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
        <div>
          Showing <span className="text-white font-bold">{filteredExperiments.length}</span> of{' '}
          <span className="text-white font-bold">{experiments.length}</span> experiments
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            <span className="text-zinc-500 flex items-center gap-1 text-[11px]">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {allTags.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                className={`px-2 py-0.5 rounded-md font-mono text-[10px] border transition ${
                  selectedTag === tag
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Experiments List / Grid */}
      {filteredExperiments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((exp) => {
            const meta = exp.content?.platform
              ? getPlatformMeta(exp.content.platform)
              : getPlatformMeta('youtube');
            const hasNotes = Boolean(exp.hook || exp.whatWorked || exp.recreationIdea);

            return (
              <div
                key={exp.id}
                onClick={() => onSelectExperiment(exp)}
                className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all duration-150 hover:shadow-xl group relative"
              >
                {/* Card Header: Platform badge & Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${meta.badgeBg}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {exp.content?.type ? formatContentTypeLabel(exp.content.type) : 'Video'}
                    </span>
                  </div>

                  {exp.rating && exp.rating > 0 ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {exp.rating}/10
                    </span>
                  ) : null}
                </div>

                {/* Title & Creator */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-indigo-300 transition">
                    {exp.content?.title || 'Social Video Research Entry'}
                  </h4>
                  <div className="text-xs text-zinc-400 font-mono line-clamp-1">
                    {exp.content?.creator || 'Creator'} ({exp.content?.creatorHandle || '@handle'})
                  </div>
                </div>

                {/* Hook preview snippet if documented */}
                {exp.hook ? (
                  <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-300 line-clamp-2 italic">
                    "{exp.hook}"
                  </div>
                ) : (
                  <div className="p-2.5 bg-zinc-950/40 rounded-xl border border-dashed border-zinc-800 text-[11px] text-zinc-600">
                    No hook breakdown documented yet.
                  </div>
                )}

                {/* Interaction Toggles Mini-Summary */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800/70">
                  <span title="Watched" className={exp.watched ? 'text-indigo-400 font-bold' : 'opacity-40'}>
                    👁
                  </span>
                  <span title="Liked" className={exp.liked ? 'text-rose-400 font-bold' : 'opacity-40'}>
                    ❤️
                  </span>
                  <span title="Commented" className={exp.commented ? 'text-emerald-400 font-bold' : 'opacity-40'}>
                    💬
                  </span>
                  <span title="Shared" className={exp.shared ? 'text-blue-400 font-bold' : 'opacity-40'}>
                    ↗
                  </span>
                  <span title="Followed" className={exp.followed ? 'text-amber-400 font-bold' : 'opacity-40'}>
                    ➕
                  </span>
                  <span title="Saved" className={exp.saved ? 'text-purple-400 font-bold' : 'opacity-40'}>
                    🔖
                  </span>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, exp.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition"
                      title="Delete Experiment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Requirement 16: EMPTY STATE */
        <div className="text-center py-16 px-4 bg-zinc-900/60 border border-dashed border-zinc-800 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
            <FlaskConical className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {hasActiveFilters ? 'No Matching Experiments' : 'No Experiments Yet'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              {hasActiveFilters
                ? 'Try adjusting or clearing your search filters to find what you are looking for.'
                : 'Paste a social media URL at the top to launch your first research and deconstruction workspace.'}
            </p>
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition"
            >
              Clear Search Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewExperimentClick}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition"
            >
              Paste URL to Start
            </button>
          )}
        </div>
      )}
    </div>
  );
};
