import { termsSections } from "@/content/legal-sections";
import { LegalDocument } from "@/components/LegalDocument";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";

export const metadata = {
  title: "Terms & Conditions — Pandoc Online",
  description:
    "Terms of use, disclaimers, limitation of liability, indemnification, and governing law for Pandoc Online.",
};

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <LegalDocument
        title="Terms & Conditions"
        intro={
          <>
            By accessing or using Pandoc Online you agree to these Terms and our{" "}
            <a href="/privacy" className="font-medium text-[var(--accent)] underline">
              Privacy Policy
            </a>
            . If you do not agree, do not use the service.
          </>
        }
        sections={termsSections}
        footerNote="Repository legal copies: see legal/TERMS.md and legal/PRIVACY.md on GitHub. Full software license: LICENSE (AGPL-3.0)."
      />
      <Footer />
    </>
  );
}
