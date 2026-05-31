"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-[var(--border)] bg-white text-sm text-[var(--muted)]">
      Loading editor…
    </div>
  ),
});

const LANG_MAP: Record<string, string> = {
  markdown: "markdown",
  gfm: "markdown",
  commonmark: "markdown",
  html: "html",
  latex: "latex",
  json: "json",
  rst: "restructuredtext",
  org: "plaintext",
  asciidoc: "plaintext",
};

export function SourceEditor({
  value,
  onChange,
  format,
}: {
  value: string;
  onChange: (value: string) => void;
  format: string;
}) {
  const language = LANG_MAP[format] ?? "plaintext";

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)]">
      <MonacoEditor
        height="280px"
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
