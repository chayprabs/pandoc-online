import { privacySections } from "@/content/legal-sections";
import { LegalDocument } from "@/components/LegalDocument";
import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";

export const metadata = {
  title: "Privacy Policy — Pandoc Online",
  description:
    "How Pandoc Online handles your documents, retention, international rights, and contact information.",
};

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <LegalDocument
        title="Privacy Policy"
        intro={
          <>
            This policy describes how Chaitanya Prabuddha operates the Pandoc Online conversion
            service. It is designed to meet common transparency expectations worldwide (including
            GDPR-style rights, California privacy rights, and Indian data-protection principles).
          </>
        }
        sections={privacySections}
        footerNote="This policy is not legal advice. For enterprise or regulated workloads, consider self-hosting under your own compliance program."
      />
      <Footer />
    </>
  );
}
