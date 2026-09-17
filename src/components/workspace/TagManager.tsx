import React, { useState } from 'react';
import { Tag, Plus, X, Hash } from 'lucide-react';
import {
  getTags,
  createTag,
  assignTag,
  removeTag
} from '../../services/tagService';

interface TagManagerProps {
  assignedTags: string[];
  onChangeTags: (updatedTags: string[]) => void;
}

export const TagManager: React.FC<TagManagerProps> = ({
  assignedTags = [],
  onChangeTags
}) => {
  const [availableTags, setAvailableTags] = useState<string[]>(() => getTags());
  const [newTagInput, setNewTagInput] = useState('');

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;

    const nextTags = assignTag(assignedTags, clean);
    onChangeTags(nextTags);
    setAvailableTags(getTags());
    setNewTagInput('');
  };

  const handleToggleTag = (tag: string) => {
    if (assignedTags.includes(tag)) {
      onChangeTags(removeTag(assignedTags, tag));
    } else {
      onChangeTags(assignTag(assignedTags, tag));
    }
  };

  const handleRemoveAssigned = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChangeTags(removeTag(assignedTags, tag));
  };

  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Categorization & Tags
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          {assignedTags.length} assigned
        </span>
      </div>

      {/* Currently Assigned Tags */}
      <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
        {assignedTags.length === 0 ? (
          <span className="text-xs text-zinc-500 italic">
            No tags assigned yet. Select from suggestions below or create a custom tag.
          </span>
        ) : (
          assignedTags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-200 text-xs font-mono group"
            >
              <span>{t}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveAssigned(t, e)}
                className="hover:text-white transition p-0.5 rounded hover:bg-indigo-500/30"
                title="Remove tag"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Custom Tag Input */}
      <form onSubmit={handleAddCustomTag} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1">
          <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Add custom tag (e.g. #retention, #ugc, #voiceover)..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={!newTagInput.trim()}
          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 disabled:opacity-40 transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Tag</span>
        </button>
      </form>

      {/* Tag Suggestions Pool */}
      <div className="pt-2 border-t border-zinc-800/60">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
          Suggested Tag Bank
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {availableTags.map((tag) => {
            const isAssigned = assignedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleToggleTag(tag)}
                className={`text-[11px] font-mono px-2 py-0.5 rounded-md border transition ${
                  isAssigned
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
