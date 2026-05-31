/** Shared legal copy — mirrors /legal/*.md in the repository. */

import type { ReactNode } from "react";

export const LEGAL_LAST_UPDATED = "7 March 2026";

export const privacySections: { title: string; body: ReactNode }[] = [
  {
    title: "Summary",
    body: (
      <>
        We do not require an account, do not sell your personal information, and do not use
        advertising trackers on the core playground. Document content is processed only to perform
        conversions and is deleted after a short retention period (typically within one hour).
      </>
    ),
  },
  {
    title: "Data controller",
    body: (
      <>
        For this public instance, the controller is <strong>Chaitanya Prabuddha</strong> (
        <a href="https://www.chaitanyaprabuddha.com" className="text-[var(--accent)]">
          chaitanyaprabuddha.com
        </a>
        ). If you self-host the open-source software, you are the controller for your instance.
      </>
    ),
  },
  {
    title: "What we process",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Document content and attachments</strong> — to run the conversion you request.
        </li>
        <li>
          <strong>Technical metadata</strong> (IP address, timestamps, request size, errors) — for
          security and operations.
        </li>
        <li>
          <strong>HTTP headers</strong> — standard browser/server information.
        </li>
      </ul>
    ),
  },
  {
    title: "What we do not do",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>No sale of personal information (including under CPRA/CCPA).</li>
        <li>No targeted advertising based on your documents.</li>
        <li>No account required.</li>
      </ul>
    ),
  },
  {
    title: "Retention",
    body: (
      <>
        Jobs are stored in ephemeral directories and automatically removed after a configured
        time-to-live (typically within one hour). Server logs may retain metadata for a limited
        period, not full document bodies by design.
      </>
    ),
  },
  {
    title: "International transfers",
    body: (
      <>
        Servers may be located outside your country. Where required, processing is necessary to
        provide the service you request. For strict regional requirements, self-host the software
        in your jurisdiction.
      </>
    ),
  },
  {
    title: "Sharing",
    body: (
      <>
        We do not share document content with advertisers. We may use infrastructure providers to
        host the service and disclose information if required by valid legal process.
      </>
    ),
  },
  {
    title: "Security",
    body: (
      <>
        We use ephemeral storage, allowlisted filters, disabled shell-escape, and TLS in
        production. No method is perfectly secure—do not submit highly sensitive data unless you
        accept the risk or self-host.
      </>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        Depending on your location (EEA/UK, California, India, and elsewhere), you may have rights
        to access, delete, correct, restrict, or object to processing, and to complain to a
        regulator. Because we do not use accounts, we may be unable to identify jobs after TTL
        deletion—contact us with the approximate time of use.
      </>
    ),
  },
  {
    title: "Children",
    body: (
      <>
        Not directed at children under 16. We do not knowingly collect children&apos;s data.
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <>
        Strictly necessary technical cookies/storage only. No third-party ad cookies on the core
        tool.
      </>
    ),
  },
  {
    title: "Changes & contact",
    body: (
      <>
        We may update this policy; the date above will change. Questions:{" "}
        <a href="https://www.chaitanyaprabuddha.com" className="text-[var(--accent)]">
          chaitanyaprabuddha.com
        </a>
        . Security:{" "}
        <a
          href="https://github.com/chayprabs/pandoc-online/security/advisories/new"
          className="text-[var(--accent)]"
        >
          GitHub Security Advisories
        </a>
        .
      </>
    ),
  },
];

