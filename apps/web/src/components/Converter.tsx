"use client";

import type { ConvertJob, InspectResult, PdfEngine } from "@pandoc-online/shared-types";
import { ALLOWED_FILTERS, CSL_STYLES } from "@pandoc-online/shared-types";
import { FileDrop, ResultTabs, SamplePicker } from "@pandoc-online/shared-ui";
import { Copy, Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BIB_SAMPLE, BUILTIN_SAMPLES } from "@/data/samples";
import {
  convertDocument,
  fetchFormats,
  fetchTemplateContent,
  fetchTemplates,
  inspectDocument,
  resolveArtifactUrl,
} from "@/lib/api";
import { SourceEditor } from "./SourceEditor";

const PDF_ENGINES: PdfEngine[] = ["xelatex", "lualatex", "pdflatex", "wkhtmltopdf", "typst"];
const BINARY_FORMATS = new Set(["docx", "odt", "epub"]);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
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
    odt: "odt",
    tex: "latex",
    epub: "epub",
    rst: "rst",
    org: "org",
    adoc: "asciidoc",
    wiki: "mediawiki",
    json: "json",
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
  const [readFormats, setReadFormats] = useState<string[]>([]);
  const [writeFormats, setWriteFormats] = useState<string[]>([]);
  const [sourceFormat, setSourceFormat] = useState(defaultSource);
  const [targetFormat, setTargetFormat] = useState(defaultTarget);
  const [content, setContent] = useState(BUILTIN_SAMPLES[0].content);
  const [isBinarySource, setIsBinarySource] = useState(false);
  const [pdfEngine, setPdfEngine] = useState<PdfEngine>("xelatex");
  const [mathEngine, setMathEngine] = useState<"katex" | "mathjax" | "mathml" | "plain">("katex");
  const [cslStyle, setCslStyle] = useState("apa");
  const [bibContent, setBibContent] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [galleryTemplate, setGalleryTemplate] = useState("");
  const [customTemplate, setCustomTemplate] = useState("");
  const [toc, setToc] = useState(false);
  const [numberSections, setNumberSections] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [command, setCommand] = useState("");
  const [artifactUrl, setArtifactUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [logUrl, setLogUrl] = useState<string | null>(null);
  const [assetsZipUrl, setAssetsZipUrl] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [referenceDocB64, setReferenceDocB64] = useState<string | null>(null);
  const [assets, setAssets] = useState<{ name: string; contentBase64: string }[]>([]);
  const [inspectData, setInspectData] = useState<InspectResult | null>(null);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchFormats()
      .then((matrix) => {
        if (!matrix.length) return;
        const reads = matrix.map((m) => m.read);
        const writes = [...new Set(matrix.flatMap((m) => m.write))].sort();
        setReadFormats(reads);
        setWriteFormats(writes);
      })
      .catch(() => {
        const fallback = [
          "markdown",
          "gfm",
          "commonmark",
          "html",
          "docx",
          "odt",
          "latex",
          "epub",
          "rst",
          "org",
          "asciidoc",
          "mediawiki",
          "textile",
          "json",
        ];
        setReadFormats(fallback);
        setWriteFormats([...fallback, "pdf"]);
      });
    fetchTemplates()
      .then(setTemplates)
      .catch(() => undefined);
  }, []);

  const showMonaco = !isBinarySource;

  const onFileDrop = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;
    const fmt = detectFormat(file.name, "");
    const binary = BINARY_FORMATS.has(fmt);
    setIsBinarySource(binary);
    if (binary) {
      setContent(await fileToBase64(file));
    } else {
      const text = await file.text();
      setContent(text);
      setSourceFormat(detectFormat(file.name, text));
      return;
    }
    setSourceFormat(fmt);
  }, []);

  const runInspect = useCallback(async () => {
    if (isBinarySource) return;
    setInspecting(true);
    try {
      const data = await inspectDocument(content, sourceFormat);
      setInspectData(data);
    } catch {
      setInspectData(null);
    } finally {
      setInspecting(false);
    }
  }, [content, sourceFormat, isBinarySource]);

  useEffect(() => {
    const t = setTimeout(() => void runInspect(), 600);
    return () => clearTimeout(t);
  }, [runInspect]);

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    setArtifactUrl(null);
    setPreviewHtml(null);
    setCommand("");
    setWarnings([]);
    try {
      let templateOpt: string | undefined;
      if (galleryTemplate) templateOpt = `gallery:${galleryTemplate}`;
      else if (customTemplate.trim()) templateOpt = customTemplate;

      const job: ConvertJob = {
        source: {
          format: sourceFormat,
          content:
            isBinarySource && !content.startsWith("base64:")
              ? `base64:${content}`
              : content,
        },
        target: {
          format: targetFormat,
          engine: targetFormat === "pdf" ? pdfEngine : undefined,
        },
        options: {
          pdfEngine: targetFormat === "pdf" ? pdfEngine : undefined,
          math: targetFormat === "html" ? mathEngine : undefined,
          toc,
          numberSections,
          template: templateOpt,
          filters: selectedFilter ? [selectedFilter] : undefined,
          referenceDoc: referenceDocB64 ?? undefined,
          citations: bibContent ? { bib: bibContent, cslStyle } : undefined,
        },
        assets: assets.length ? assets : undefined,
      };
      const result = await convertDocument(job);
      setCommand(result.command);
      const artUrl = resolveArtifactUrl(result.artifactUrl);
      setArtifactUrl(artUrl);
      setLogUrl(resolveArtifactUrl(result.logUrl));
      if (result.assetsZipUrl) setAssetsZipUrl(resolveArtifactUrl(result.assetsZipUrl));
      setWarnings(result.warnings);
      if (targetFormat === "html" && !isBinarySource) {
        try {
          const res = await fetch(artUrl);
          if (res.ok) setPreviewHtml(await res.text());
        } catch {
          setPreviewHtml(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  const formatMatrixHint = useMemo(() => {
    if (!readFormats.length) return null;
    const row = readFormats.includes(sourceFormat);
    const canWrite = writeFormats.includes(targetFormat);
    if (row && canWrite) return null;
    return "Selected pair may be unsupported";
  }, [readFormats, writeFormats, sourceFormat, targetFormat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-[var(--muted)]">
            From
            <select
              value={sourceFormat}
              onChange={(e) => {
                setSourceFormat(e.target.value);
                setIsBinarySource(BINARY_FORMATS.has(e.target.value));
              }}
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              {(readFormats.length ? readFormats : [sourceFormat]).map((f) => (
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
              className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
            >
              {(writeFormats.length ? writeFormats : [targetFormat]).map((f) => (
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
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
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
                className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm"
              >
                <option value="katex">KaTeX</option>
                <option value="mathjax">MathJax</option>
                <option value="mathml">MathML</option>
                <option value="plain">Plain</option>
              </select>
            </label>
          )}
        </div>
        {formatMatrixHint && (
          <p className="mb-3 text-xs text-amber-700">{formatMatrixHint}</p>
        )}

        <SamplePicker
          samples={BUILTIN_SAMPLES}
          onSelect={(s) => {
            setContent(s.content);
            setSourceFormat(s.format);
            setIsBinarySource(false);
          }}
        />

        <FileDrop onFiles={(files) => void onFileDrop(files)}>
          <span>Drag & drop a file, or</span>
          <label className="cursor-pointer font-medium text-[var(--accent)]">
            browse
            <input
              type="file"
              className="hidden"
              accept=".md,.markdown,.html,.htm,.docx,.odt,.tex,.epub,.rst,.org,.adoc,.json"
              onChange={(e) => e.target.files && void onFileDrop(e.target.files)}
            />
          </label>
        </FileDrop>

        {showMonaco ? (
          <SourceEditor value={content} onChange={setContent} format={sourceFormat} />
        ) : (
          <p className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--muted)]">
            Binary source loaded ({sourceFormat}). Upload a new file to replace it.
          </p>
        )}

        <details className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
          <summary className="cursor-pointer font-medium">Advanced options</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={toc} onChange={(e) => setToc(e.target.checked)} />
              Table of contents
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={numberSections}
                onChange={(e) => setNumberSections(e.target.checked)}
              />
              Number sections
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Gallery template
              <select
                value={galleryTemplate}
                onChange={async (e) => {
                  const id = e.target.value;
                  setGalleryTemplate(id);
                  if (id) {
                    try {
                      await fetchTemplateContent(id);
                    } catch {
                      /* ignore */
                    }
                  }
                }}
                className="rounded border border-[var(--border)] px-2 py-1.5 text-sm"
              >
                <option value="">None</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)] sm:col-span-2">
              Custom template (paste)
              <textarea
                value={customTemplate}
                onChange={(e) => setCustomTemplate(e.target.value)}
                className="min-h-[50px] rounded border border-[var(--border)] p-2 font-mono text-xs"
                placeholder="Or paste a Pandoc template…"
              />
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
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Load sample BibTeX
              <button
                type="button"
                className="rounded border border-[var(--border)] bg-white px-2 py-1 text-left text-xs hover:border-[var(--accent)]"
                onClick={() => setBibContent(BIB_SAMPLE)}
              >
                Use references.bib sample
              </button>
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)] sm:col-span-2">
              BibTeX
              <textarea
                value={bibContent}
                onChange={(e) => setBibContent(e.target.value)}
                className="min-h-[60px] rounded border border-[var(--border)] p-2 font-mono text-xs"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              BibTeX file
              <input
                type="file"
                accept=".bib"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setBibContent(await f.text());
                }}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Filter (allowlisted)
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
              Reference DOCX / ODT
              <input
                type="file"
                accept=".docx,.odt"
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
                    next.push({ name: file.name, contentBase64: await fileToBase64(file) });
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
          className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
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

        {(artifactUrl || command || inspectData) && (
          <ResultTabs
            tabs={[
              {
                id: "preview",
                label: "Preview",
                content: previewHtml ? (
                  <iframe
                    title="Preview"
                    className="h-64 w-full rounded border border-[var(--border)] bg-white"
                    sandbox=""
                    srcDoc={previewHtml}
                  />
                ) : (
                  <p className="text-[var(--muted)]">
                    {targetFormat === "html"
                      ? "Convert to HTML to preview here."
                      : "Preview available for HTML output."}
                  </p>
                ),
              },
              {
                id: "download",
                label: "Download",
                content: (
                  <div className="flex flex-wrap gap-3">
                    {artifactUrl && (
                      <a
                        href={artifactUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:border-[var(--accent)]"
                      >
                        <Download className="h-4 w-4" />
                        Main output
                      </a>
                    )}
                    {assetsZipUrl && (
                      <a
                        href={assetsZipUrl}
                        download
                        className="text-sm text-[var(--accent)] hover:underline"
                      >
                        Assets ZIP
                      </a>
                    )}
                  </div>
                ),
              },
              {
                id: "command",
                label: "CLI command",
                content: (
                  <div>
                    <button
                      type="button"
                      onClick={() => void navigator.clipboard.writeText(command)}
                      className="mb-2 inline-flex items-center gap-1 text-xs text-[var(--accent)]"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                    <pre className="overflow-x-auto rounded bg-white p-3 text-xs">{command}</pre>
                    {warnings.length > 0 && (
                      <ul className="mt-2 text-xs text-amber-700">
                        {warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              },
              {
                id: "inspect",
                label: inspecting ? "Inspect…" : "Inspect",
                content: inspectData ? (
                  <div className="space-y-2 text-xs">
                    {inspectData.title && (
                      <p>
                        <strong>Title:</strong> {inspectData.title}
                      </p>
                    )}
                    <p>
                      <strong>Headings:</strong> {inspectData.headings.length}
                    </p>
                    <ul className="list-inside list-disc">
                      {inspectData.headings.slice(0, 12).map((h, i) => (
                        <li key={i}>
                          H{h.level}: {h.text}
                        </li>
                      ))}
                    </ul>
                    {inspectData.assets.length > 0 && (
                      <p>
                        <strong>Assets:</strong> {inspectData.assets.join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[var(--muted)]">No inspect data (binary sources skipped).</p>
                ),
              },
              {
                id: "log",
                label: "Log",
                content: logUrl ? (
                  <a href={logUrl} target="_blank" rel="noreferrer" className="text-[var(--accent)]">
                    Open conversion log
                  </a>
                ) : (
                  <span>—</span>
                ),
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
