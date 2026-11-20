import type { ReactNode } from 'react';

interface PageIntroProps { line1: string; line2?: string; description?: string; eyebrow?: string; actions?: ReactNode }

export function PageIntro({ line1, line2, description, eyebrow, actions }: PageIntroProps) {
  return (
    <section className="intro">
      <div>
        {eyebrow && <span className="pill pill--accent">{eyebrow}</span>}
        <h1 className="intro__title">{line1}{line2 && <><br /><span className="accent">{line2}</span></>}</h1>
        {description && <p className="intro__text">{description}</p>}
      </div>
      {actions && <div className="intro__actions">{actions}</div>}
    </section>
  );
}
