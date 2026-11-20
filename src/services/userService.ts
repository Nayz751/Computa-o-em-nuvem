import type { PublicUser } from '../models';
import { ServiceError } from './errors';
import { commit, getDb, wait } from './db';
import { requireRole, requireUser, toPublic } from './access';

export function listUsers(): PublicUser[] {
  return getDb().users.map(toPublic);
}

export async function updateProfile(actorId: string, data: { name: string; bio?: string }): Promise<PublicUser> {
  await wait();
  const user = requireUser(actorId);
  if (data.name.trim().length < 2) throw new ServiceError('Informe um nome com ao menos 2 caracteres.', 'VALIDATION');
  user.name = data.name.trim();
  user.bio = data.bio?.trim() || undefined;
  commit();
  return toPublic(user);
}

/** Converte a MESMA conta em fotógrafo, preservando dados e histórico. */
export async function becomePhotographer(actorId: string): Promise<PublicUser> {
  await wait(400);
  const user = requireUser(actorId);
  requireRole(user, 'runner', 'Esta conta já é de fotógrafo.');
  user.role = 'photographer';
  user.photographerSince = new Date().toISOString();
  commit();
  return toPublic(user);
}
