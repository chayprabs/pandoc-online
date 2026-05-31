import { Github, Globe } from "lucide-react";
import Link from "next/link";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Pandoc Online
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5" aria-label="External links">
          <a
            href="https://github.com/chayprabs/pandoc-online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
            title="GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href="https://x.com/chayprabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            title="Twitter / X"
            aria-label="Twitter"
          >
            <XIcon className="h-4 w-4" />
          </a>
          <a
            href="https://www.chaitanyaprabuddha.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            title="Personal website"
            aria-label="Website"
          >
            <Globe className="h-4 w-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
