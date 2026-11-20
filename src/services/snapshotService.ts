import type { Event, Photo, PhotoComment, PhotoRequest, PublicUser, Notification } from '../models';
import { getDb, getSessionUserId } from './db';
import { toPublic } from './access';

export interface Snapshot {
  users: PublicUser[];
  events: Event[];
  photos: Photo[];
  requests: PhotoRequest[];
  comments: PhotoComment[];
  notifications: Notification[];
  currentUserId: string | null;
}

/** Leitura inicial dos dados. Com um backend, vira uma busca assíncrona na API. */
export function loadSnapshot(): Snapshot {
  const db = getDb();
  const sessionId = getSessionUserId();
  return {
    users: db.users.map(toPublic),
    events: [...db.events],
    photos: [...db.photos],
    requests: [...db.requests],
    comments: [],
    notifications: [],
    currentUserId: db.users.some((u) => u.id === sessionId) ? sessionId : null,
  };
}
