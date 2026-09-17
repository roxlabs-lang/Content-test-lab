import React from 'react';
import {
  FlaskConical,
  Users,
  Film,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark
} from 'lucide-react';
import { Experiment, TestAccount, Platform } from '../types';
import { getPlatformConfig } from '../utils/platform';

interface DashboardViewProps {
  activeAccount: TestAccount | undefined;
  experiments: Experiment[];
  accounts: TestAccount[];
  onOpenExperiment: (exp: Experiment) => void;
  onNavigate: (view: 'dashboard' | 'accounts' | 'content' | 'experiments' | 'notes' | 'analytics' | 'settings') => void;
  onOpenNewExperiment: () => void;
  onOpenAddAccount: () => void;
  onOpenUrlInput: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeAccount,
  experiments,
  accounts,
  onOpenExperiment,
  onNavigate,
  onOpenNewExperiment,
  onOpenAddAccount,
  onOpenUrlInput,
}) => {
  const activePlatformConfig = activeAccount
    ? getPlatformConfig(activeAccount.platform)
    : null;

  const recentExperiments = [...experiments]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner / Active Test Account */}
      <section className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-5 md:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personal Social Feeds Fully Isolated</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Personal Research & Testing Lab
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
              Conduct controlled social media experiments, inspect creator hooks, verify comment responses, and document tactical insights using dedicated test accounts.
            </p>
          </div>

          {/* Active Account Card on Dashboard */}
          <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/90 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                Active Test Account
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                activeAccount?.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  activeAccount?.status === 'connected' ? 'bg-emerald-400' : 'bg-zinc-500'
                }`} />
                {activeAccount?.status === 'connected' ? 'Connected' : 'Not connected'}
              </span>
            </div>

            {activeAccount ? (
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={activeAccount.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={activeAccount.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-semibold text-zinc-100 truncate">
                        {activeAccount.displayName}
                      </h4>
                      {activePlatformConfig && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activePlatformConfig.tagColor}`}>
                          {activePlatformConfig.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono truncate">
                      @{activeAccount.username}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px] truncate max-w-[160px]">
                    {activeAccount.email}
                  </span>
                  <button
                    onClick={() => onNavigate('accounts')}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-xs transition"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center">
                <p className="text-xs text-zinc-400 mb-2">No active test account selected</p>
                <button
                  onClick={onOpenAddAccount}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                >
                  Add Test Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mt-6 pt-5 border-t border-zinc-800/70 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenAddAccount}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/50 text-left transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Add Test Account</p>
              <p className="text-[10px] text-zinc-400">Isolated credentials</p>
            </div>
          </button>

          <button
            onClick={onOpenUrlInput}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/50 text-left transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Open Content</p>
              <p className="text-[10px] text-zinc-400">Paste URL to test</p>
            </div>
          </button>

          <button
            onClick={onOpenNewExperiment}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/50 text-left transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center group-hover:bg-violet-500/20">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">New Experiment</p>
              <p className="text-[10px] text-zinc-400">Track & analyze</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('content')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/80 border border-zinc-700/50 text-left transition group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">Browse Saved</p>
              <p className="text-[10px] text-zinc-400">{experiments.length} logged items</p>
            </div>
          </button>
        </div>
      </section>

      {/* Recent Experiments Table & Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Recent Experiments
            </h3>
            <p className="text-xs text-zinc-400">
              Recently opened content, interaction tracking, and qualitative ratings
            </p>
          </div>
          <button
            onClick={() => onNavigate('experiments')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExperiments.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
            <FlaskConical className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-300">No experiments recorded yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Paste any YouTube, Instagram, Facebook, or Telegram URL to begin your first personal research session.
            </p>
            <button
              onClick={onOpenUrlInput}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              Paste Content URL
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentExperiments.map((exp) => {
              const platformCfg = getPlatformConfig(exp.content.platform);
              const formattedDate = new Date(exp.startedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={exp.id}
                  onClick={() => onOpenExperiment(exp)}
                  className="rounded-xl bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/80 p-4 transition duration-150 cursor-pointer flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    {/* Header: Platform & Date */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${platformCfg.tagColor}`}>
                          {platformCfg.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {exp.experimentNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Title & Creator */}
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition line-clamp-2">
                        {exp.content.title}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                        <span>by</span>
                        <span className="text-zinc-300 font-medium">{exp.content.creator}</span>
                        <span className="text-zinc-500 text-[11px]">({exp.content.creatorHandle})</span>
                      </p>
                    </div>

                    {/* URL Snippet */}
                    <div className="text-[11px] text-zinc-500 font-mono truncate bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800/60">
                      {exp.content.url}
                    </div>

                    {/* Interaction Badges (User controlled) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        Boolean(exp.watched || exp.actions?.watched) ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800/50 text-zinc-600'
                      }`}>
                        <Eye className="w-2.5 h-2.5" />
                        {Boolean(exp.watched || exp.actions?.watched) ? 'Watched' : 'Unwatched'}
                      </span>

                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                        Boolean(exp.liked || exp.actions?.liked) ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-zinc-800/50 text-zinc-600'
                      }`}>
                        <Heart className="w-2.5 h-2.5" />
                        {Boolean(exp.liked || exp.actions?.liked) ? 'Liked' : 'Unliked'}
                      </span>

                      {Boolean(exp.commented || exp.actions?.commented) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          Commented
                        </span>
                      )}

                      {Boolean(exp.saved || exp.isBookmarked || exp.actions?.saved) && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Bookmark className="w-2.5 h-2.5" />
                          Saved
                        </span>
                      )}
                    </div>

                    {/* Personal Notes Preview */}
                    {exp.research?.observations?.attentionGrabber && (
                      <p className="text-xs text-zinc-400 line-clamp-2 italic bg-zinc-950/40 p-2 rounded border border-zinc-800/40">
                        "{exp.research.observations.attentionGrabber}"
                      </p>
                    )}
                  </div>

                  {/* Footer: Rating and Action */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-zinc-200">
                        {exp.personalRating > 0 ? `${exp.personalRating}/10` : 'Unrated'}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1">Rating</span>
                    </div>

                    <span className="text-xs text-indigo-400 group-hover:translate-x-0.5 transition flex items-center gap-1 font-medium">
                      Open Lab
                      <ArrowRight className="w-3 h-3" />
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
