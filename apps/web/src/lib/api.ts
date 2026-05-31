import type { ConvertJob, ConvertResult, InspectResult } from "@pandoc-online/shared-types";

const API_BASE = typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080" : "/api";

export async function convertDocument(job: ConvertJob): Promise<ConvertResult> {
  const response = await fetch(`${API_BASE}/v1/convert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: job.source,
      target: job.target,
      options: job.options,
      assets: job.assets,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail ?? `Conversion failed (${response.status})`);
  }
  const data = await response.json();
  return {
    artifactUrl: data.artifactUrl ?? data.artifact_url,
    logUrl: data.logUrl ?? data.log_url,
    command: data.command,
    artifactName: data.artifactName ?? data.artifact_name,
    warnings: data.warnings ?? [],
  };
}

export async function inspectDocument(
  content: string,
  format: string,
): Promise<InspectResult> {
  const response = await fetch(`${API_BASE}/v1/inspect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: { format, content } }),
  });
  if (!response.ok) {
    throw new Error("Inspect failed");
  }
  return response.json();
}

export async function fetchFormats(): Promise<{ read: string; write: string[] }[]> {
  const response = await fetch(`${API_BASE}/v1/formats`);
  if (!response.ok) return [];
  const data = await response.json();
  return data.formats ?? [];
}

export function resolveArtifactUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}
