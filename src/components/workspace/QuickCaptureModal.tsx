import React, { useState } from 'react';
import { Zap, X, Star, Link2, Target, Tag, ArrowRight, Check } from 'lucide-react';
import { TestAccount, Platform } from '../../types';
import { parseContentUrl } from '../../platforms/platformRegistry';
import { createExperimentFromUrl, saveExperiment } from '../../services/experimentService';
import { useToast } from '../../context/ToastContext';

interface QuickCaptureModalProps {
  isOpen: boolean;
  activeAccount: TestAccount | null;
  onClose: () => void;
  onExperimentSaved?: (experimentId: string, openInWorkspace: boolean) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  activeAccount,
  onClose,
  onExperimentSaved
}) => {
  const [url, setUrl] = useState('');
  const [hook, setHook] = useState('');
  const [rating, setRating] = useState<number>(8);
  const [tags, setTags] = useState<string[]>(['#hook', '#shorts']);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const detected = url.trim() ? parseContentUrl(url.trim()) : null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    let clean = newTag.trim().toLowerCase();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async (openInWorkspace: boolean = false) => {
    if (!url.trim()) {
      showToast('Please enter a content URL', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create experiment
      const newExp = await createExperimentFromUrl(url.trim(), activeAccount?.id);
      
      // Update with quick capture fields
      const updated = await saveExperiment({
        ...newExp,
        hook: hook.trim(),
        personalRating: rating,
        rating,
        tags: Array.from(new Set([...tags, `#${newExp.content?.platform || 'social'}`])),
        updatedAt: Date.now()
      });

      showToast('Quick Capture logged successfully ✓', 'success');

      if (openInWorkspace && onExperimentSaved) {
        onExperimentSaved(updated.id, true);
        onClose();
      } else {
        // Reset form for "Save & Next"
        setUrl('');
        setHook('');
        setRating(8);
        setTags(['#hook', '#shorts']);
        if (onExperimentSaved) {
          onExperimentSaved(updated.id, false);
        }
      }
    } catch (err) {
      showToast('Failed to save quick capture', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Quick Capture Mode</h3>
              <p className="text-[11px] text-zinc-400">
                Rapid content logging for high-volume scrolling sessions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Account Pill */}
        {activeAccount && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
            <span className="text-[10px] font-mono text-zinc-500">ACCOUNT:</span>
            <span className="font-semibold text-zinc-200">
              {activeAccount.displayName}
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">
              (@{activeAccount.username})
            </span>
          </div>
        )}

        {/* URL Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Content URL
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube, Instagram, Facebook, or Telegram URL..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>

          {detected && (
            <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize border border-zinc-700">
                {detected.platform} • {detected.type}
              </span>
              <span className="truncate">{detected.title}</span>
            </div>
          )}
        </div>

        {/* Hook (one sentence) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-300">
            Hook (One Sentence)
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <textarea
              rows={2}
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder='e.g. "Stop using flexbox for grid layouts" or audio pattern interrupt at 0:01'
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Rating Slider (1-10) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span>Rating (1-10)</span>
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {rating}/10
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full accent-amber-500 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[11px] font-mono text-zinc-200"
              >
                <span>{t}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-400"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTag} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag (e.g. #editing, #trend)..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium"
            >
              Add
            </button>
          </form>
        </div>

        {/* Footer Actions: [ Save & Next ] [ Save & Open in Workspace ] */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isSubmitting || !url.trim()}
              onClick={() => handleSave(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition disabled:opacity-40"
            >
              Save & Open
            </button>

            <button
              type="button"
              disabled={isSubmitting || !url.trim()}
              onClick={() => handleSave(false)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <span>Save & Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
