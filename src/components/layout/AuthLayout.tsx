import type { ReactNode } from 'react';
import { Logo } from './Logo';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth__panel">
        <Logo light size="lg" />
        <div className="auth__hero">
          <span className="pill pill--accent">FOTOGRAFIA DE CORRIDA</span>
          <p className="auth__title">Sua corrida.<br />Seus momentos.<br /><span className="accent">Suas histórias.</span></p>
          <p className="auth__text">Encontre as fotos da sua prova e guarde os momentos que fizeram a diferença.</p>
        </div>
        <p className="auth__foot"><span className="accent">01</span> CAPTURE O MOMENTO. REVIVA A CORRIDA.</p>
      </aside>
      <main className="auth__content" id="conteudo">
        <div className="auth__form">{children}</div>
      </main>
    </div>
  );
}
