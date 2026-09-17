import React, { useState, useEffect } from 'react';
import {
  Link2,
  Sparkles,
  ExternalLink,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { parsePlatformUrl, formatContentTypeLabel, getPlatformMeta, ParsedPlatformResult } from '../lib/platformParser';
import { ContentItem, Experiment } from '../types';
import { getExperimentByUrl, createExperiment } from '../services/experimentService';
import { useActiveAccount } from '../context/ActiveAccountContext';
import { useToast } from '../context/ToastContext';

interface UrlIngestionBarProps {
  onOpenExperiment: (exp: Experiment) => void;
  compact?: boolean;
}

export const UrlIngestionBar: React.FC<UrlIngestionBarProps> = ({
  onOpenExperiment,
  compact = false,
}) => {
  const { activeAccount } = useActiveAccount();
  const { showToast } = useToast();
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<ParsedPlatformResult | null>(null);
  const [existingExperiment, setExistingExperiment] = useState<Experiment | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!url.trim()) {
      setParsed(null);
      setExistingExperiment(null);
      return;
    }

    const result = parsePlatformUrl(url);
    setParsed(result);

    if (result.valid) {
      setIsChecking(true);
      getExperimentByUrl(url).then((found) => {
        setExistingExperiment(found);
        setIsChecking(false);
      });
    } else {
      setExistingExperiment(null);
    }
  }, [url]);

  const handleCreateNew = async () => {
    if (!parsed || !parsed.valid) return;
    setIsCreating(true);

    try {
      const contentItem: ContentItem = {
        id: `cnt_${Date.now()}`,
        url: parsed.cleanUrl,
        platform: parsed.platform,
        type: parsed.type,
        title: parsed.title || `${formatContentTypeLabel(parsed.type)} (${parsed.platform})`,
        creator: parsed.creator || 'Creator',
        creatorHandle: parsed.creatorHandle || '@creator',
        embedUrl: parsed.embedUrl,
        createdAt: Date.now(),
      };

      const exp = await createExperiment(contentItem, activeAccount || undefined);
      showToast('Experiment created successfully!', 'success');
      onOpenExperiment(exp);
      setUrl('');
    } catch (err) {
      showToast('Failed to create experiment.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenExisting = () => {
    if (existingExperiment) {
      showToast('Opening existing experiment...', 'info');
      onOpenExperiment(existingExperiment);
      setUrl('');
    }
  };

  const platformMeta = parsed?.valid ? getPlatformMeta(parsed.platform) : null;

  return (
    <div className={`w-full bg-zinc-900 border border-zinc-800/90 rounded-2xl shadow-xl transition-all ${compact ? 'p-3' : 'p-4 sm:p-6'}`}>
      <div className="space-y-3">
        {/* Input Bar */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-zinc-500">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste URL (YouTube, Instagram, Facebook, Telegram)..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl pl-10 pr-24 py-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition font-mono focus:ring-1 focus:ring-indigo-500/40"
          />
          {url && (
            <button
              onClick={() => setUrl('')}
              className="absolute right-3 px-2 py-1 text-zinc-500 hover:text-zinc-300 text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Validation & Detected Badges */}
        {parsed && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            {parsed.valid ? (
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${platformMeta?.badgeBg}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {platformMeta?.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
                      ✓ {formatContentTypeLabel(parsed.type)}
                    </span>
                    {parsed.creatorHandle && (
                      <span className="px-2 py-1 rounded-lg bg-zinc-900 text-zinc-400 font-mono text-[11px] hidden sm:inline">
                        {parsed.creatorHandle}
                      </span>
                    )}
                  </div>

                  {/* Embedding Notice */}
                  <span className="text-[11px] text-zinc-400 italic">
                    {platformMeta?.embedReason}
                  </span>
                </div>

                {/* Actions: Open Existing or Create New */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
                  {existingExperiment ? (
                    <div className="flex items-center gap-2 text-xs text-amber-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>This URL was already researched previously.</span>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400">
                      Ready to launch a new research workspace session.
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {existingExperiment && (
                      <button
                        type="button"
                        onClick={handleOpenExisting}
                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Open Existing Experiment</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isCreating}
                      onClick={handleCreateNew}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
                    >
                      {isCreating ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FlaskConical className="w-3.5 h-3.5" />
                      )}
                      <span>{existingExperiment ? 'Create Duplicate' : 'Launch Experiment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid URL Warning */
              <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{parsed.error || "⚠ This URL isn't recognized."}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
