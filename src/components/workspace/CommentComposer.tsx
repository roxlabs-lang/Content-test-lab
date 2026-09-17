import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Trash2,
  Save,
  Check,
  Wand2,
  Scissors,
  SpellCheck,
  Eye
} from 'lucide-react';
import { processCommentWithAi, CommentAiAction } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface CommentComposerProps {
  initialDraft?: string;
  platform?: string;
  onSaveDraft: (text: string) => void;
  onDraftChange?: (isDirty: boolean) => void;
}

const MAX_CHARS = 2200;

export const CommentComposer: React.FC<CommentComposerProps> = ({
  initialDraft = '',
  platform = 'social media',
  onSaveDraft,
  onDraftChange
}) => {
  const [text, setText] = useState(initialDraft);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRationale, setAiRationale] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setText(initialDraft);
  }, [initialDraft]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS);
    setText(val);
    if (onDraftChange) {
      onDraftChange(val !== initialDraft);
    }
  };

  const handleSave = () => {
    onSaveDraft(text);
    setSaved(true);
    if (onDraftChange) onDraftChange(false);
    showToast('Comment draft saved ✓', 'success');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Comment copied to clipboard! Ready to paste into platform.', 'info');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy comment', 'error');
    }
  };

  const handleClear = () => {
    setText('');
    onSaveDraft('');
    setAiRationale(null);
    if (onDraftChange) onDraftChange(false);
    showToast('Draft cleared', 'info');
  };

  const handleAiAction = async (action: CommentAiAction) => {
    if (!text.trim()) {
      showToast('Write a draft first to apply AI refinements.', 'warning');
      return;
    }

    setIsAiLoading(true);
    setAiRationale(null);

    try {
      const res = await processCommentWithAi(text, action, platform);
      if (res.text) {
        setText(res.text);
        if (onDraftChange) onDraftChange(true);
        if (res.rationale) {
          setAiRationale(res.rationale);
        }
        showToast(`AI refined draft (${action.replace('_', ' ')})`, 'success');
      }
    } catch {
      showToast('AI adjustment failed', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const charCount = text.length;
  const isNearLimit = charCount > 2000;

  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
      {/* Header & Character Counter */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Comment Composer & Testing Draft
          </span>
        </div>

        <span
          className={`text-[11px] font-mono ${
            isNearLimit ? 'text-amber-400 font-bold' : 'text-zinc-500'
          }`}
        >
          {charCount} / {MAX_CHARS}
        </span>
      </div>

      {/* Draft Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          rows={4}
          placeholder="Write your comment draft here... Test hooks, engagement questions, or value-add responses before posting manually."
          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none font-sans leading-relaxed"
        />

        {isAiLoading && (
          <div className="absolute inset-0 bg-zinc-950/70 rounded-xl flex items-center justify-center gap-2 text-xs text-indigo-300 backdrop-blur-xs">
            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>Refining with Gemini AI...</span>
          </div>
        )}
      </div>

      {/* AI Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-zinc-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            AI Tools:
          </span>

          <button
            type="button"
            disabled={isAiLoading || !text.trim()}
            onClick={() => handleAiAction('improve')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 disabled:opacity-40 text-[11px] font-medium transition flex items-center gap-1"
          >
            <Wand2 className="w-3 h-3 text-indigo-400" />
            <span>Improve</span>
          </button>

          <button
            type="button"
            disabled={isAiLoading || !text.trim()}
            onClick={() => handleAiAction('shorten')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 disabled:opacity-40 text-[11px] font-medium transition flex items-center gap-1"
          >
            <Scissors className="w-3 h-3 text-emerald-400" />
            <span>Shorten</span>
          </button>

          <button
            type="button"
            disabled={isAiLoading || !text.trim()}
            onClick={() => handleAiAction('make_clearer')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 disabled:opacity-40 text-[11px] font-medium transition flex items-center gap-1"
          >
            <Eye className="w-3 h-3 text-sky-400" />
            <span>Make clearer</span>
          </button>

          <button
            type="button"
            disabled={isAiLoading || !text.trim()}
            onClick={() => handleAiAction('fix_grammar')}
            className="px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-700/80 text-zinc-300 hover:text-white border border-zinc-700/50 disabled:opacity-40 text-[11px] font-medium transition flex items-center gap-1"
          >
            <SpellCheck className="w-3 h-3 text-amber-400" />
            <span>Fix grammar</span>
          </button>
        </div>

        {/* Primary Action Buttons: [ Save Draft ] [ Copy ] [ Clear ] */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition text-xs font-medium disabled:opacity-30"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!text.trim()}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition flex items-center gap-1.5 border border-zinc-700/60 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Saved ✓' : 'Save Draft'}</span>
          </button>
        </div>
      </div>

      {/* AI Strategy Rationale Pill */}
      {aiRationale && (
        <div className="text-[11px] text-zinc-400 bg-zinc-950/70 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono flex items-center gap-2">
          <span className="text-indigo-400">💡 AI Rationale:</span>
          <span>{aiRationale}</span>
        </div>
      )}
    </div>
  );
};
