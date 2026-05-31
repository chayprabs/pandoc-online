import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { TopBar } from "@/components/TopBar";

export const metadata = { title: "Markdown to EPUB — Pandoc Online" };

export default function Page() {
  return (
    <>
      <TopBar />
      <SeoBar title="Markdown to EPUB" description="Turn Markdown manuscripts into EPUB ebooks with Pandoc." />
      <main className="flex-1">
        <Converter defaultSource="markdown" defaultTarget="epub" />
      </main>
      <Footer />
    </>
  );
}
