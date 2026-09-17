import React, { useState } from 'react';
import {
  FileText,
  Search,
  ArrowUpRight,
  Lightbulb,
  CheckCircle2,
  Sliders,
  Filter,
  Star,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Experiment } from '../types';
import { getPlatformConfig } from '../utils/platform';

interface ResearchNotesViewProps {
  experiments: Experiment[];
  onOpenExperiment: (exp: Experiment) => void;
}

export const ResearchNotesView: React.FC<ResearchNotesViewProps> = ({
  experiments,
  onOpenExperiment,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Experiments that have either research observations or general notes
  const notesList = experiments.filter((exp) => {
    const obs = exp.research?.observations;
    const hasObs = exp.whatWorked || exp.whatDidnt || exp.recreationIdea || exp.observations ||
      obs?.attentionGrabber || obs?.whatWorked || obs?.whatDidnt || obs?.whatCouldRecreate || obs?.whatLearned;
    const hasHook = exp.hook || exp.opening || exp.research?.hook || exp.research?.first3Seconds;
    const hasGen = exp.generalNotes || exp.editing || exp.caption || exp.cta;
    return Boolean(hasObs || hasHook || hasGen);
  });

  const filtered = notesList.filter((exp) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const obs = exp.research?.observations;
    return (
      (exp.content?.title || '').toLowerCase().includes(q) ||
      (exp.content?.creator || '').toLowerCase().includes(q) ||
      (exp.hook || '').toLowerCase().includes(q) ||
      (exp.opening || '').toLowerCase().includes(q) ||
      (exp.whatWorked || '').toLowerCase().includes(q) ||
      (exp.whatDidnt || '').toLowerCase().includes(q) ||
      (exp.recreationIdea || '').toLowerCase().includes(q) ||
      (exp.observations || '').toLowerCase().includes(q) ||
      (exp.research?.hook || '').toLowerCase().includes(q) ||
      (exp.research?.first3Seconds || '').toLowerCase().includes(q) ||
      (obs?.attentionGrabber || '').toLowerCase().includes(q) ||
      (obs?.whatWorked || '').toLowerCase().includes(q) ||
      (obs?.whatCouldRecreate || '').toLowerCase().includes(q) ||
      (obs?.whatLearned || '').toLowerCase().includes(q)
    );
  });

  const handleCopyNote = (exp: Experiment) => {
    const title = exp.content?.title || 'Untitled';
    const platform = exp.content?.platform || 'Social';
    const creator = exp.content?.creator || 'Creator';
    const url = exp.content?.url || '';
    const hook = exp.hook || exp.research?.hook || 'N/A';
    const first3s = exp.opening || exp.research?.first3Seconds || 'N/A';
    const worked = exp.whatWorked || exp.research?.observations?.whatWorked || 'N/A';
    const didnt = exp.whatDidnt || exp.research?.observations?.whatDidnt || 'N/A';
    const recreate = exp.recreationIdea || exp.research?.observations?.whatCouldRecreate || 'N/A';

    const text = `Content Research Note: ${title} (${platform})
Creator: ${creator} (${url})
Hook: ${hook}
First 3s: ${first3s}
What Worked: ${worked}
What Didn't: ${didnt}
What to Recreate: ${recreate}`;

    navigator.clipboard.writeText(text);
    setCopiedId(exp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAllNotes = () => {
    const dataStr = JSON.stringify(notesList, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-test-lab-research-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Tactical Research & Observation Logs
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Aggregated algorithmic insights, hook deconstructions, and creative formulas documented across your test accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllNotes}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export Notes (JSON)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search observations, hooks, creator, learnings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Notes List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-center">
          <Lightbulb className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-300">No matching research observations found</p>
          <p className="text-xs text-zinc-500 mt-1">
            Open any content experiment and document hook triggers or learnings in the Content Research tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((exp) => {
            const platformCfg = getPlatformConfig(exp.content.platform);
            const obs = exp.research?.observations;

            return (
              <div
                key={exp.id}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 space-y-4 transition shadow-sm"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${platformCfg.tagColor}`}>
                      {platformCfg.name}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-100 line-clamp-1">
                      {exp.content.title}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      by <strong className="text-zinc-200">{exp.content.creator}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyNote(exp)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 p-1"
                      title="Copy Note"
                    >
                      {copiedId === exp.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onOpenExperiment(exp)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 ml-2"
                    >
                      <span>Open in Lab</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Structured Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                  {/* Hook & 3 Seconds */}
                  {(exp.research?.hook || exp.research?.first3Seconds) && (
                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold block">
                        Hook & First 3 Seconds
                      </span>
                      {exp.research?.hook && (
                        <p className="text-zinc-200"><strong className="text-zinc-400">Hook:</strong> {exp.research.hook}</p>
                      )}
                      {exp.research?.first3Seconds && (
                        <p className="text-zinc-300"><strong className="text-zinc-400">First 3s:</strong> {exp.research.first3Seconds}</p>
                      )}
                    </div>
                  )}

                  {/* What Worked & What Didn't */}
                  {(obs?.whatWorked || obs?.whatDidnt) && (
                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block">
                        Execution Evaluation
                      </span>
                      {obs?.whatWorked && (
                        <p className="text-zinc-200"><strong className="text-emerald-400">Worked:</strong> {obs.whatWorked}</p>
                      )}
                      {obs?.whatDidnt && (
                        <p className="text-zinc-300"><strong className="text-rose-400">Didn't:</strong> {obs.whatDidnt}</p>
                      )}
                    </div>
                  )}

                  {/* What Could Recreate & Learned */}
                  {(obs?.whatCouldRecreate || obs?.whatLearned) && (
                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold block">
                        Replication & Core Takeaway
                      </span>
                      {obs?.whatCouldRecreate && (
                        <p className="text-zinc-200"><strong className="text-amber-300">Recreate:</strong> {obs.whatCouldRecreate}</p>
                      )}
                      {obs?.whatLearned && (
                        <p className="text-zinc-300"><strong className="text-indigo-300">Takeaway:</strong> {obs.whatLearned}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Rating & Tags footer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    {exp.personalRating > 0 && (
                      <span className="flex items-center gap-1 font-mono text-zinc-300">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {exp.personalRating}/10
                      </span>
                    )}
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(exp.startedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {exp.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
