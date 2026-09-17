import { ExperimentReference } from '../types';

const STORAGE_KEY = 'content_lab_experiment_references_v3';

// Seed initial references for existing initial experiments
const INITIAL_REFERENCES: ExperimentReference[] = [
  {
    id: 'ref-001',
    experimentId: 'exp-001',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    caption: 'Visual hook: Stage light silhouette matches drum snare hit at 0:02',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'ref-002',
    experimentId: 'exp-002',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    caption: 'Split-screen layout: Red X over boilerplate code drives immediate visual contrast',
    createdAt: Date.now() - 86400000
  }
];

function loadStoredReferences(): ExperimentReference[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REFERENCES));
      return INITIAL_REFERENCES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read references from storage:', err);
    return INITIAL_REFERENCES;
  }
}

function persistReferences(refs: ExperimentReference[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
  } catch (err) {
    console.error('Failed to persist references:', err);
  }
}

export async function getReferences(experimentId: string): Promise<ExperimentReference[]> {
  const all = loadStoredReferences();
  return all.filter((r) => r.experimentId === experimentId);
}

export async function saveReference(
  item: Omit<ExperimentReference, 'id' | 'createdAt'> & { id?: string; createdAt?: number }
): Promise<ExperimentReference> {
  const all = loadStoredReferences();
  const id = item.id || `ref-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const createdAt = item.createdAt || Date.now();

  const newRef: ExperimentReference = {
    id,
    experimentId: item.experimentId,
    imageUrl: item.imageUrl,
    caption: item.caption || '',
    createdAt
  };

  const existingIndex = all.findIndex((r) => r.id === id);
  if (existingIndex >= 0) {
    all[existingIndex] = newRef;
  } else {
    all.push(newRef);
  }

  persistReferences(all);
  return newRef;
}

export async function deleteReference(id: string): Promise<void> {
  const all = loadStoredReferences();
  const filtered = all.filter((r) => r.id !== id);
  persistReferences(filtered);
}
