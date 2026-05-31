export interface SampleItem {
  id: string;
  label: string;
  format: string;
  content: string;
}

export function SamplePicker({
  samples,
  onSelect,
}: {
  samples: SampleItem[];
  onSelect: (sample: SampleItem) => void;
}) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <span className="w-full text-xs font-medium text-[var(--muted,#737373)]">Samples</span>
      {samples.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s)}
          className="rounded-full border border-[var(--border,#e5e5e5)] bg-white px-3 py-1 text-xs transition hover:border-[var(--accent,#2563eb)] hover:text-[var(--accent,#2563eb)]"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
