import type { MetadataRoute } from "next";

const routes = [
  "",
  "/markdown-to-pdf",
  "/markdown-to-docx",
  "/markdown-to-epub",
  "/docx-to-markdown",
  "/latex-to-pdf",
  "/html-to-pdf",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
