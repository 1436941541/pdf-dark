import type { Metadata } from "next";
import { LegalFrame } from "@/components/legal-frame";

export const metadata: Metadata = {
  title: "Privacy — PDF Dark",
  description:
    "Your PDF file never leaves your browser. No accounts, no signup. Here's exactly what we do and don't collect on the site itself, including analytics and ads.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalFrame>
      <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Privacy</h1>
        <p className="text-sm text-neutral-500 mb-10">
          Last updated: June 19, 2026
        </p>

        <p className="text-lg mb-8">
          PDF Dark is built around one core promise:{" "}
          <strong className="text-amber-400">
            your PDF file never leaves your browser.
          </strong>{" "}
          The file you drop in — its name, content, text, and images — stays
          on your device. The site itself (this page, page-view analytics,
          and the ads we may show to keep the tool free) works like any
          normal free utility — details below.
        </p>

        {/* Core promise */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Your PDF is processed locally
        </h2>
        <p className="mb-4">
          When you drop a PDF onto this page, the entire conversion happens
          inside your browser:
        </p>
        <ol className="space-y-2 list-decimal pl-6 text-neutral-300 mb-4">
          <li>Your browser reads the file locally via the File API.</li>
          <li>PDF.js parses and renders each page to a canvas.</li>
          <li>
            Our dark-mode algorithm runs in a Web Worker — still inside your
            browser.
          </li>
          <li>
            On <em>Download</em>, your browser assembles the themed PDF and
            saves it locally.
          </li>
        </ol>
        <p>
          At no point is your PDF uploaded to a server. You can verify this by
          opening the browser&apos;s Network tab during use — you&apos;ll see
          no file upload request. The file name, content, text, and images
          inside the PDF all stay on your device.
        </p>

        {/* What we don't do */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          What we do <em>not</em> do
        </h2>
        <ul className="space-y-2 list-disc pl-6 text-neutral-300">
          <li>
            We don&apos;t upload, store, or read your PDF file — name, content,
            and extracted text all stay on your device.
          </li>
          <li>
            We don&apos;t ask for your email, log you in, or build a long-term
            profile tied to you.
          </li>
          <li>
            We don&apos;t correlate the file you converted with anything else
            — not with the analytics events, not with the ads, not with any
            third party. Your file is processed locally and forgotten.
          </li>
          <li>
            We don&apos;t sell your data. We don&apos;t have a database of
            user data to sell.
          </li>
        </ul>

        {/* Site analytics */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Site analytics
        </h2>
        <p className="mb-4">
          To understand which pages people find useful and where the site is
          slow or broken, we run two analytics tools — both on the site
          itself, never on your PDF file:
        </p>
        <ul className="space-y-2 list-disc pl-6 text-neutral-300 mb-4">
          <li>
            <strong className="text-neutral-100">Google Analytics 4</strong>{" "}
            — aggregate page views, referrers, country, device type. IP
            addresses are anonymized by GA4 by default and not stored.
          </li>
          <li>
            <strong className="text-neutral-100">Microsoft Clarity</strong>{" "}
            — anonymous heatmaps and session recordings of how people
            interact with the page (clicks, scrolls). Clarity masks text and
            inputs by default, so the content of your PDF and any text you
            type are not captured.
          </li>
        </ul>
        <p>
          Neither tool sees your PDF file. If you&apos;d rather not be counted,
          a browser-level tracker blocker (uBlock Origin, Brave Shields, etc.)
          will block both.
        </p>

        {/* Ads */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Ads
        </h2>
        <p className="mb-4">
          PDF Dark is free and runs on a paid hosting bill, so we plan to
          show display ads on the site to cover costs. We&apos;ll likely use
          Google AdSense (the standard publisher network), which means:
        </p>
        <ul className="space-y-2 list-disc pl-6 text-neutral-300 mb-4">
          <li>
            Ads appear <em>on the site</em>, in clearly marked slots — never
            inside the PDF you download, and never on top of the converter
            in a way that gets in the way of the tool.
          </li>
          <li>
            Like all AdSense placements, ads may use cookies for frequency
            capping, fraud prevention, and basic targeting. You can opt out
            of personalized ads at{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Google&apos;s Ad Settings
            </a>
            , or block them entirely with a tracker blocker.
          </li>
          <li>
            Ad networks do not receive your PDF file or anything extracted
            from it — your file never leaves your browser, so there&apos;s
            nothing to send.
          </li>
        </ul>
        <p>
          When ads go live, we&apos;ll bump the &ldquo;Last updated&rdquo;
          date and list the exact networks here so you know what cookies to
          expect.
        </p>

        {/* Error monitoring */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Error monitoring
        </h2>
        <p className="mb-4">
          To catch bugs we&apos;d otherwise never hear about, we run{" "}
          <strong className="text-neutral-100">Sentry</strong> for error
          monitoring. Sentry only activates when something actually breaks
          (e.g. a PDF fails to parse, the Web Worker crashes). It then sends:
        </p>
        <ul className="space-y-2 list-disc pl-6 text-neutral-300 mb-4">
          <li>The JavaScript stack trace of the error</li>
          <li>Browser and operating system version</li>
          <li>A short, <strong>masked</strong> session replay of the failure
            — text, inputs, and the rendered PDF are all hidden so the replay
            shows structure but not content
          </li>
        </ul>
        <p>
          No cookies are set. No data is sent for users who don&apos;t
          encounter an error. IP addresses are not stored. Data is processed
          by Sentry per their{" "}
          <a
            href="https://sentry.io/privacy/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            privacy policy
          </a>
          .
        </p>

        {/* Hosting */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Hosting
        </h2>
        <p>
          This site runs on Vercel. Like any web host, Vercel keeps short-term
          HTTP access logs (IP address, URL, user agent) needed to serve the
          site and absorb attacks. These logs are not used for analytics or
          profiling and are handled per{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            Vercel&apos;s privacy policy
          </a>
          .
        </p>

        {/* Changes */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Changes
        </h2>
        <p>
          If anything material changes — a new analytics or ad network, a new
          third-party script, anything that touches the &ldquo;your file
          never leaves your browser&rdquo; promise — we&apos;ll update this
          page first, bump the &ldquo;Last updated&rdquo; date above, and
          disclose what changed before the new code ships.
        </p>

        {/* Contact */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Questions or data requests
        </h2>
        <p>
          Since we don&apos;t have accounts or profiles, there&apos;s almost
          nothing tied to you personally — the traces we have are aggregate
          Google Analytics and Clarity events, ad-network cookies (once ads
          are live), short-term Vercel access logs, and (if something
          crashes) a masked Sentry error report. If you want to check,
          correct, or delete anything under GDPR / UK / CCPA, or just have a
          question, email{" "}
          <a
            href="mailto:hello@pdfdark.org"
            className="text-amber-400 hover:underline"
          >
            hello@pdfdark.org
          </a>
          .
        </p>
      </article>
    </LegalFrame>
  );
}
