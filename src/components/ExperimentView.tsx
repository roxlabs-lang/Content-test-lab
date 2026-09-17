import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Save,
  CheckCircle2,
  Copy,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  UserPlus,
  Bookmark,
  Shield,
  Star,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Experiment, Platform } from '../types';
import { getPlatformMeta, formatContentTypeLabel } from '../lib/platformParser';
import { updateExperiment } from '../services/experimentService';
import { useActiveAccount } from '../context/ActiveAccountContext';
import { useToast } from '../context/ToastContext';
import { improveCommentDraft, analyzeContentWithGemini } from '../services/api';
import { downloadExport } from '../services/exportService';
import { Download, LayoutDashboard, FileDown } from 'lucide-react';

interface ExperimentViewProps {
  experiment: Experiment;
  onUpdate: (updated: Experiment) => void;
  onBack: () => void;
  onOpenInWorkspace?: (experimentId: string) => void;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({
  experiment,
  onUpdate,
  onBack,
  onOpenInWorkspace,
}) => {
  const { activeAccount } = useActiveAccount();
  const { showToast } = useToast();

  // Local state for all fields
  const [exp, setExp] = useState<Experiment>(experiment);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [activeTab, setActiveTab] = useState<'research' | 'comment' | 'ai'>('research');

  // Comment state
  const [commentText, setCommentText] = useState(experiment.commentDraft || '');
  const [commentPosted, setCommentPosted] = useState(Boolean(experiment.commentPosted));
  const [isImprovingComment, setIsImprovingComment] = useState(false);
  const [commentSuggestions, setCommentSuggestions] = useState<any | null>(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    hook: true,
    opening: true,
    editing: true,
    caption: false,
    cta: false,
    worked: true,
    didnt: false,
    recreate: true,
  });

  // Keep local state in sync when prop changes
  useEffect(() => {
    setExp(experiment);
    setCommentText(experiment.commentDraft || '');
    setCommentPosted(Boolean(experiment.commentPosted));
  }, [experiment.id]);

