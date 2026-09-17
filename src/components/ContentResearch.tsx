import React, { useState } from 'react';
import {
  FileText,
  Save,
  Check,
  Eye,
  Sliders,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Film
} from 'lucide-react';
import { ContentResearchAnalysis, Experiment } from '../types';

interface ContentResearchProps {
  experiment: Experiment;
  onUpdateResearch: (updated: ContentResearchAnalysis) => void;
}

export const ContentResearch: React.FC<ContentResearchProps> = ({
  experiment,
  onUpdateResearch,
}) => {
  const [research, setResearch] = useState<ContentResearchAnalysis>(
    experiment.research || {
      hook: '',
      first3Seconds: '',
      topic: '',
      format: '',
      editingStyle: '',
      caption: '',
      cta: '',
      thumbnailNotes: '',
      musicAudio: '',
      visualStyle: '',
      observations: {
        attentionGrabber: '',
        whatWorked: '',
        whatDidnt: '',
        whatCouldRecreate: '',
        whatLearned: '',
      },
    }
  );

  const [saveStatus, setSaveStatus] = useState('');

  const handleChangeField = (field: keyof ContentResearchAnalysis, value: any) => {
    const updated = { ...research, [field]: value };
    setResearch(updated);
    onUpdateResearch(updated);
  };

  const handleChangeObservation = (obsField: keyof ContentResearchAnalysis['observations'], value: string) => {
    const updatedObservations = {
      ...research.observations,
      [obsField]: value,
    };
    const updated = {
      ...research,
      observations: updatedObservations,
    };
    setResearch(updated);
    onUpdateResearch(updated);
  };

  const handleManualSave = () => {
    onUpdateResearch(research);
    setSaveStatus('Research updated');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Save Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Tactical Content Research
          </h4>
          <p className="text-[11px] text-zinc-400">
            Document algorithmic mechanics, structural pacing, and creative takeaways
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> {saveStatus}
            </span>
          )}
          <button
            onClick={handleManualSave}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition flex items-center gap-1.5"
          >
            <Save className="w-3 h-3 text-zinc-400" />
            <span>Save Research</span>
          </button>
        </div>
      </div>

      {/* Content Analysis Section */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
        <h5 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          Content Analysis
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Hook */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Hook (Opening Premise)
            </label>
            <input
              type="text"
              placeholder="e.g. Visual shock, bold negative premise, counter-intuitive question..."
              value={research.hook}
              onChange={(e) => handleChangeField('hook', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* First 3 Seconds */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              First 3 Seconds (Retention Anchor)
            </label>
            <input
              type="text"
              placeholder="e.g. Rapid visual cut, sound effect drop, immediate on-screen title..."
              value={research.first3Seconds}
              onChange={(e) => handleChangeField('first3Seconds', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Topic / Niche
            </label>
            <input
              type="text"
              placeholder="e.g. Productivity, Tech Tutorials, Lifestyle, Finance..."
              value={research.topic}
              onChange={(e) => handleChangeField('topic', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Format */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Format
            </label>
            <input
              type="text"
              placeholder="e.g. Talking head + b-roll, split-screen tutorial, voiceover screen recording..."
              value={research.format}
              onChange={(e) => handleChangeField('format', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Editing Style */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Editing Style & Pacing
            </label>
            <input
              type="text"
              placeholder="e.g. Cuts every 2.1s, kinetic typography, zoom-punch, sound design..."
              value={research.editingStyle}
              onChange={(e) => handleChangeField('editingStyle', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* CTA */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Call to Action (CTA)
            </label>
            <input
              type="text"
              placeholder="e.g. Comment 'GUIDE' for link, link in bio, subscribe for part 2..."
              value={research.cta}
              onChange={(e) => handleChangeField('cta', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Music/Audio */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Music / Audio Track
            </label>
            <input
              type="text"
              placeholder="e.g. Trending upbeat instrumental, voiceover only, lo-fi beat..."
              value={research.musicAudio}
              onChange={(e) => handleChangeField('musicAudio', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Visual Style */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Visual Style & Color Grading
            </label>
            <input
              type="text"
              placeholder="e.g. High contrast warm lighting, moody dark UI, vibrant neon accents..."
              value={research.visualStyle}
              onChange={(e) => handleChangeField('visualStyle', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Caption & Thumbnail Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs pt-1">
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Caption Breakdown
            </label>
            <textarea
              rows={2}
              placeholder="Key caption lines, hashtags used, spacing style..."
              value={research.caption}
              onChange={(e) => handleChangeField('caption', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Thumbnail / Cover Notes
            </label>
            <textarea
              rows={2}
              placeholder="Cover frame selection, text overlay clarity, emotional face expression..."
              value={research.thumbnailNotes}
              onChange={(e) => handleChangeField('thumbnailNotes', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* My Observations Section */}
      <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-4">
        <h5 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          My Observations
        </h5>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              What grabbed my attention?
            </label>
            <textarea
              rows={2}
              placeholder="The specific trigger that made me stop scrolling..."
              value={research.observations?.attentionGrabber || ''}
              onChange={(e) => handleChangeObservation('attentionGrabber', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-emerald-400 mb-1">
                What worked?
              </label>
              <textarea
                rows={2}
                placeholder="High points, satisfying payoff, smart delivery..."
                value={research.observations?.whatWorked || ''}
                onChange={(e) => handleChangeObservation('whatWorked', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-rose-400 mb-1">
                What didn't?
              </label>
              <textarea
                rows={2}
                placeholder="Friction points, lull in pacing, confusing phrasing..."
                value={research.observations?.whatDidnt || ''}
                onChange={(e) => handleChangeObservation('whatDidnt', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-medium text-indigo-300 mb-1">
                What could I recreate?
              </label>
              <textarea
                rows={2}
                placeholder="Actionable template, hook angle, or editing transition to adopt..."
                value={research.observations?.whatCouldRecreate || ''}
                onChange={(e) => handleChangeObservation('whatCouldRecreate', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-amber-300 mb-1">
                What did I learn?
              </label>
              <textarea
                rows={2}
                placeholder="Core algorithm or audience psychology takeaway..."
                value={research.observations?.whatLearned || ''}
                onChange={(e) => handleChangeObservation('whatLearned', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
