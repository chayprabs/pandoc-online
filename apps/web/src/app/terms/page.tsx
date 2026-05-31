import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";

export const metadata = {
  title: "Terms & Conditions — Pandoc Online",
};

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Terms &amp; Conditions</h1>
        <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            <strong>Last updated:</strong> May 31, 2026
          </p>
          <p>
            By using Pandoc Online you agree to these terms. If you do not agree, do not use the
            service.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Service provided &quot;as is&quot;</h2>
          <p>
            The service is provided without warranties of any kind, express or implied, including
            merchantability, fitness for a particular purpose, or non-infringement. Conversions may
            fail, produce unexpected formatting, or be unavailable due to maintenance.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Your content</h2>
          <p>
            You retain ownership of documents you submit. You represent that you have the right to
            submit the content and that it does not violate applicable law or third-party rights.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Acceptable use</h2>
          <p>
            You may not use the service to process malware, illegal material, or content that
            attempts to exploit the conversion sandbox. Automated abuse that degrades service for
            others is prohibited.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Chaitanya Prabuddha and contributors shall not
            be liable for any indirect, incidental, special, consequential, or punitive damages, or
            any loss of profits, data, or goodwill arising from your use of the service.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Open source</h2>
          <p>
            Software is licensed under AGPL-3.0. Hosted use of this public instance does not grant
            additional rights beyond those in the license and these terms.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Changes</h2>
          <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
