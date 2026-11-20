import type { PhotoRequest } from '../models';
import { ServiceError } from './errors';
import { commit, getDb, newId, wait } from './db';
import { requireRole, requireUser } from './access';

export const listRequests = (): PhotoRequest[] => getDb().requests;

export async function createRequest(actorId: string, photoId: string): Promise<PhotoRequest> {
  await wait();
  const actor = requireUser(actorId);
  requireRole(actor, 'runner', 'Apenas corredores podem solicitar a fotografia original.');
  const db = getDb();
  const photo = db.photos.find((p) => p.id === photoId);
  if (!photo) throw new ServiceError('Fotografia não encontrada.', 'NOT_FOUND');
  const active = db.requests.find(
    (r) => r.photoId === photoId && r.runnerId === actor.id && (r.status === 'pending' || r.status === 'fulfilled'),
  );
  if (active) {
    throw new ServiceError(
      active.status === 'pending' ? 'Você já tem uma solicitação pendente para esta fotografia.' : 'Esta fotografia já foi atendida para você.',
      'DUPLICATE',
    );
  }
  const event = db.events.find((e) => e.id === photo.eventId);
  const photographer = db.users.find((u) => u.id === photo.photographerId);
  const now = new Date().toISOString();
  const request: PhotoRequest = {
    id: newId('r'), photoId, eventId: photo.eventId, runnerId: actor.id, photographerId: photo.photographerId,
    status: 'pending', photoTitle: photo.title, eventName: event?.name ?? 'Evento', eventDate: event?.date ?? '',
    runnerName: actor.name, runnerEmail: actor.email, photographerName: photographer?.name ?? 'Fotógrafo',
    createdAt: now, updatedAt: now,
  };
  db.requests.unshift(request);
  commit();
  return request;
}

export async function cancelRequest(actorId: string, requestId: string): Promise<PhotoRequest> {
  await wait();
  const actor = requireUser(actorId);
  const request = getDb().requests.find((r) => r.id === requestId);
  if (!request) throw new ServiceError('Solicitação não encontrada.', 'NOT_FOUND');
  if (request.runnerId !== actor.id) throw new ServiceError('Você só pode cancelar as suas solicitações.', 'FORBIDDEN');
  if (request.status !== 'pending') throw new ServiceError('Apenas solicitações pendentes podem ser canceladas.', 'CONFLICT');
  request.status = 'cancelled';
  request.updatedAt = new Date().toISOString();
  commit();
  return request;
}

export async function respondToRequest(actorId: string, requestId: string, decision: 'fulfilled' | 'declined'): Promise<PhotoRequest> {
  await wait();
  const actor = requireUser(actorId);
  requireRole(actor, 'photographer', 'Apenas fotógrafos podem responder solicitações.');
  const request = getDb().requests.find((r) => r.id === requestId);
  if (!request) throw new ServiceError('Solicitação não encontrada.', 'NOT_FOUND');
  if (request.photographerId !== actor.id) {
    throw new ServiceError('Você não pode administrar solicitações de fotografias de outros fotógrafos.', 'FORBIDDEN');
  }
  if (request.status !== 'pending') throw new ServiceError('Esta solicitação já foi respondida ou cancelada.', 'CONFLICT');
  request.status = decision;
  request.updatedAt = new Date().toISOString();
  commit();
  return request;
}
