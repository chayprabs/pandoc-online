import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-4 text-sm text-[var(--muted)]">
        <Link href="/privacy" className="hover:text-[var(--accent)]">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-[var(--accent)]">
          Terms &amp; Conditions
        </Link>
      </div>
    </footer>
  );
}
