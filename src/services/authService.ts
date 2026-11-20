import type { PublicUser, UserRole } from '../models';
import { ServiceError } from './errors';
import { commit, getDb, getSessionUserId, newId, setSessionUserId, wait } from './db';
import { toPublic } from './access';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (value: string) => EMAIL_RE.test(value.trim());

export function getSessionUser(): PublicUser | null {
  const id = getSessionUserId();
  const user = id ? getDb().users.find((u) => u.id === id) : undefined;
  return user ? toPublic(user) : null;
}

export async function login(email: string, password: string): Promise<PublicUser> {
  await wait();
  if (!isValidEmail(email)) throw new ServiceError('Informe um e-mail válido.', 'VALIDATION');
  if (!password) throw new ServiceError('Informe sua senha.', 'VALIDATION');
  const user = getDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) throw new ServiceError('E-mail ou senha incorretos.', 'UNAUTHENTICATED');
  setSessionUserId(user.id);
  return toPublic(user);
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  await wait();
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  if (input.name.trim().length < 2) throw new ServiceError('Informe seu nome.', 'VALIDATION');
  if (!isValidEmail(email)) throw new ServiceError('Informe um e-mail válido.', 'VALIDATION');
  if (input.password.length < 6) throw new ServiceError('A senha deve ter ao menos 6 caracteres.', 'VALIDATION');
  if (input.password !== input.confirmPassword) throw new ServiceError('As senhas não conferem.', 'VALIDATION');
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    throw new ServiceError('Já existe uma conta com este e-mail.', 'DUPLICATE');
  }
  const now = new Date().toISOString();
  const base = email.split('@')[0].replace(/[^a-z0-9._]/g, '') || 'usuario';
  const user = {
    id: newId('u'), name: input.name.trim(), handle: `@${base}`, email, password: input.password,
    role: input.role, createdAt: now, ...(input.role === 'photographer' ? { photographerSince: now } : {}),
  };
  db.users.push(user);
  commit();
  setSessionUserId(user.id);
  return toPublic(user);
}

export async function logout(): Promise<void> {
  setSessionUserId(null);
}
