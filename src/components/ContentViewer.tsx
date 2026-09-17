import React, { useState } from 'react';
import {
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  UserPlus,
  Star,
  Tag,
  Plus,
  X,
  Sliders,
  Sparkles,
  FileText,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
  Film
} from 'lucide-react';
import { Experiment, TestAccount, Platform } from '../types';
import { getPlatformConfig } from '../utils/platform';
import { CommentWorkspace } from './CommentWorkspace';
import { ContentResearch } from './ContentResearch';
import { AIContentAnalyzer } from './AIContentAnalyzer';

interface ContentViewerProps {
  experiment: Experiment;
  activeAccount: TestAccount | undefined;
  onUpdateExperiment: (updated: Experiment) => void;
  onBack: () => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  experiment,
  activeAccount,
  onUpdateExperiment,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'research' | 'comment' | 'ai'>('research');
  const [newTagInput, setNewTagInput] = useState('');

  const platformCfg = getPlatformConfig(experiment.content.platform);

  const handleToggleAction = (actionKey: keyof Experiment['actions']) => {
    const updatedActions = {
      ...experiment.actions,
      [actionKey]: !experiment.actions[actionKey],
    };
    onUpdateExperiment({
      ...experiment,
      actions: updatedActions,
    });
  };

  const handleRatingChange = (rating: number) => {
    onUpdateExperiment({
      ...experiment,
      personalRating: rating,
    });
  };

