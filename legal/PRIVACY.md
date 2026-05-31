# Privacy Policy — Pandoc Online

**Last updated:** 7 March 2026  
**Operator:** Chaitanya Prabuddha  
**Contact:** https://www.chaitanyaprabuddha.com

This Privacy Policy explains how we handle information when you use the **Pandoc Online** website and conversion API (the "Service").

---

## 1. Summary

- We do **not** require an account.
- We do **not** sell your personal information.
- We do **not** use advertising trackers or third-party analytics pixels on the core playground.
- Document content is processed **only to perform conversions** and is kept **briefly**, then deleted (see Retention).

## 2. Who we are (data controller)

For the public instance operated by Chaitanya Prabuddha, the data controller is:

**Chaitanya Prabuddha**  
Website: https://www.chaitanyaprabuddha.com

If you self-host the open-source software, **you** are the controller for your instance.

## 3. What we process

| Data | Purpose | Legal basis (GDPR-style) |
|------|---------|----------------------------|
| Document content you submit | Perform conversion | Performance of the service you request |
| Uploaded assets (images, .bib, etc.) | Included in conversion | Performance of the service |
| Technical metadata (IP address, timestamps, request size, HTTP status) | Security, abuse prevention, operations | Legitimate interests / legal obligation |
| Browser type (standard HTTP headers) | Compatibility, security | Legitimate interests |

We do **not** intentionally collect special categories of data (e.g. health, biometric, children's data). **Do not submit** such data unless you accept the risks of online processing.

## 4. What we do not do

- No sale of personal information (including under CPRA/CCPA definitions).
- No targeted advertising based on your documents.
- No profiling for marketing.
- No requirement to create an account.

## 5. Retention

- Conversion jobs are stored in **ephemeral directories** on the server.
- Jobs are automatically deleted after a short **time-to-live** (typically **within one hour**), subject to operational configuration (`JOB_TTL_SECONDS`).
- Server logs may retain **metadata** (not full document bodies by design) for a limited period for security and debugging, then rotate.

## 6. Location and international transfers

Servers may be located outside your country. Where required, we rely on your use of the Service as necessary to provide the requested conversion, and appropriate safeguards available to us. If you need EU/UK Standard Contractual Clauses for enterprise use, **self-host** the software in your region.

## 7. Sharing with third parties

We do **not** share document content with advertisers. We may share metadata with:

- **Infrastructure providers** (hosting, CDN) strictly to operate the Service;
- **Authorities** if required by valid legal process.

The Service runs **Pandoc and related tools on our servers**; those are not separate "recipients" of your data for marketing—they process data under our direction for conversion only.

## 8. Security

We use technical measures including ephemeral storage, filter allowlists, disabled `--shell-escape`, and TLS in production. No method is 100% secure. Use self-hosting for stricter control.

## 9. Your rights

Depending on your location, you may have rights to **access**, **rectify**, **erase**, **restrict**, **object**, or **port** personal data, and to **withdraw consent** where processing is consent-based.

Because we do not use accounts, we may not be able to identify your job after TTL deletion. To exercise rights, contact us with the **approximate time** of your request and relevant details.

| Region | Notes |
|--------|--------|
| **EEA / UK / CH** | Rights under GDPR/UK GDPR; complain to your supervisory authority |
| **California (US)** | Rights under CCPA/CPRA; we do not sell personal information |
| **India** | Rights under applicable Indian law including DPDP Act where applicable |
| **Other** | We honor applicable mandatory local rights |

We will respond within timeframes required by law (often 30 days).

## 10. Children

The Service is not directed at children under **16**. We do not knowingly collect children's data. Contact us to request deletion if you believe a child submitted content.

## 11. Cookies and local storage

The playground may use **strictly necessary** technical storage (e.g. session-related behavior). We do not use third-party advertising cookies on the core tool. Your browser may store preferences locally.

## 12. Open-source and self-hosting

Source code is available under AGPL-3.0. If you run your own copy, you are responsible for privacy compliance for your users.

## 13. Changes

We may update this policy. The "Last updated" date will change. Material changes may be noted on the site.

## 14. Contact

Privacy questions: https://www.chaitanyaprabuddha.com  
Security issues: https://github.com/chayprabs/pandoc-online/security/advisories/new

---

*This policy is not legal advice.*
