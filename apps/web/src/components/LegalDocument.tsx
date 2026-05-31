import type { ReactNode } from "react";
import { LEGAL_LAST_UPDATED } from "@/content/legal-sections";

export function LegalDocument({
  title,
  intro,
  sections,
  footerNote,
}: {
  title: string;
  intro?: ReactNode;
  sections: { title: string; body: ReactNode }[];
  footerNote?: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold">{title}</h1>
      <p className="mb-6 text-xs text-[var(--muted)]">
        <strong>Last updated:</strong> {LEGAL_LAST_UPDATED}
      </p>
      {intro && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {intro}
        </div>
      )}
      <div className="space-y-6 text-sm leading-relaxed text-[var(--muted)]">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="mb-2 text-base font-semibold text-[var(--foreground)]">{s.title}</h2>
            <div>{s.body}</div>
          </section>
        ))}
      </div>
      {footerNote && (
        <p className="mt-8 border-t border-[var(--border)] pt-6 text-xs italic text-[var(--muted)]">
          {footerNote}
        </p>
      )}
    </main>
  );
}
