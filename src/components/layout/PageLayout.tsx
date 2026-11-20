import type { ReactNode } from 'react';
import { Header } from './Header';

export function PageLayout({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  return (
    <>
      <a href="#conteudo" className="skip-link">Ir para o conteúdo</a>
      <Header />
      <main id="conteudo" className={narrow ? 'container container--narrow' : 'container'}>{children}</main>
    </>
  );
}
