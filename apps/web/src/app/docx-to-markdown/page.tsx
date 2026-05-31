import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { TopBar } from "@/components/TopBar";

export const metadata = { title: "DOCX to Markdown — Pandoc Online" };

export default function Page() {
  return (
    <>
      <TopBar />
      <SeoBar title="DOCX to Markdown" description="Upload Word documents and export clean Markdown." />
      <main className="flex-1">
        <Converter defaultSource="docx" defaultTarget="markdown" />
      </main>
      <Footer />
    </>
  );
}
