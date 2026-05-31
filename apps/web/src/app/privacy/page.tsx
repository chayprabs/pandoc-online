import { Footer } from "@/components/Footer";
import { TopBar } from "@/components/TopBar";

export const metadata = {
  title: "Privacy Policy — Pandoc Online",
};

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Privacy Policy</h1>
        <div className="prose prose-sm max-w-none space-y-4 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            <strong>Last updated:</strong> May 31, 2026
          </p>
          <p>
            Pandoc Online (&quot;we&quot;, &quot;the service&quot;) is operated by Chaitanya Prabuddha. This policy
            explains how we handle information when you use our document conversion tool.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">What we collect</h2>
          <p>
            When you convert a document, your source content is sent to our server only for the
            purpose of processing the conversion. We do not require an account. We do not sell your
            data. We do not use third-party advertising or tracking scripts on this site.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Retention</h2>
          <p>
            Uploaded content and conversion outputs are stored in ephemeral job directories on the
            server and are automatically deleted after a short time-to-live (typically within one
            hour). Do not use this service for highly sensitive or regulated data unless you
            self-host the software under your own security controls.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Logs</h2>
          <p>
            Server logs may record request metadata (timestamps, status codes, approximate size) but
            we design the system not to persist full document contents in long-term logs.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Self-hosting</h2>
          <p>
            This project is open source under AGPL-3.0. You may run your own instance; in that case
            the operator of that instance is responsible for privacy practices.
          </p>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Contact</h2>
          <p>
            Questions:{" "}
            <a href="https://www.chaitanyaprabuddha.com" className="text-[var(--accent)]">
              chaitanyaprabuddha.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
