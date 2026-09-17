import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Experiment, TestAccount } from '../types';
import { improveCommentWithGemini } from '../services/api';

interface CommentWorkspaceProps {
  experiment: Experiment;
  activeAccount: TestAccount | undefined;
  onUpdateCommentDraft: (draft: { text: string; posted: boolean; savedAt?: string; postedAt?: string }) => void;
  onOpenContentInPlatform: () => void;
}

export const CommentWorkspace: React.FC<CommentWorkspaceProps> = ({
  experiment,
  activeAccount,
  onUpdateCommentDraft,
  onOpenContentInPlatform,
}) => {
  const [commentText, setCommentText] = useState(experiment.commentDraft?.text || '');
  const [isPosted, setIsPosted] = useState(experiment.commentDraft?.posted || false);
  const [selectedTone, setSelectedTone] = useState('engaging and thoughtful');
  const [isImproving, setIsImproving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const characterCount = commentText.length;

  const handleSaveDraft = () => {
    onUpdateCommentDraft({
      text: commentText,
      posted: isPosted,
      savedAt: new Date().toISOString(),
      postedAt: isPosted ? (experiment.commentDraft?.postedAt || new Date().toISOString()) : undefined
    });
    setSaveStatus('Draft saved');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleTogglePosted = (checked: boolean) => {
    setIsPosted(checked);
    onUpdateCommentDraft({
      text: commentText,
      posted: checked,
      savedAt: new Date().toISOString(),
      postedAt: checked ? new Date().toISOString() : undefined
    });
  };

  const handleCopyComment = () => {
    if (!commentText) return;
    navigator.clipboard.writeText(commentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImproveWithAI = async () => {
    if (!commentText.trim()) return;

    setIsImproving(true);
    setAiSuggestions(null);

    const result = await improveCommentWithGemini({
      originalComment: commentText,
      tone: selectedTone,
      platform: experiment.content.platform,
      contentContext: `${experiment.content.title} by ${experiment.content.creator}`
    });

    setIsImproving(false);
    if (result.success && result.improved) {
      setAiSuggestions(result.improved);
    }
  };

  const handleApplySuggestion = (text: string) => {
    setCommentText(text);
  };

  return (
    <div className="space-y-4">
      {/* Principle Disclaimer */}
      <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
        <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-200">Manual Posting Guarantee: </span>
          <span>Content Test Lab will never automatically post to external platforms. Draft your test comment, use AI for tone polishing, and copy to post manually using your active test account.</span>
        </div>
      </div>

      {/* Editor Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            Comment Draft
          </label>
          <span className="font-mono text-zinc-500 text-[11px]">
            {characterCount} characters
          </span>
        </div>

        <textarea
          rows={4}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Draft your test comment or research observation here..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
        />

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Save className="w-3 h-3 text-zinc-400" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={handleCopyComment}
              disabled={!commentText.trim()}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Copy Comment</span>
                </>
              )}
            </button>

            {saveStatus && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3 h-3" /> {saveStatus}
              </span>
            )}
          </div>

          {/* Open Content in Platform */}
          <button
            type="button"
            onClick={onOpenContentInPlatform}
            className="px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in Platform</span>
          </button>
        </div>

        {/* Mark as Posted Verification Checkbox */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPosted}
              onChange={(e) => handleTogglePosted(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-xs font-medium text-zinc-300">
              Mark as posted
            </span>
          </label>
          <span className="text-[11px] text-zinc-500">
            (Records that you executed the manual comment action in your testing feed)
          </span>
        </div>
      </div>

      {/* AI Assistance: Improve Comment */}
      <div className="p-4 rounded-xl bg-zinc-950/70 border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Assistance: Improve Comment</span>
          </div>

          <select
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
          >
            <option value="engaging and thoughtful">Tone: Engaging & Thoughtful</option>
            <option value="curious and inquisitive">Tone: Curious & Inquisitive</option>
            <option value="analytical and critical">Tone: Analytical / Breakdown</option>
            <option value="concise and punchy">Tone: Short & Punchy</option>
          </select>
        </div>

        <p className="text-[11px] text-zinc-400 leading-normal">
          Refines grammar, clarity, and conversational hooks while keeping your authentic voice.
        </p>

        <button
          type="button"
          onClick={handleImproveWithAI}
          disabled={isImproving || !commentText.trim()}
          className="w-full py-2 bg-indigo-600/90 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium shadow-sm transition flex items-center justify-center gap-2"
        >
          {isImproving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analyzing Comment...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Improve Comment Variations</span>
            </>
          )}
        </button>

        {/* AI Suggestions Display */}
        {aiSuggestions && (
          <div className="mt-3 space-y-2.5 pt-2 border-t border-zinc-800/80 animate-in fade-in duration-200">
            <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Suggested Variations (Click to Apply)
            </p>

            {aiSuggestions.optionNatural && (
              <div
                onClick={() => handleApplySuggestion(aiSuggestions.optionNatural)}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 cursor-pointer transition"
              >
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">Option A: Natural Flow</span>
                <p>"{aiSuggestions.optionNatural}"</p>
              </div>
            )}

            {aiSuggestions.optionEngaging && (
              <div
                onClick={() => handleApplySuggestion(aiSuggestions.optionEngaging)}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 cursor-pointer transition"
              >
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">Option B: High-Engagement Question</span>
                <p>"{aiSuggestions.optionEngaging}"</p>
              </div>
            )}

            {aiSuggestions.optionConcise && (
              <div
                onClick={() => handleApplySuggestion(aiSuggestions.optionConcise)}
                className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 cursor-pointer transition"
              >
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">Option C: Concise & Punchy</span>
                <p>"{aiSuggestions.optionConcise}"</p>
              </div>
            )}

            {aiSuggestions.strategicRationale && (
              <p className="text-[11px] text-zinc-400 italic bg-zinc-950 p-2 rounded border border-zinc-800/60">
                <strong>Strategic Note:</strong> {aiSuggestions.strategicRationale}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
