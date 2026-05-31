import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { TopBar } from "@/components/TopBar";

export const metadata = { title: "HTML to PDF — Pandoc Online" };

export default function Page() {
  return (
    <>
      <TopBar />
      <SeoBar
        title="HTML to PDF"
        description="Convert HTML to PDF using wkhtmltopdf or LaTeX engines via Pandoc."
      />
      <main className="flex-1">
        <Converter defaultSource="html" defaultTarget="pdf" />
      </main>
      <Footer />
    </>
  );
}
