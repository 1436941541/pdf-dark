import type { Metadata } from "next";
import { LegalFrame } from "@/components/legal-frame";

export const metadata: Metadata = {
  title: "Privacy — PDF Dark",
  description:
    "Your PDF files never leave your browser. No accounts, no analytics cookies, no tracking. Here's exactly what we do and don't collect.",
};

export default function PrivacyPage() {
  return (
    <LegalFrame>
      <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Privacy</h1>
        <p className="text-sm text-neutral-500 mb-10">
          Last updated: April 24, 2026
        </p>

        <p className="text-lg mb-8">
          PDF Dark is built around one simple promise:{" "}
          <strong className="text-amber-400">
            your PDF file never leaves your browser.
          </strong>{" "}
          No accounts, no tracking cookies, no analytics profiles. The details
          below cover exactly what does and doesn&apos;t happen on this site.
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
            We don&apos;t run Google Analytics, Microsoft Clarity, Facebook
            Pixel, or any other behavioural analytics.
          </li>
          <li>We don&apos;t set tracking cookies.</li>
          <li>
            We don&apos;t collect your email. There&apos;s no signup, no
            account.
          </li>
          <li>
            We don&apos;t read your PDF file name, content, or any text
            extracted from it — none of that reaches any server.
          </li>
          <li>We don&apos;t sell data. There&apos;s no data to sell.</li>
        </ul>

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
          If this ever changes — for example, if we add ads to keep the tool
          free — we&apos;ll update this page first, bump the &ldquo;Last
          updated&rdquo; date above, and disclose what changed before the new
          code ships.
        </p>

        {/* Contact */}
        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Questions or data requests
        </h2>
        <p>
          Since we don&apos;t have accounts or profiles, there&apos;s almost
          nothing tied to you personally — the only traces are short-term
          Vercel access logs and (if something crashes) a masked Sentry error
          report. If you still want to check, correct, or delete anything
          under GDPR / UK / CCPA, or just have a question, email{" "}
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
