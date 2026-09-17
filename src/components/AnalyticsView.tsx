import React from 'react';
import {
  BarChart3,
  PieChart,
  Eye,
  Heart,
  MessageSquare,
  Bookmark,
  Star,
  Users,
  Film,
  TrendingUp,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Experiment, Platform, TestAccount } from '../types';
import { getPlatformConfig } from '../utils/platform';

interface AnalyticsViewProps {
  experiments: Experiment[];
  accounts: TestAccount[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  experiments,
  accounts,
}) => {
  const total = experiments.length;

  // Platform Breakdown
  const platformCounts: Record<Platform, number> = {
    youtube: 0,
    instagram: 0,
    facebook: 0,
    telegram: 0,
  };

  experiments.forEach((exp) => {
    const p = exp.content?.platform;
    if (p && platformCounts[p] !== undefined) {
      platformCounts[p]++;
    }
  });

  // Action tallies
  const watchedCount = experiments.filter((e) => e.watched || e.actions?.watched).length;
  const likedCount = experiments.filter((e) => e.liked || e.actions?.liked).length;
  const commentedCount = experiments.filter((e) => e.commented || e.actions?.commented).length;
  const savedCount = experiments.filter((e) => e.saved || e.actions?.saved).length;
  const followedCount = experiments.filter((e) => e.followed || e.actions?.followed).length;

  // Rating stats
  const ratedExperiments = experiments.filter((e) => (e.rating || e.personalRating || 0) > 0);
  const avgRating = ratedExperiments.length > 0
    ? (ratedExperiments.reduce((sum, e) => sum + (e.rating || e.personalRating || 0), 0) / ratedExperiments.length).toFixed(1)
    : '0.0';

  // Tag frequency
  const tagCounts: Record<string, number> = {};
  experiments.forEach((e) => {
    if (Array.isArray(e.tags)) {
      e.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    }
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Top researched creators
  const creatorCounts: Record<string, { count: number; handle: string; platform: Platform }> = {};
  experiments.forEach((e) => {
    if (e.content) {
      const creator = e.content.creator || 'Unknown';
      if (!creatorCounts[creator]) {
        creatorCounts[creator] = {
          count: 0,
          handle: e.content.creatorHandle || '@handle',
          platform: e.content.platform
        };
      }
      creatorCounts[creator].count++;
    }
  });
  const topCreators = Object.entries(creatorCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Research Analytics
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Quantified research telemetry computed strictly from your manually logged experiments and rating logs.
          </p>
        </div>
      </div>

      {/* Real Data Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200">Zero Synthetic Metrics: </strong>
          <span>These analytics reflect your personal testing logs in Content Test Lab. We do not inject simulated impressions, fictional view counts, or false platform algorithmic data.</span>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Total Experiments
          </span>
          <p className="text-2xl font-bold text-white font-mono">{total}</p>
          <p className="text-[11px] text-zinc-400">Logged research sessions</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Average Rating
          </span>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-2xl font-bold text-white font-mono">{avgRating}</span>
            <span className="text-xs text-zinc-500">/ 10</span>
          </div>
          <p className="text-[11px] text-zinc-400">Across {ratedExperiments.length} rated posts</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Active Accounts
          </span>
          <p className="text-2xl font-bold text-white font-mono">{accounts.length}</p>
          <p className="text-[11px] text-zinc-400">Isolated test identities</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Completion Rate
          </span>
          <p className="text-2xl font-bold text-white font-mono">
            {total > 0 ? Math.round((experiments.filter((e) => e.isCompleted).length / total) * 100) : 0}%
          </p>
          <p className="text-[11px] text-zinc-400">Full analysis finalized</p>
        </div>
      </div>

      {/* Two Columns: Action Log Tallies & Platform Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Log Tallies */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Manual Action Execution Breakdown
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Watched in Feed', count: watchedCount, icon: <Eye className="w-3.5 h-3.5 text-emerald-400" />, color: 'bg-emerald-500' },
              { label: 'Liked with Test Account', count: likedCount, icon: <Heart className="w-3.5 h-3.5 text-rose-400" />, color: 'bg-rose-500' },
              { label: 'Comment Drafted & Posted', count: commentedCount, icon: <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />, color: 'bg-indigo-500' },
              { label: 'Saved to Collections', count: savedCount, icon: <Bookmark className="w-3.5 h-3.5 text-amber-400" />, color: 'bg-amber-500' },
              { label: 'Followed Creator Profile', count: followedCount, icon: <Users className="w-3.5 h-3.5 text-cyan-400" />, color: 'bg-cyan-500' },
            ].map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 flex items-center gap-1.5 font-medium">
                      {item.icon}
                      {item.label}
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5" />
            Tested Content by Platform
          </h3>

          <div className="space-y-3">
            {(['youtube', 'instagram', 'facebook', 'telegram'] as Platform[]).map((p) => {
              const count = platformCounts[p] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const cfg = getPlatformConfig(p);

              return (
                <div key={p} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 flex items-center gap-2 font-medium">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${cfg.tagColor}`}>
                        {cfg.name}
                      </span>
                    </span>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-950 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Creators & Popular Research Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Researched Creators */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Frequently Researched Creators
          </h3>

          {topCreators.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">No creators logged yet.</p>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {topCreators.map(([name, data]) => (
                <div key={name} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-200 font-medium">{name}</span>
                    <span className="text-zinc-500 font-mono text-[11px] ml-1.5">{data.handle}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {data.count} {data.count === 1 ? 'test' : 'tests'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            Common Research Tags
          </h3>

          {topTags.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">No tags assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {topTags.map(([tag, count]) => (
                <div
                  key={tag}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5"
                >
                  <span className="text-indigo-400">{tag}</span>
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.2 rounded">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