export const termsSections: { title: string; body: ReactNode }[] = [
  {
    title: "Agreement",
    body: (
      <>
        <strong>Important:</strong> By using Pandoc Online you agree to these Terms. If you do not
        agree, do not use the service.
      </>
    ),
  },
  {
    title: "The service",
    body: (
      <>
        Free browser-based document conversion using server-side open-source tools. We may change,
        suspend, or discontinue the service at any time.
      </>
    ),
  },
  {
    title: "No professional advice",
    body: (
      <>
        Automated conversion only—not legal, medical, financial, or publishing advice. You must
        review all outputs before reliance or distribution.
      </>
    ),
  },
  {
    title: "Eligibility",
    body: (
      <>
        You must be at least 16 (or higher age of consent in your country). If you act for an
        organization, you represent you have authority to bind it.
      </>
    ),
  },
  {
    title: "Your content",
    body: (
      <>
        You retain ownership. You grant us a limited license to process content solely to provide
        the requested conversion. You warrant you have all necessary rights and that your content
        is lawful. You are solely responsible for outputs and their use.
      </>
    ),
  },
  {
    title: "Acceptable use",
    body: (
      <>
        No abuse, malware, illegal content, sandbox exploitation, or automated scraping that harms
        others. We may block access or report violations.
      </>
    ),
  },
  {
    title: 'Disclaimer — "AS IS"',
    body: (
      <>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE AND ALL OUTPUTS ARE PROVIDED &quot;AS
        IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
        INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY,
        OR UNINTERRUPTED OPERATION. Conversions may fail or lose formatting, citations, or layout.
      </>
    ),
  },
  {
    title: "Third-party software",
    body: (
      <>
        We use Pandoc, LaTeX, wkhtmltopdf, Typst, and other third-party programs. We are not
        responsible for their behavior or licenses.
      </>
    ),
  },
  {
    title: "Limitation of liability",
    body: (
      <>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND CONTRIBUTORS SHALL NOT BE LIABLE FOR
        INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA,
        OR GOODWILL. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF{" "}
        <strong>USD $100</strong> OR AMOUNTS YOU PAID US IN THE PRIOR 12 MONTHS (TYPICALLY ZERO).
        Some jurisdictions do not allow certain limits; liability is limited to the fullest extent
        still permitted.
      </>
    ),
  },
  {
    title: "Indemnification",
    body: (
      <>
        You agree to defend, indemnify, and hold harmless Chaitanya Prabuddha and contributors from
        claims arising from your content, your use of the service, your violation of these Terms
        or law, or infringement of third-party rights.
      </>
    ),
  },
  {
    title: "Release",
    body: (
      <>
        To the extent permitted by law, you release us from claims related to use of the service,
        including conversion quality and downtime, subject to non-waivable rights in your
        jurisdiction.
      </>
    ),
  },
  {
    title: "Intellectual property",
    body: (
      <>
        Source code is licensed under{" "}
        <a href="https://www.gnu.org/licenses/agpl-3.0.html" className="text-[var(--accent)]">
          GNU AGPL-3.0
        </a>
        . Hosted use does not transfer ownership of branding or infrastructure.
      </>
    ),
  },
  {
    title: "Copyright complaints",
    body: (
      <>
        For alleged infringement, contact us with identification of the work, the material,
        your contact details, a good-faith statement, and signature. We may remove content and
        terminate repeat infringers.
      </>
    ),
  },
  {
    title: "Export and international use",
    body: (
      <>
        You are responsible for compliance with laws in your country and export-control rules.
      </>
    ),
  },
  {
    title: "Governing law & disputes",
    body: (
      <>
        Governed by the <strong>laws of India</strong>, without regard to conflict-of-law rules,
        except where mandatory consumer protections in your country require otherwise. Disputes
        shall be brought in <strong>courts in India</strong> with competent jurisdiction, subject to
        your mandatory local forum rights. Contact us first to try informal resolution for 30 days.
      </>
    ),
  },
  {
    title: "Changes",
    body: (
      <>
        We may update these Terms. Continued use after the updated date constitutes acceptance.
      </>
    ),
  },
  {
    title: "Contact",
    body: (
      <>
        Chaitanya Prabuddha —{" "}
        <a href="https://www.chaitanyaprabuddha.com" className="text-[var(--accent)]">
          chaitanyaprabuddha.com
        </a>
        {" · "}
        <a
          href="https://github.com/chayprabs/pandoc-online"
          className="text-[var(--accent)]"
        >
          GitHub
        </a>
      </>
    ),
  },
];