  const handleToggleCompleted = () => {
    onUpdateExperiment({
      ...experiment,
      isCompleted: !experiment.isCompleted,
      completedAt: !experiment.isCompleted ? new Date().toISOString() : undefined,
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    let clean = newTagInput.trim();
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!experiment.tags.includes(clean)) {
      onUpdateExperiment({
        ...experiment,
        tags: [...experiment.tags, clean],
      });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateExperiment({
      ...experiment,
      tags: experiment.tags.filter((t) => t !== tagToRemove),
    });
  };

  const openPlatformUrl = () => {
    window.open(experiment.content.url, '_blank', 'noopener,noreferrer');
  };

  const getPlatformButtonText = (p: Platform) => {
    switch (p) {
      case 'youtube': return 'Open on YouTube';
      case 'instagram': return 'Open on Instagram';
      case 'facebook': return 'Open on Facebook';
      case 'telegram': return 'Open on Telegram';
      default: return 'Open on Platform';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-800 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${platformCfg.tagColor}`}>
                {platformCfg.name}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                {experiment.experimentNumber}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">
                Active Tester: <strong className="text-zinc-200">@{activeAccount?.username || 'Guest'}</strong>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-xl">
              {experiment.content.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleToggleCompleted}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
              experiment.isCompleted
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{experiment.isCompleted ? 'Completed' : 'Mark as Completed'}</span>
          </button>

          <button
            onClick={openPlatformUrl}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{getPlatformButtonText(experiment.content.platform)}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Layout: LEFT = Content / Player, RIGHT = Experiment Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Actual Content / Embedded Content or Platform Launcher Container (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 space-y-4 shadow-xl sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <Film className="w-3.5 h-3.5 text-indigo-400" />
                Content Stage
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {experiment.content.contentType.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Embedded Player or Secure Sandbox Frame */}
            {platformCfg.allowsDirectIframe && experiment.content.embedUrl ? (
              <div className="relative aspect-video sm:aspect-[9/16] lg:aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner">
                <iframe
                  src={experiment.content.embedUrl}
                  title={experiment.content.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              /* Platform Sandbox Card (for Instagram, Facebook, or links with security headers blocking iframes) */
              <div className="rounded-xl bg-zinc-950 border border-zinc-800/90 p-5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-300">
                  <Film className="w-6 h-6 text-indigo-400" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 line-clamp-2">
                    {experiment.content.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Creator: <span className="text-zinc-200 font-medium">{experiment.content.creator}</span> ({experiment.content.creatorHandle})
                  </p>
                </div>

                {/* CSP Notice & Realism Guarantee */}
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Security & CSP Boundary
                  </div>
                  <p>{platformCfg.notes}</p>
                  <p className="text-zinc-500 italic">
                    Your experiment observations, drafts, and ratings stay safely preserved here.
                  </p>
                </div>

                <button
                  onClick={openPlatformUrl}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{getPlatformButtonText(experiment.content.platform)}</span>
                </button>
              </div>
            )}

            {/* Quick Content URL details */}
            <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Source URL</span>
                <a
                  href={experiment.content.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline truncate max-w-[220px]"
                >
                  {experiment.content.url}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Platform</span>
                <span className="text-zinc-300 uppercase">{experiment.content.platform}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Started</span>
                <span className="text-zinc-300">
                  {new Date(experiment.startedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Experiment Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interaction Status Bar (User-Controlled Checkboxes) */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-200 font-semibold">
                  Interaction Tracking
                </h4>
                <p className="text-[11px] text-zinc-400">
                  User-controlled action log (actions are recorded as verified by you)
                </p>
              </div>

              <span className="text-[10px] font-mono text-zinc-500">
                {Object.values(experiment.actions).filter(Boolean).length}/6 logged
              </span>
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { key: 'watched', label: 'Watched', icon: <Eye className="w-3.5 h-3.5" /> },
                { key: 'liked', label: 'Liked', icon: <Heart className="w-3.5 h-3.5" /> },
                { key: 'commented', label: 'Commented', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                { key: 'shared', label: 'Shared', icon: <Share2 className="w-3.5 h-3.5" /> },
                { key: 'followed', label: 'Followed / Subscribed', icon: <UserPlus className="w-3.5 h-3.5" /> },
                { key: 'saved', label: 'Saved', icon: <Bookmark className="w-3.5 h-3.5" /> },
              ].map(({ key, label, icon }) => {
                const isChecked = experiment.actions[key as keyof Experiment['actions']];
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                      isChecked
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200 font-medium'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleAction(key as keyof Experiment['actions'])}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0"
                    />
                    <span className="text-xs flex items-center gap-1.5 truncate">
                      {icon}
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Personal Rating (1 to 10) */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Personal Rating
                </span>
                <span className="font-mono text-zinc-300 font-bold text-sm">
                  {experiment.personalRating > 0 ? `${experiment.personalRating}/10` : 'Not Rated'}
                </span>
              </div>

              {/* 10-point selector buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleRatingChange(num)}
                    className={`flex-1 py-1 px-1 rounded-lg text-xs font-mono font-semibold transition ${
                      experiment.personalRating === num
                        ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                        : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags System */}
            <div className="pt-3 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  Tags
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {experiment.tags.length} tags
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {experiment.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-mono"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-zinc-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {/* Add Tag Form */}
                <form onSubmit={handleAddTag} className="inline-flex items-center">
                  <input
                    type="text"
                    placeholder="+ Add tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-0.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono w-28"
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Research Breakdown | Comment Workspace | AI Analyzer */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-xl space-y-5">
            <div className="flex items-center border-b border-zinc-800 pb-3 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('research')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'research'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Content Research</span>
              </button>

              <button
                onClick={() => setActiveTab('comment')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'comment'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Comment Workspace</span>
                {experiment.commentDraft?.text && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'ai'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Content Analyzer</span>
                {experiment.aiAnalysis && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === 'research' && (
              <ContentResearch
                experiment={experiment}
                onUpdateResearch={(updatedResearch) => {
                  onUpdateExperiment({
                    ...experiment,
                    research: updatedResearch,
                  });
                }}
              />
            )}

            {activeTab === 'comment' && (
              <CommentWorkspace
                experiment={experiment}
                activeAccount={activeAccount}
                onOpenContentInPlatform={openPlatformUrl}
                onUpdateCommentDraft={(updatedDraft) => {
                  onUpdateExperiment({
                    ...experiment,
                    commentDraft: updatedDraft,
                  });
                }}
              />
            )}

            {activeTab === 'ai' && (
              <AIContentAnalyzer
                experiment={experiment}
                onUpdateAiAnalysis={(updatedAi) => {
                  onUpdateExperiment({
                    ...experiment,
                    aiAnalysis: updatedAi,
                  });
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