  // Debounced Autosave (Requirement 6: 600ms debounce)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(
    (updatedExp: Experiment) => {
      setSaveStatus('saving');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const saved = await updateExperiment(updatedExp);
          onUpdate(saved);
          setSaveStatus('saved');
        } catch (err) {
          console.error('Failed to autosave notes:', err);
          setSaveStatus('idle');
          showToast('Failed to save changes.', 'error');
        }
      }, 600);
    },
    [onUpdate, showToast]
  );

  const handleFieldChange = (field: keyof Experiment, value: any) => {
    const updated = {
      ...exp,
      [field]: value,
      updatedAt: Date.now(),
    };
    setExp(updated);
    triggerAutosave(updated);
  };

  const toggleAction = (action: 'watched' | 'liked' | 'commented' | 'shared' | 'followed' | 'saved') => {
    const updated = {
      ...exp,
      [action]: !exp[action],
      updatedAt: Date.now(),
    };
    setExp(updated);
    triggerAutosave(updated);
  };

  const handleRatingChange = (score: number) => {
    const updated = {
      ...exp,
      rating: exp.rating === score ? 0 : score,
      updatedAt: Date.now(),
    };
    setExp(updated);
    triggerAutosave(updated);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Comment Handlers
  const handleSaveComment = () => {
    const updated = {
      ...exp,
      commentDraft: commentText,
      commentPosted,
      updatedAt: Date.now(),
    };
    setExp(updated);
    triggerAutosave(updated);
    showToast('Comment draft saved ✓', 'success');
  };

  const handleCopyComment = async () => {
    if (!commentText.trim()) return;
    try {
      await navigator.clipboard.writeText(commentText);
      showToast('Comment copied to clipboard!', 'info');
    } catch {
      showToast('Could not access clipboard.', 'warning');
    }
  };

  const handleClearComment = () => {
    setCommentText('');
    const updated = {
      ...exp,
      commentDraft: '',
      updatedAt: Date.now(),
    };
    setExp(updated);
    triggerAutosave(updated);
    showToast('Comment draft cleared', 'info');
  };

  const handleImproveComment = async () => {
    if (!commentText.trim()) return;
    setIsImprovingComment(true);
    try {
      const res = await improveCommentDraft(
        commentText,
        'engaging and thoughtful',
        exp.content?.platform || 'instagram',
        exp.content?.title
      );
      if (res.improved) {
        setCommentSuggestions(res.improved);
        showToast('AI comment variations generated!', 'success');
      }
    } catch {
      showToast('Failed to generate suggestions.', 'error');
    } finally {
      setIsImprovingComment(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeContentWithGemini({
        url: exp.content?.url,
        platform: exp.content?.platform,
        contentType: exp.content?.type,
        creator: exp.content?.creator,
        title: exp.content?.title,
        hook: exp.hook,
        first3Seconds: exp.opening,
        topic: exp.tags.join(', '),
        format: exp.content?.type,
        editingStyle: exp.editing,
        caption: exp.caption,
        cta: exp.cta,
        userObservations: {
          whatWorked: exp.whatWorked,
          whatDidnt: exp.whatDidnt,
          recreation: exp.recreationIdea,
        },
      });

      if (res.analysis) {
        setAiAnalysis(res.analysis);
        showToast('Gemini analysis complete!', 'success');
      }
    } catch {
      showToast('Failed to generate AI analysis.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const platformMeta = exp.content?.platform
    ? getPlatformMeta(exp.content.platform)
    : getPlatformMeta('youtube');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${platformMeta.badgeBg}`}>
                {platformMeta.label}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                {exp.content?.type ? formatContentTypeLabel(exp.content.type) : 'Video'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
              {exp.content?.title || 'Social Research Workspace'}
            </h2>
          </div>
        </div>

        {/* Autosave Indicator & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium mr-1">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            ) : saveStatus === 'saved' ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved ✓
              </span>
            ) : (
              <span className="text-zinc-500">Unsaved changes</span>
            )}
          </div>

          {/* Open in Workspace button */}
          {onOpenInWorkspace && (
            <button
              type="button"
              onClick={() => onOpenInWorkspace(exp.id)}
              className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 rounded-xl font-medium flex items-center gap-1.5 transition shadow-sm"
              title="Open full interactive research workspace"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Workspace Mode</span>
            </button>
          )}

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => downloadExport(exp, 'markdown', `experiment-${exp.content?.platform || 'item'}`)}
              className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Export as Markdown (.md)"
            >
              .MD
            </button>
            <button
              type="button"
              onClick={() => downloadExport(exp, 'json', `experiment-${exp.content?.platform || 'item'}`)}
              className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Export as JSON"
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => downloadExport(exp, 'csv', `experiment-${exp.content?.platform || 'item'}`)}
              className="px-2.5 py-1 text-[11px] font-mono text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
              title="Export as CSV"
            >
              CSV
            </button>
          </div>

          {exp.content?.url && (
            <a
              href={exp.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl font-medium flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open on {platformMeta.label}</span>
            </a>
          )}
        </div>
      </div>

      {/* Grid: Left Column (CONTENT + INTERACTION LOG) & Right Column (RESEARCH + TABS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= SECTION 1 & 2: LEFT COLUMN ================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION 1: CONTENT CARD */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                1. Content Stage
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                ID: {exp.id.slice(0, 10)}
              </span>
            </div>

            {/* Embed Player / Thumbnail Preview */}
            <div className="w-full aspect-video bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative flex items-center justify-center">
              {exp.content?.embedUrl ? (
                <iframe
                  src={exp.content.embedUrl}
                  title={exp.content.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : exp.content?.thumbnailUrl ? (
                <img
                  src={exp.content.thumbnailUrl}
                  alt={exp.content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className={`p-3 rounded-full w-fit mx-auto ${platformMeta.badgeBg}`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-zinc-400 max-w-xs">
                    <p className="font-semibold text-zinc-200">Security / CSP Boundary</p>
                    <p className="text-[11px] text-zinc-500 mt-1">{platformMeta.embedReason}</p>
                  </div>
                  {exp.content?.url && (
                    <a
                      href={exp.content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open on {platformMeta.label}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Metadata Rows */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500">Platform</span>
                <span className="font-semibold text-zinc-200 capitalize">{exp.content?.platform}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500">Creator / Channel</span>
                <span className="font-medium text-zinc-200">
                  {exp.content?.creator || 'Creator'} ({exp.content?.creatorHandle || '@handle'})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500">Format Type</span>
                <span className="font-medium text-zinc-200 capitalize">
                  {exp.content?.type ? formatContentTypeLabel(exp.content.type) : 'Video'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Target Account</span>
                <span className="font-medium text-indigo-400">
                  {activeAccount ? activeAccount.displayName : 'None (Isolated)'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: INTERACTION LOG */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                2. Interaction Log
              </span>
              <span className="text-[11px] text-zinc-500">Manual verification only</span>
            </div>

            {/* 6 Action Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Watched */}
              <button
                type="button"
                onClick={() => toggleAction('watched')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                  exp.watched
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Watched</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${exp.watched ? 'bg-indigo-400' : 'bg-zinc-700'}`} />
              </button>

              {/* Liked */}
              <button
                type="button"
                onClick={() => toggleAction('liked')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                  exp.liked
                    ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Liked</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${exp.liked ? 'bg-rose-400' : 'bg-zinc-700'}`} />
              </button>

              {/* Commented */}
              <button
                type="button"
                onClick={() => toggleAction('commented')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                  exp.commented
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Commented</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${exp.commented ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
              </button>

              {/* Shared */}
              <button
                type="button"
                onClick={() => toggleAction('shared')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                  exp.shared
                    ? 'bg-blue-500/20 text-blue-200 border-blue-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  <span>Shared</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${exp.shared ? 'bg-blue-400' : 'bg-zinc-700'}`} />
              </button>

              {/* Followed */}
              <button
                type="button"
                onClick={() => toggleAction('followed')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                  exp.followed
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Followed</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${exp.followed ? 'bg-amber-400' : 'bg-zinc-700'}`} />
              </button>

              {/* Saved */}
              <button
                type="button"
                onClick={() => toggleAction('saved')}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
                  exp.saved
                    ? 'bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-sm'
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Saved</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${exp.saved ? 'bg-purple-400' : 'bg-zinc-700'}`} />
              </button>
            </div>

            {/* Rating 1-10 Scale */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>Personal Lab Score</span>
                <span className="text-amber-400 font-mono font-bold">
                  {exp.rating ? `${exp.rating}/10` : 'Not Rated'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => handleRatingChange(score)}
                    className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                      (exp.rating || 0) >= score
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-950 text-zinc-600 border-zinc-800 hover:border-zinc-700 hover:text-zinc-400'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: RIGHT COLUMN ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 3 Tabs: Research vs Comment Draft vs AI Analyzer */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <button
              onClick={() => setActiveTab('research')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'research'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              3. Research Sections
            </button>
            <button
              onClick={() => setActiveTab('comment')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'comment'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comment Draft</span>
              {exp.commentDraft && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Algorithm Deconstruction</span>
            </button>
          </div>

          {/* TAB 1: RESEARCH SECTIONS (EXPANDABLE SECTIONS) */}
          {activeTab === 'research' && (
            <div className="space-y-3">
              {/* HOOK SECTION */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('hook')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-zinc-200 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    HOOK / OPENING PREMISE
                  </span>
                  {expandedSections.hook ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.hook && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.hook || ''}
                      onChange={(e) => handleFieldChange('hook', e.target.value)}
                      placeholder="e.g. Visual shock pattern interrupt: 'Stop using JavaScript for this problem...'"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* FIRST 3 SECONDS */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('opening')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-zinc-200 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    FIRST 3 SECONDS
                  </span>
                  {expandedSections.opening ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.opening && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.opening || ''}
                      onChange={(e) => handleFieldChange('opening', e.target.value)}
                      placeholder="e.g. Sudden music hit and fast zoom-in on code. Zero awkward pause or filler."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* EDITING & PACING */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('editing')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-zinc-200 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    EDITING & PACING
                  </span>
                  {expandedSections.editing ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.editing && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.editing || ''}
                      onChange={(e) => handleFieldChange('editing', e.target.value)}
                      placeholder="e.g. Cut pacing every 1.8 seconds, animated callouts, sound design."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* CAPTION */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('caption')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-zinc-200 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    CAPTION & HASHTAG STRATEGY
                  </span>
                  {expandedSections.caption ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.caption && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.caption || ''}
                      onChange={(e) => handleFieldChange('caption', e.target.value)}
                      placeholder="e.g. 2-line problem teaser before fold. Targeted niche hashtags."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* CTA (CALL TO ACTION) */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('cta')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-zinc-200 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    CTA (CALL TO ACTION)
                  </span>
                  {expandedSections.cta ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.cta && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.cta || ''}
                      onChange={(e) => handleFieldChange('cta', e.target.value)}
                      placeholder="e.g. 'Comment CODE for the repository link' (triggers automation metric)."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* WHAT WORKED? */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('worked')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-emerald-400 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    WHAT WORKED?
                  </span>
                  {expandedSections.worked ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.worked && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.whatWorked || ''}
                      onChange={(e) => handleFieldChange('whatWorked', e.target.value)}
                      placeholder="e.g. Visual contrast and quick punchy conclusion kept audience attention throughout."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* WHAT DIDN'T? */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('didnt')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-rose-400 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    WHAT DIDN'T?
                  </span>
                  {expandedSections.didnt ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.didnt && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.whatDidnt || ''}
                      onChange={(e) => handleFieldChange('whatDidnt', e.target.value)}
                      placeholder="e.g. Small font size in IDE screen capture was unreadable on mobile devices."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>

              {/* WHAT WOULD I RECREATE? */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => toggleSection('recreate')}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-indigo-400 hover:bg-zinc-800/40"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    WHAT WOULD I RECREATE?
                  </span>
                  {expandedSections.recreate ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>
                {expandedSections.recreate && (
                  <div className="p-4 pt-0">
                    <textarea
                      rows={2}
                      value={exp.recreationIdea || ''}
                      onChange={(e) => handleFieldChange('recreationIdea', e.target.value)}
                      placeholder="e.g. Test this split-screen comparison hook on our next developer workflow release."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMMENT DRAFT SYSTEM (Requirement 8) */}
          {activeTab === 'comment' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Comment Drafting Pad
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Test response drafts before manually posting to platform
                  </p>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  <span className={commentText.length > 2000 ? 'text-amber-400 font-bold' : ''}>
                    {commentText.length}
                  </span>
                  /2200 chars
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment draft here..."
                maxLength={2200}
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />

              {/* Action Buttons: [Save Draft] [Copy] [Clear] */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveComment}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyComment}
                    disabled={!commentText.trim()}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearComment}
                    disabled={!commentText.trim()}
                    className="px-3 py-2 text-zinc-400 hover:text-red-400 text-xs font-medium transition disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>

                {/* Mark as posted toggle */}
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={commentPosted}
                    onChange={(e) => {
                      setCommentPosted(e.target.checked);
                      handleFieldChange('commentPosted', e.target.checked);
                    }}
                    className="rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Mark as posted on {platformMeta.label}</span>
                </label>
              </div>

              {/* AI Comment Refinement Assistant */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Comment Optimizer</span>
                  </div>
                  <button
                    type="button"
                    disabled={!commentText.trim() || isImprovingComment}
                    onClick={handleImproveComment}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isImprovingComment ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Optimize with Gemini</span>
                  </button>
                </div>

                {commentSuggestions && (
                  <div className="space-y-2 pt-2">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="font-semibold text-zinc-300">Natural & Conversational:</span>
                        <button
                          onClick={() => setCommentText(commentSuggestions.optionNatural)}
                          className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
                        >
                          Use This
                        </button>
                      </div>
                      <p className="text-zinc-200 italic">"{commentSuggestions.optionNatural}"</p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="font-semibold text-zinc-300">High-Engagement Question:</span>
                        <button
                          onClick={() => setCommentText(commentSuggestions.optionEngaging)}
                          className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
                        >
                          Use This
                        </button>
                      </div>
                      <p className="text-zinc-200 italic">"{commentSuggestions.optionEngaging}"</p>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span className="font-semibold text-zinc-300">Concise & Mobile-Punchy:</span>
                        <button
                          onClick={() => setCommentText(commentSuggestions.optionConcise)}
                          className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
                        >
                          Use This
                        </button>
                      </div>
                      <p className="text-zinc-200 italic">"{commentSuggestions.optionConcise}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI ALGORITHM DECONSTRUCTION */}
          {activeTab === 'ai' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Gemini Algorithm Deconstruction
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Qualitative psychological and retention analysis
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={handleRunAiAnalysis}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{aiAnalysis ? 'Re-Analyze Content' : 'Run Gemini Analysis'}</span>
                </button>
              </div>

              {aiAnalysis ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                      Hook Mechanics & Retention
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{aiAnalysis.hookBreakdown}</p>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                    <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                      3-Second Pacing Curve
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{aiAnalysis.openingPacing}</p>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">
                      Visual Editing & Audio Synchronization
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{aiAnalysis.editingAndVisualPattern}</p>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                      Comment Trigger Prediction
                    </span>
                    <p className="text-zinc-300 leading-relaxed">{aiAnalysis.commentThemesPrediction}</p>
                  </div>

                  {/* Observed Facts vs AI Hypotheses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                      <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                        Observed Facts
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-zinc-300">
                        {aiAnalysis.observedFacts?.map((fact: string, i: number) => (
                          <li key={i}>{fact}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                      <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">
                        AI Hypotheses
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-zinc-300">
                        {aiAnalysis.aiInterpretations?.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs space-y-2">
                  <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p>Click "Run Gemini Analysis" to receive qualitative algorithmic insights.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
