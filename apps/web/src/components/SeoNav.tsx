import Link from "next/link";

const LINKS = [
  { href: "/markdown-to-pdf", label: "MD → PDF" },
  { href: "/markdown-to-docx", label: "MD → DOCX" },
  { href: "/markdown-to-epub", label: "MD → EPUB" },
  { href: "/docx-to-markdown", label: "DOCX → MD" },
  { href: "/latex-to-pdf", label: "LaTeX → PDF" },
  { href: "/html-to-pdf", label: "HTML → PDF" },
];

export function SeoNav() {
  return (
    <nav
      className="mx-auto flex max-w-6xl flex-wrap justify-center gap-2 px-4 pb-3 sm:gap-3"
      aria-label="Popular conversions"
    >
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
