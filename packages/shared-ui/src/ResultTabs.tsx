"use client";

import { useState } from "react";

export type ResultTab = "preview" | "download" | "command" | "inspect" | "log";

export function ResultTabs({
  tabs,
}: {
  tabs: { id: ResultTab; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState<ResultTab>(tabs[0]?.id ?? "download");
  const current = tabs.find((t) => t.id === active);

  return (
    <div className="mt-6 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--background,#fafafa)] p-4">
      <div className="mb-3 flex flex-wrap gap-2 border-b border-[var(--border,#e5e5e5)] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              active === t.id
                ? "bg-[var(--accent,#2563eb)] text-white"
                : "text-[var(--muted,#737373)] hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="text-sm">{current?.content}</div>
    </div>
  );
}
