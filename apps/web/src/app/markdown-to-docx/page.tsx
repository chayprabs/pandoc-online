import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { TopBar } from "@/components/TopBar";

export const metadata = {
  title: "Markdown to DOCX — Pandoc Online",
};

export default function Page() {
  return (
    <>
      <TopBar />
      <SeoBar title="Markdown to DOCX" description="Convert Markdown to Microsoft Word with optional reference styling." />
      <main className="flex-1">
        <Converter defaultSource="markdown" defaultTarget="docx" />
      </main>
      <Footer />
    </>
  );
}
