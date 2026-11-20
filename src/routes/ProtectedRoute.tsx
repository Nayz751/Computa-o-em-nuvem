import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../models';
import { useApp } from '../context/AppContext';
import { ForbiddenPage } from '../pages/NotFoundPage';

interface AuthState { from?: string; resumeRequest?: boolean }

/** Bloqueia visitantes e perfis sem permissão. As regras também são validadas nos serviços. */
export function ProtectedRoute({ role, children }: { role?: UserRole; children: ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/entrar" replace state={{ from: `${location.pathname}${location.search}` } satisfies AuthState} />;
  }
  if (role && currentUser.role !== role) return <ForbiddenPage />;
  return <>{children}</>;
}

/**
 * Páginas de login/cadastro. Usuários autenticados voltam para a página de origem
 * (ex.: a fotografia que queriam solicitar) ou para a área do seu perfil.
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (currentUser) {
    const state = (location.state ?? {}) as AuthState;
    const fallback = currentUser.role === 'photographer' ? '/admin' : '/';
    return <Navigate to={state.from ?? fallback} replace state={state.resumeRequest ? { resumeRequest: true } : undefined} />;
  }
  return <>{children}</>;
}
