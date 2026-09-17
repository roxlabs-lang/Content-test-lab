import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Video,
  Mic,
  Target,
  Lightbulb,
  Tag
} from 'lucide-react';
import { Experiment } from '../../types';

interface NotesEditorProps {
  experiment: Experiment;
  onSaveNotes: (updated: Partial<Experiment>) => void;
}

export const NotesEditor: React.FC<NotesEditorProps> = ({
  experiment,
  onSaveNotes
}) => {
  // Field values
  const [form, setForm] = useState({
    hook: experiment.hook || '',
    firstImpression: experiment.firstImpression || experiment.opening || '',
    visuals: experiment.visuals || '',
    editing: experiment.editing || '',
    audio: experiment.audio || '',
    caption: experiment.caption || '',
    cta: experiment.cta || '',
    audience: experiment.audience || '',
    observations: experiment.observations || '',
    whatWorked: experiment.whatWorked || '',
    whatDidnt: experiment.whatDidnt || '',
    recreationIdea: experiment.recreationIdea || ''
  });

  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    hookOpening: true,
    production: true,
    copyAudience: false,
    observations: true
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when experiment prop changes
  useEffect(() => {
    setForm({
      hook: experiment.hook || '',
      firstImpression: experiment.firstImpression || experiment.opening || '',
      visuals: experiment.visuals || '',
      editing: experiment.editing || '',
      audio: experiment.audio || '',
      caption: experiment.caption || '',
      cta: experiment.cta || '',
      audience: experiment.audience || '',
      observations: experiment.observations || '',
      whatWorked: experiment.whatWorked || '',
      whatDidnt: experiment.whatDidnt || '',
      recreationIdea: experiment.recreationIdea || ''
    });
  }, [experiment.id]);

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    setSaveStatus('saving');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      onSaveNotes({
        hook: updated.hook,
        firstImpression: updated.firstImpression,
        opening: updated.firstImpression,
        visuals: updated.visuals,
        editing: updated.editing,
        audio: updated.audio,
        caption: updated.caption,
        cta: updated.cta,
        audience: updated.audience,
        observations: updated.observations,
        whatWorked: updated.whatWorked,
        whatDidnt: updated.whatDidnt,
        recreationIdea: updated.recreationIdea
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 800);
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-4">
      {/* Header with Autosave indicator */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Structured Research Notes
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {saveStatus === 'saving' && (
            <span className="text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Autosaving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Autosaved ✓
            </span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-zinc-500">
              Autosave active
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: HOOK & FIRST 3 SECONDS */}
      <div className="rounded-lg border border-zinc-800/80 overflow-hidden bg-zinc-950/40">
        <button
          type="button"
          onClick={() => toggleSection('hookOpening')}
          className="w-full px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 flex items-center justify-between transition text-left"
        >
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            1. Hook & Opening (First 3 Seconds)
          </span>
          {openSections.hookOpening ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {openSections.hookOpening && (
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Hook (Text overlay, spoken hook, or visual surprise)
              </label>
              <textarea
                rows={2}
                value={form.hook}
                onChange={(e) => handleFieldChange('hook', e.target.value)}
                placeholder='e.g. "Stop doing X", "I spent 30 days analyzing...", immediate pattern interrupt'
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                First 3 Seconds / First Impression
              </label>
              <textarea
                rows={2}
                value={form.firstImpression}
                onChange={(e) => handleFieldChange('firstImpression', e.target.value)}
                placeholder="What occurs in frames 0-90? Audio spike, fast movement, camera zoom, facial reaction?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PRODUCTION & PACING */}
      <div className="rounded-lg border border-zinc-800/80 overflow-hidden bg-zinc-950/40">
        <button
          type="button"
          onClick={() => toggleSection('production')}
          className="w-full px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 flex items-center justify-between transition text-left"
        >
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            2. Visuals, Editing & Audio
          </span>
          {openSections.production ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {openSections.production && (
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Visuals (Lighting, camera angles, props, colors)
              </label>
              <input
                type="text"
                value={form.visuals}
                onChange={(e) => handleFieldChange('visuals', e.target.value)}
                placeholder="e.g. High-contrast neon backlight, macro lens close-up"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Editing / Pacing (Cut frequency, B-roll, zooms, captions)
              </label>
              <input
                type="text"
                value={form.editing}
                onChange={(e) => handleFieldChange('editing', e.target.value)}
                placeholder="e.g. Cut every 1.5s, animated kinetic subtitle styling, glitch transition"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Audio / Voiceover (Trending sound, SFX, voice tone)
              </label>
              <input
                type="text"
                value={form.audio}
                onChange={(e) => handleFieldChange('audio', e.target.value)}
                placeholder="e.g. Sub-bass whoosh on text pop, high-tempo trending lo-fi beat"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: COPYWRITING & CALL TO ACTION */}
      <div className="rounded-lg border border-zinc-800/80 overflow-hidden bg-zinc-950/40">
        <button
          type="button"
          onClick={() => toggleSection('copyAudience')}
          className="w-full px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 flex items-center justify-between transition text-left"
        >
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-sky-400" />
            3. Caption, Call to Action & Audience
          </span>
          {openSections.copyAudience ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {openSections.copyAudience && (
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Caption & Hashtags
              </label>
              <textarea
                rows={2}
                value={form.caption}
                onChange={(e) => handleFieldChange('caption', e.target.value)}
                placeholder="How is the caption structured? First line hook? Hashtags used?"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Call to Action (CTA)
                </label>
                <input
                  type="text"
                  value={form.cta}
                  onChange={(e) => handleFieldChange('cta', e.target.value)}
                  placeholder='e.g. "Save for later", "Comment GUIDE"'
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={form.audience}
                  onChange={(e) => handleFieldChange('audience', e.target.value)}
                  placeholder="e.g. Junior developers, SaaS founders, fitness beginners"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: OBSERVATIONS & RECREATION IDEAS */}
      <div className="rounded-lg border border-zinc-800/80 overflow-hidden bg-zinc-950/40">
        <button
          type="button"
          onClick={() => toggleSection('observations')}
          className="w-full px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 flex items-center justify-between transition text-left"
        >
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            4. Observations & Recreation Blueprint
          </span>
          {openSections.observations ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {openSections.observations && (
          <div className="p-3 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                General Observations & Insights
              </label>
              <textarea
                rows={2}
                value={form.observations}
                onChange={(e) => handleFieldChange('observations', e.target.value)}
                placeholder="Key takeaways on why this performed well or poorly..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-emerald-400 mb-1">
                  What Worked Well
                </label>
                <textarea
                  rows={2}
                  value={form.whatWorked}
                  onChange={(e) => handleFieldChange('whatWorked', e.target.value)}
                  placeholder="Strongest viral attributes"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-rose-400 mb-1">
                  What Didn't Work / Drop-off Triggers
                </label>
                <textarea
                  rows={2}
                  value={form.whatDidnt}
                  onChange={(e) => handleFieldChange('whatDidnt', e.target.value)}
                  placeholder="Weak points, boring lulls, or confusing sections"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-indigo-400 mb-1">
                Recreation Blueprint (How to adapt for our own brand/channel)
              </label>
              <textarea
                rows={2}
                value={form.recreationIdea}
                onChange={(e) => handleFieldChange('recreationIdea', e.target.value)}
                placeholder="Specific format to test: e.g. Adapt the '3 mistakes' framework for our next product launch"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
