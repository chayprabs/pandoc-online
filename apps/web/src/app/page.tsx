import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { SeoBar } from "@/components/SeoBar";
import { SeoNav } from "@/components/SeoNav";
import { TopBar } from "@/components/TopBar";

export default function HomePage() {
  return (
    <>
      <TopBar />
      <SeoBar />
      <SeoNav />
      <main className="flex-1">
        <Converter />
      </main>
      <Footer />
    </>
  );
}
