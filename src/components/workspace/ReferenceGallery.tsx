import React, { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Plus,
  Trash2,
  X,
  Maximize2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ExperimentReference } from '../../types';
import {
  getReferences,
  saveReference,
  deleteReference
} from '../../services/referenceService';
import { useToast } from '../../context/ToastContext';

interface ReferenceGalleryProps {
  experimentId: string;
}

export const ReferenceGallery: React.FC<ReferenceGalleryProps> = ({
  experimentId
}) => {
  const [references, setReferences] = useState<ExperimentReference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<ExperimentReference | null>(null);

  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const { showToast } = useToast();

  const loadReferences = async () => {
    setIsLoading(true);
    try {
      const data = await getReferences(experimentId);
      setReferences(data);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferences();
  }, [experimentId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showToast('Please provide an image or upload a screenshot', 'warning');
      return;
    }

    try {
      await saveReference({
        experimentId,
        imageUrl: imageUrl.trim(),
        caption: caption.trim()
      });
      showToast('Reference screenshot added ✓', 'success');
      setImageUrl('');
      setCaption('');
      setShowAddModal(false);
      loadReferences();
    } catch {
      showToast('Failed to save reference', 'error');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteReference(id);
      setReferences((prev) => prev.filter((r) => r.id !== id));
      if (previewImage?.id === id) setPreviewImage(null);
      showToast('Reference deleted', 'info');
    } catch {
      showToast('Failed to delete reference', 'error');
    }
  };

  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-4 space-y-3">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-zinc-200">
            Screenshots & Visual References ({references.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add Screenshot</span>
        </button>
      </div>

      {/* Gallery Grid */}
      {references.length === 0 ? (
        <div
          onClick={() => setShowAddModal(true)}
          className="py-6 px-4 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
        >
          <Upload className="w-6 h-6 text-zinc-600 group-hover:text-indigo-400 transition" />
          <p className="text-xs text-zinc-400 font-medium">
            No screenshots saved yet
          </p>
          <p className="text-[11px] text-zinc-500 max-w-xs">
            Upload your own visual hooks, split-screens, comment proof, or analytics snapshots.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {references.map((ref) => (
            <div
              key={ref.id}
              onClick={() => setPreviewImage(ref)}
              className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-indigo-500/60 cursor-pointer transition shadow-sm"
            >
              <img
                src={ref.imageUrl}
                alt={ref.caption || 'Reference screenshot'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />

              {/* Delete Button overlay */}
              <button
                type="button"
                onClick={(e) => handleDelete(ref.id, e)}
                className="absolute top-1.5 right-1.5 p-1 rounded bg-black/70 hover:bg-red-600 text-zinc-300 hover:text-white transition opacity-0 group-hover:opacity-100"
                title="Delete screenshot"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {/* Caption Bar */}
              {ref.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-1.5 pt-3">
                  <p className="text-[10px] text-zinc-200 truncate leading-tight">
                    {ref.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">
                  Add Screenshot / Reference
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReference} className="space-y-3">
              {/* File upload or paste URL */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Upload image file or paste Image URL
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                    <span>Or image URL:</span>
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or data:image/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Caption / Reference note
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Visual hook pattern interrupt at 0:02"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Preview if image URL exists */}
              {imageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black border border-zinc-800">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Save Reference
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage.imageUrl}
              alt={previewImage.caption || 'Full reference'}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl border border-zinc-800 shadow-2xl"
            />
            {previewImage.caption && (
              <p className="mt-3 text-sm text-zinc-200 text-center font-medium bg-zinc-900/80 border border-zinc-800 px-4 py-2 rounded-xl">
                {previewImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
