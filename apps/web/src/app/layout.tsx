import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pandoc Online — Convert Markdown, DOCX, HTML, LaTeX, EPUB & PDF",
  description:
    "Convert Markdown, DOCX, HTML, LaTeX, EPUB and PDF online via Pandoc with templates, citations, filters and math support.",
  keywords: [
    "pandoc",
    "markdown",
    "docx",
    "latex",
    "epub",
    "html-to-pdf",
    "markdown-to-pdf",
    "document-conversion",
    "online-tool",
  ],
  openGraph: {
    title: "Pandoc Online",
    description:
      "Free online Pandoc document converter with templates, citations, filters and math.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
