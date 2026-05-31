export type MathEngine = "katex" | "mathjax" | "mathml" | "plain";
export type PdfEngine = "xelatex" | "lualatex" | "pdflatex" | "wkhtmltopdf" | "typst";

export interface ConvertSource {
  format: string;
  content: string;
}

export interface ConvertTarget {
  format: string;
  engine?: string;
}

export interface CitationOptions {
  bib: string;
  cslStyle: string;
}

export interface ConvertOptions {
  template?: string;
  referenceDoc?: string;
  citations?: CitationOptions;
  math?: MathEngine;
  pdfEngine?: PdfEngine;
  filters?: string[];
  toc?: boolean;
  numberSections?: boolean;
}

export interface ConvertAsset {
  name: string;
  contentBase64: string;
}

export interface ConvertJob {
  source: ConvertSource;
  target: ConvertTarget;
  options?: ConvertOptions;
  assets?: ConvertAsset[];
}

export interface ConvertResult {
  artifactUrl: string;
  logUrl: string;
  assetsZipUrl?: string;
  jobId: string;
  command: string;
  artifactName: string;
  warnings: string[];
}

export interface InspectResult {
  format: string;
  title?: string;
  headings: { level: number; text: string }[];
  assets: string[];
}

export interface FormatCapability {
  read: string;
  write: string[];
}

export const SUPPORTED_READ_FORMATS = [
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
] as const;

export const SUPPORTED_WRITE_FORMATS = [
  ...SUPPORTED_READ_FORMATS,
  "pdf",
] as const;

export const CSL_STYLES = ["apa", "chicago-author-date", "ieee", "nature", "vancouver"] as const;

export const ALLOWED_FILTERS = ["pagebreak"] as const;
