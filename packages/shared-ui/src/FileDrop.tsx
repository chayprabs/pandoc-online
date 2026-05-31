import { FileUp } from "lucide-react";
import type { ReactNode } from "react";

export function FileDrop({
  onFiles,
  children,
}: {
  onFiles: (files: FileList) => void;
  children?: ReactNode;
}) {
  return (
    <div
      className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border,#e5e5e5)] bg-[var(--background,#fff)] px-4 py-3 text-sm text-[var(--muted,#737373)] transition hover:border-[var(--accent,#2563eb)]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
    >
      <FileUp className="h-4 w-4" />
      {children ?? (
        <>
          <span>Drag & drop a file, or</span>
          <label className="cursor-pointer font-medium text-[var(--accent,#2563eb)]">
            browse
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && onFiles(e.target.files)}
            />
          </label>
        </>
      )}
    </div>
  );
}
