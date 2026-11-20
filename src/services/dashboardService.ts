import type { DashboardMetrics, Photo, PhotoRequest } from '../models';

/** Indicadores calculados a partir dos dados — nenhum número fixo. */
export function computeMetrics(photos: Photo[], requests: PhotoRequest[], photographerId: string): DashboardMetrics {
  const mine = requests.filter((r) => r.photographerId === photographerId);
  return {
    totalPhotos: photos.filter((p) => p.photographerId === photographerId).length,
    totalRequests: mine.length,
    pendingRequests: mine.filter((r) => r.status === 'pending').length,
    fulfilledRequests: mine.filter((r) => r.status === 'fulfilled').length,
  };
}
