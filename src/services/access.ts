import type { PublicUser, User, UserRole } from '../models';
import { ServiceError } from './errors';
import { getDb } from './db';

export function toPublic(user: User): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

/** Valida a identidade do usuário nas regras de negócio, sem depender da interface. */
export function requireUser(userId: string | null | undefined): User {
  if (!userId) throw new ServiceError('Entre na sua conta para continuar.', 'UNAUTHENTICATED');
  const user = getDb().users.find((u) => u.id === userId);
  if (!user) throw new ServiceError('Sessão inválida. Entre novamente.', 'UNAUTHENTICATED');
  return user;
}

export function requireRole(user: User, role: UserRole, message?: string): void {
  if (user.role !== role) {
    throw new ServiceError(message ?? 'Seu perfil não tem permissão para esta ação.', 'FORBIDDEN');
  }
}
