import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { TopBar } from "@/components/TopBar";

export const metadata = { title: "LaTeX to PDF — Pandoc Online" };

export default function Page() {
  return (
    <>
      <TopBar />
      <SeoBar title="LaTeX to PDF" description="Compile LaTeX sources to PDF with your preferred engine." />
      <main className="flex-1">
        <Converter defaultSource="latex" defaultTarget="pdf" />
      </main>
      <Footer />
    </>
  );
}
