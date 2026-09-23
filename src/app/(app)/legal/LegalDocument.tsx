import type { ReactNode } from 'react';
import { getLegalCompanyInfo, applyLegalPlaceholders } from './company';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

/** Shared renderer for the three `/legal/*` pages: a title and its sections. */
export function LegalDocument({
  title,
  sections,
  footer,
}: {
  title: string;
  sections: LegalSection[];
  footer?: ReactNode;
}) {
  const info = getLegalCompanyInfo();

  return (
    <article className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-semibold">{title}</h1>

      {sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-lg font-medium">{section.heading}</h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {applyLegalPlaceholders(paragraph, info)}
            </p>
          ))}
        </section>
      ))}

      {footer}
    </article>
  );
}
