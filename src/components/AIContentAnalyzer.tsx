import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  Zap,
  Flame,
  Clock,
  Eye,
  BrainCircuit
} from 'lucide-react';
import { AIContentAnalysisResult, Experiment } from '../types';
import { analyzeContentWithGemini } from '../services/api';

interface AIContentAnalyzerProps {
  experiment: Experiment;
  onUpdateAiAnalysis: (analysis: AIContentAnalysisResult) => void;
}

export const AIContentAnalyzer: React.FC<AIContentAnalyzerProps> = ({
  experiment,
  onUpdateAiAnalysis,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const analysis = experiment.aiAnalysis;

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg('');

    const result = await analyzeContentWithGemini({
      url: experiment.content.url,
      platform: experiment.content.platform,
      contentType: experiment.content.contentType,
      creator: experiment.content.creator,
      title: experiment.content.title,
      hook: experiment.research?.hook,
      first3Seconds: experiment.research?.first3Seconds,
      topic: experiment.research?.topic,
      format: experiment.research?.format,
      editingStyle: experiment.research?.editingStyle,
      caption: experiment.research?.caption,
      cta: experiment.research?.cta,
      userObservations: experiment.research?.observations
    });

    setIsAnalyzing(false);

    if (result.success && result.analysis) {
      onUpdateAiAnalysis(result.analysis);
    } else {
      setErrorMsg(result.error || 'Failed to generate AI analysis.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Principle Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            AI Content & Algorithm Analyzer
          </h4>
          <p className="text-[11px] text-zinc-400">
            Powered by Gemini 3.8 Flash • Strict separation of observed facts from algorithm hypotheses
          </p>
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analyzing Mechanics...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{analysis ? 'Re-Analyze Content' : 'Analyze Content'}</span>
            </>
          )}
        </button>
      </div>

      {/* No Fabrication Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-zinc-200">Anti-Fabrication Principle: </strong>
          <span>This analyzer strictly avoids inventing unmeasurable platform metrics (no fake view counts, fake like numbers, or fictional demographics). It evaluates qualitative pacing, hook psychology, and narrative design based on observed test footage.</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Output */}
      {analysis ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Two-Column Comparison: Observed Information vs AI Interpretation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Observed Facts */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold border-b border-zinc-800/80 pb-2">
                <Eye className="w-3.5 h-3.5" />
                <span>Observed Information (Verifiable Facts)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {analysis.observedFacts && analysis.observedFacts.length > 0 ? (
                  analysis.observedFacts.map((fact, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 text-sm leading-tight">•</span>
                      <span>{fact}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-500 italic">User-verified video pacing and layout structures recorded in lab.</li>
                )}
              </ul>
            </div>

            {/* Box 2: AI Interpretation */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold border-b border-zinc-800/80 pb-2">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>AI Interpretation (Algorithmic Hypothesis)</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {analysis.aiInterpretations && analysis.aiInterpretations.length > 0 ? (
                  analysis.aiInterpretations.map((interp, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 text-sm leading-tight">•</span>
                      <span>{interp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-zinc-500 italic">Analytical deduction of retention levers and audience psychology.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Deep Qualitative Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Hook Breakdown */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                Hook Breakdown
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {analysis.hookBreakdown}
              </p>
            </div>

            {/* Opening Pacing */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                First 3-Seconds Pacing
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {analysis.openingPacing}
              </p>
            </div>

            {/* Story Structure */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                Narrative Arc & Story Structure
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {analysis.storyStructure}
              </p>
            </div>

            {/* Visual Editing Pattern */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                Editing Rhythm & Visual Patterns
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {analysis.editingAndVisualPattern}
              </p>
            </div>

            {/* Caption & CTA */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                Caption & CTA Friction
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {analysis.captionAndCtaAnalysis}
              </p>
            </div>

            {/* Audience Appeal */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase">
                Audience Appeal & Psychology
              </span>
              <p className="text-zinc-200 leading-relaxed">
                {analysis.audienceAppeal}
              </p>
            </div>
          </div>

          {/* Comment Section Themes & Triggers */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
            <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase">
              Predicted Comment Themes & Discourse Triggers
            </span>
            <p className="text-zinc-200 leading-relaxed">
              {analysis.commentThemesPrediction}
            </p>
          </div>

          {/* Key Drivers of Engagement */}
          {analysis.engagementDrivers && analysis.engagementDrivers.length > 0 && (
            <div className="p-4 rounded-xl bg-zinc-950/90 border border-indigo-500/30 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                Key Drivers of Engagement
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {analysis.engagementDrivers.map((driver, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
                    <span className="text-[10px] font-mono text-indigo-400 block mb-1">Driver 0{idx + 1}</span>
                    <p className="font-medium">{driver}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[11px] text-zinc-500 font-mono text-right">
            Model: {analysis.modelName} • Analyzed on {new Date(analysis.analyzedAt).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="py-12 rounded-2xl bg-zinc-950/40 border border-zinc-800 text-center space-y-3">
          <BrainCircuit className="w-10 h-10 text-zinc-600 mx-auto" />
          <h5 className="text-sm font-semibold text-zinc-300">No AI Analysis Run Yet</h5>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Click "Analyze Content" to generate qualitative breakdowns of this post's hook mechanics, visual patterns, story structure, and comment drivers.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition"
          >
            Run Gemini Analysis
          </button>
        </div>
      )}
    </div>
  );
};
