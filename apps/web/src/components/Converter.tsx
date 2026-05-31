"use client";

import type { ConvertJob, PdfEngine } from "@pandoc-online/shared-types";
import { ALLOWED_FILTERS, CSL_STYLES } from "@pandoc-online/shared-types";
import { Copy, Download, FileUp, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { convertDocument, fetchFormats, resolveArtifactUrl } from "@/lib/api";

const READ_FORMATS = [
  "markdown",
  "gfm",
  "html",
  "docx",
  "latex",
  "epub",
  "rst",
  "org",
  "asciidoc",
];

const WRITE_FORMATS = [...READ_FORMATS, "pdf"];

const PDF_ENGINES: PdfEngine[] = ["xelatex", "lualatex", "pdflatex", "wkhtmltopdf", "typst"];

const SAMPLE_MARKDOWN = `# Hello Pandoc Online

Convert **Markdown** to HTML, DOCX, PDF, EPUB and more.

## Math example

Inline: $E = mc^2$

## Table

| Format | Use |
|--------|-----|
| PDF | Print |
| HTML | Web |
`;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function detectFormat(filename: string, content: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    md: "markdown",
    markdown: "markdown",
    html: "html",
    htm: "html",
    docx: "docx",
    tex: "latex",
    epub: "epub",
    rst: "rst",
    org: "org",
    adoc: "asciidoc",
  };
  if (ext && map[ext]) return map[ext];
  if (content.trimStart().startsWith("<!") || content.includes("<html")) return "html";
  if (content.includes("\\documentclass")) return "latex";
  return "markdown";
}

