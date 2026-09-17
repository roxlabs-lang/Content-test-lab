import React, { useState } from 'react';
import {
  FlaskConical,
  X,
  Search,
  Plus,
  Film,
  Sparkles
} from 'lucide-react';
import { Platform, ContentType } from '../types';
import { detectContentUrl } from '../services/api';
import { getPlatformConfig } from '../utils/platform';

interface NewExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    url: string;
    platform: Platform;
    contentType: ContentType;
    title: string;
    creator: string;
    creatorHandle: string;
    tags: string[];
    thumbnailUrl?: string;
  }) => void;
}

export const NewExperimentModal: React.FC<NewExperimentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [url, setUrl] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [contentType, setContentType] = useState<ContentType>('reel');
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [tagsInput, setTagsInput] = useState('#hook, #retention');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  if (!isOpen) return null;

  const handleAutoDetect = async () => {
    if (!url.trim()) return;
    setIsDetecting(true);
    const detected = await detectContentUrl(url.trim());
    setIsDetecting(false);

    setPlatform(detected.platform);
    setContentType(detected.contentType);
    setTitle(detected.title || title);
    setCreator(detected.creator || creator);
    setCreatorHandle(detected.creatorHandle || creatorHandle);
    if (detected.thumbnailUrl) setThumbnailUrl(detected.thumbnailUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    onCreate({
      url: url.trim(),
      platform,
      contentType,
      title: title.trim(),
      creator: creator.trim() || 'Creator',
      creatorHandle: creatorHandle.trim() || (creator.trim() ? `@${creator.trim()}` : '@creator'),
      tags,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Create New Social Content Experiment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-sm font-mono"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* URL Input & Quick Detect */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Content URL (YouTube, Instagram, Facebook, Telegram)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                required
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAutoDetect}
                disabled={isDetecting || !url.trim()}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Auto-Detect</span>
              </button>
            </div>
          </div>

          {/* Platform & Content Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e: any) => setPlatform(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="telegram">Telegram</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Format Type</label>
              <select
                value={contentType}
                onChange={(e: any) => setContentType(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="reel">Reel / Short-form</option>
                <option value="video">Standard Video</option>
                <option value="post">Image / Text Post</option>
                <option value="profile">Creator Profile / Channel</option>
                <option value="story">Story</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Content Title / Hypothesis
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5 Morning Habits (Visual Shock Hook)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Creator & Handle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Creator Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Hormozi"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-zinc-300 mb-1">Handle / Username</label>
              <input
                type="text"
                placeholder="e.g. @hormozi"
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="#hook, #retention, #editing, #fitness"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition"
            >
              Launch Experiment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
