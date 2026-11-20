import type { Event, Photo, PhotoRequest, User } from '../models';
import { buildSeed } from '../mocks/seed';

/**
 * Repositório local (mock). Os serviços só falam com este módulo;
 * para integrar um backend, troque estas leituras/gravações por chamadas HTTP.
 */
export interface Database {
  users: User[];
  events: Event[];
  photos: Photo[];
  requests: PhotoRequest[];
}

const DB_KEY = 'tracemark:db:v1';
const SESSION_KEY = 'tracemark:session:v1';
let cache: Database | null = null;

export function getDb(): Database {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      cache = JSON.parse(raw) as Database;
      return cache;
    }
  } catch {
    /* armazenamento indisponível: usa a base de exemplo */
  }
  cache = buildSeed();
  commit();
  return cache;
}

export function commit(): void {
  if (!cache) return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    /* cota excedida: os dados continuam válidos apenas em memória */
  }
}

export function resetDb(): void {
  cache = buildSeed();
  commit();
  setSessionUserId(null);
}

export function getSessionUserId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSessionUserId(id: string | null): void {
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignora */
  }
}

export const wait = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
