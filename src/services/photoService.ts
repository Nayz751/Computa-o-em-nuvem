import type { Photo, PhotoRequest } from '../models';
import { ServiceError } from './errors';
import { commit, getDb, wait } from './db';
import { requireRole, requireUser } from './access';
import { renderOriginalPlaceholder } from '../utils/placeholderImage';

export const listPhotos = (): Photo[] => getDb().photos;

/** Exclui uma fotografia PRÓPRIA. Solicitações pendentes ligadas a ela são canceladas. */
export async function deletePhoto(actorId: string, photoId: string): Promise<{ photoId: string; requests: PhotoRequest[] }> {
  await wait();
  const actor = requireUser(actorId);
  requireRole(actor, 'photographer', 'Apenas fotógrafos podem excluir fotografias.');
  const db = getDb();
  const photo = db.photos.find((p) => p.id === photoId);
  if (!photo) throw new ServiceError('Fotografia não encontrada.', 'NOT_FOUND');
  if (photo.photographerId !== actor.id) {
    throw new ServiceError('Você só pode excluir as suas próprias fotografias.', 'FORBIDDEN');
  }
  const changed: PhotoRequest[] = [];
  const now = new Date().toISOString();
  db.requests.forEach((r) => {
    if (r.photoId === photoId && r.status === 'pending') {
      r.status = 'cancelled';
      r.updatedAt = now;
      changed.push(r);
    }
  });
  db.photos = db.photos.filter((p) => p.id !== photoId);
  commit();
  return { photoId, requests: changed };
}

/**
 * Simula a entrega do original. Em produção o backend deve validar a solicitação
 * e devolver uma URL assinada e temporária — o original nunca deve ser público.
 */
export async function getOriginalForDownload(actorId: string, requestId: string): Promise<{ filename: string; dataUrl: string }> {
  await wait(400);
  const actor = requireUser(actorId);
  const request = getDb().requests.find((r) => r.id === requestId);
  if (!request) throw new ServiceError('Solicitação não encontrada.', 'NOT_FOUND');
  if (request.runnerId !== actor.id) throw new ServiceError('Esta solicitação não pertence à sua conta.', 'FORBIDDEN');
  if (request.status !== 'fulfilled') throw new ServiceError('O download só é liberado após a autorização do fotógrafo.', 'FORBIDDEN');
  const photo = getDb().photos.find((p) => p.id === request.photoId);
  if (!photo) throw new ServiceError('A fotografia original não está mais disponível.', 'NOT_FOUND');
  const dataUrl = photo.previewUrl ?? renderOriginalPlaceholder(photo.tone, photo.title);
  return { filename: `tracemark-${photo.id}-original-simulada.${dataUrl.startsWith('data:image/png') ? 'png' : 'jpg'}`, dataUrl };
}
