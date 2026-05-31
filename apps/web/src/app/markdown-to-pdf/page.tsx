import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { TopBar } from "@/components/TopBar";

export const metadata = {
  title: "Markdown to PDF — Pandoc Online",
  description: "Convert Markdown to PDF online with Pandoc. Choose xelatex, lualatex, pdflatex, wkhtmltopdf or Typst.",
};

export default function MarkdownToPdfPage() {
  return (
    <>
      <TopBar />
      <SeoBar
        title="Markdown to PDF — free online converter"
        description="Paste or upload Markdown and download a PDF using Pandoc with your choice of LaTeX or Typst engine."
      />
      <main className="flex-1">
        <Converter defaultSource="markdown" defaultTarget="pdf" />
      </main>
      <Footer />
    </>
  );
}