export function Converter({
  defaultSource = "markdown",
  defaultTarget = "html",
}: {
  defaultSource?: string;
  defaultTarget?: string;
}) {
  const [sourceFormat, setSourceFormat] = useState(defaultSource);
  const [targetFormat, setTargetFormat] = useState(defaultTarget);
  const [content, setContent] = useState(SAMPLE_MARKDOWN);
  const [pdfEngine, setPdfEngine] = useState<PdfEngine>("xelatex");
  const [mathEngine, setMathEngine] = useState<"katex" | "mathjax" | "mathml" | "plain">("katex");
  const [cslStyle, setCslStyle] = useState<string>("apa");
  const [bibContent, setBibContent] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [toc, setToc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [artifactUrl, setArtifactUrl] = useState<string | null>(null);
  const [logUrl, setLogUrl] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [referenceDocB64, setReferenceDocB64] = useState<string | null>(null);
  const [assets, setAssets] = useState<{ name: string; contentBase64: string }[]>([]);

  useEffect(() => {
    fetchFormats().catch(() => undefined);
  }, []);

  const onFileDrop = useCallback(async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const fmt = detectFormat(file.name, "");
    const binary = ["docx", "odt", "epub"].includes(fmt);
    if (binary) {
      setContent(await fileToBase64(file));
      setSourceFormat(fmt);
    } else {
      const text = await file.text();
      setContent(text);
      setSourceFormat(detectFormat(file.name, text));
    }
  }, []);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    setArtifactUrl(null);
    setCommand("");
    setWarnings([]);
    try {
      const isBinary = ["docx", "odt", "epub"].includes(sourceFormat);
      const job: ConvertJob = {
        source: {
          format: sourceFormat,
          content: isBinary && !content.startsWith("base64:") ? `base64:${content}` : content,
        },
        target: {
          format: targetFormat,
          engine: targetFormat === "pdf" ? pdfEngine : undefined,
        },
        options: {
          pdfEngine: targetFormat === "pdf" ? pdfEngine : undefined,
          math: targetFormat === "html" ? mathEngine : undefined,
          toc,
          filters: selectedFilter ? [selectedFilter] : undefined,
          referenceDoc: referenceDocB64 ?? undefined,
          citations: bibContent
            ? { bib: bibContent, cslStyle }
            : undefined,
        },
        assets: assets.length ? assets : undefined,
      };
      const result = await convertDocument(job);
      setCommand(result.command);
      setArtifactUrl(resolveArtifactUrl(result.artifactUrl));
      setLogUrl(resolveArtifactUrl(result.logUrl));
      setWarnings(result.warnings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = async () => {
    if (command) await navigator.clipboard.writeText(command);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
            From
            <select
              value={sourceFormat}
              onChange={(e) => setSourceFormat(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {READ_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
            To
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              {WRITE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          {targetFormat === "pdf" && (
            <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
              PDF engine
              <select
                value={pdfEngine}
                onChange={(e) => setPdfEngine(e.target.value as PdfEngine)}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                {PDF_ENGINES.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
          )}
          {targetFormat === "html" && (
            <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
              Math
              <select
                value={mathEngine}
                onChange={(e) =>
                  setMathEngine(e.target.value as "katex" | "mathjax" | "mathml" | "plain")
                }
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="katex">KaTeX</option>
                <option value="mathjax">MathJax</option>
                <option value="mathml">MathML</option>
                <option value="plain">Plain</option>
              </select>
            </label>
          )}
        </div>

        <div
          className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)] transition hover:border-[var(--accent)]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void onFileDrop(e.dataTransfer.files);
          }}
        >
          <FileUp className="h-4 w-4" />
          <span>Drag & drop a file, or</span>
          <label className="cursor-pointer font-medium text-[var(--accent)]">
            browse
            <input
              type="file"
              className="hidden"
              accept=".md,.markdown,.html,.htm,.docx,.tex,.epub,.rst,.org,.adoc"
              onChange={(e) => void onFileDrop(e.target.files)}
            />
          </label>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4 min-h-[220px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-relaxed focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          placeholder="Paste or type your document here..."
          spellCheck={false}
        />

        <details className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
          <summary className="cursor-pointer font-medium text-[var(--foreground)]">
            Advanced options
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={toc} onChange={(e) => setToc(e.target.checked)} />
              Table of contents
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              CSL style
              <select
                value={cslStyle}
                onChange={(e) => setCslStyle(e.target.value)}
                className="rounded border border-[var(--border)] px-2 py-1.5 text-sm"
              >
                {CSL_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)] sm:col-span-2">
              BibTeX (optional)
              <textarea
                value={bibContent}
                onChange={(e) => setBibContent(e.target.value)}
                className="min-h-[60px] rounded border border-[var(--border)] p-2 font-mono text-xs"
                placeholder="@article{key, title={...}, year={2024}}"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Allowlisted filter
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="rounded border border-[var(--border)] px-2 py-1.5 text-sm"
              >
                <option value="">None</option>
                {ALLOWED_FILTERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Reference DOCX
              <input
                type="file"
                accept=".docx"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) setReferenceDocB64(await fileToBase64(file));
                }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Attach assets
              <input
                type="file"
                multiple
                onChange={async (e) => {
                  const list = e.target.files;
                  if (!list) return;
                  const next = [];
                  for (const file of Array.from(list)) {
                    next.push({
                      name: file.name,
                      contentBase64: await fileToBase64(file),
                    });
                  }
                  setAssets(next);
                }}
              />
            </label>
          </div>
        </details>

        <button
          type="button"
          onClick={() => void handleConvert()}
          disabled={loading || !content.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Converting…
            </>
          ) : (
            "Convert"
          )}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {(artifactUrl || command) && (
          <div className="mt-6 space-y-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h3 className="text-sm font-semibold">Output</h3>
            {artifactUrl && (
              <a
                href={artifactUrl}
                download
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Download className="h-4 w-4" />
                Download converted file
              </a>
            )}
            {logUrl && (
              <a
                href={logUrl}
                className="ml-3 text-sm text-[var(--accent)] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                View conversion log
              </a>
            )}
            {command && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted)]">Pandoc command</span>
                  <button
                    type="button"
                    onClick={() => void copyCommand()}
                    className="inline-flex items-center gap-1 text-xs text-[var(--accent)]"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
                <pre className="overflow-x-auto rounded bg-white p-3 text-xs text-[var(--foreground)]">
                  {command}
                </pre>
              </div>
            )}
            {warnings.length > 0 && (
              <ul className="text-xs text-amber-700">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
