// Shared types for sync progress tracking

export interface SyncProgress {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  phase: 'initializing' | 'fetching' | 'downloading' | 'processing' | 'complete';
  totalGalleries: number;
  currentGalleryIndex: number;
  currentGalleryName: string;
  totalPhotos: number;
  currentPhotoIndex: number;
  currentPhotoName: string;
  message: string;
  startedAt: string | null;
  completedAt: string | null;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  albums: number;
  photos: number;
  error?: string;
}

export type ProgressCallback = (progress: SyncProgress) => void;

export function createInitialProgress(): SyncProgress {
  return {
    status: 'idle',
    phase: 'initializing',
    totalGalleries: 0,
    currentGalleryIndex: 0,
    currentGalleryName: '',
    totalPhotos: 0,
    currentPhotoIndex: 0,
    currentPhotoName: '',
    message: '',
    startedAt: null,
    completedAt: null,
  };
}

export function formatProgressMessage(progress: SyncProgress): string {
  if (progress.status === 'idle') return 'Ready to sync';
  if (progress.status === 'error') return progress.error || 'Sync failed';
  if (progress.status === 'completed') return 'Sync completed successfully';

  const galleryProgress = progress.totalGalleries > 0
    ? `Album ${progress.currentGalleryIndex + 1}/${progress.totalGalleries}`
    : '';

  const photoProgress = progress.totalPhotos > 0
    ? `Photo ${progress.currentPhotoIndex + 1}/${progress.totalPhotos}`
    : '';

  const parts = [galleryProgress, photoProgress].filter(Boolean);
  return parts.length > 0 ? parts.join(' - ') : progress.message;
}

export function calculateOverallProgress(progress: SyncProgress): number {
  if (progress.status === 'idle') return 0;
  if (progress.status === 'completed') return 100;
  if (progress.status === 'error') return 0;

  if (progress.totalGalleries === 0) return 0;

  // Calculate progress based on galleries and photos
  const galleryWeight = 100 / progress.totalGalleries;
  const completedGalleries = progress.currentGalleryIndex * galleryWeight;

  let currentGalleryProgress = 0;
  if (progress.totalPhotos > 0) {
    currentGalleryProgress = (progress.currentPhotoIndex / progress.totalPhotos) * galleryWeight;
  }

  return Math.min(99, completedGalleries + currentGalleryProgress);
}
