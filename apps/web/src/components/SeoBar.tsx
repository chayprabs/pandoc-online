export function SeoBar({ title, description }: { title?: string; description?: string }) {
  return (
    <section
      className="w-full border-b border-[var(--border)] bg-white px-4 py-4 sm:px-6"
      aria-label="Product description"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm font-medium text-[var(--foreground)] sm:text-base">
          {title ??
            "Convert Markdown, DOCX, HTML, LaTeX, EPUB and PDF online via Pandoc with templates, citations, filters and math support."}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
          {description ??
            "Free document conversion playground — upload or paste your source, pick formats and options, then download the result instantly."}
        </p>
      </div>
    </section>
  );
}
