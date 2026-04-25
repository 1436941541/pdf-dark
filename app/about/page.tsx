import type { Metadata } from "next";
import { LegalFrame } from "@/components/legal-frame";

export const metadata: Metadata = {
  title: "About — PDF Dark",
  description:
    "Why PDF Dark exists, how it's built, and who runs it. Indie tool, browser-side by default.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalFrame>
      <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
        <h1 className="text-3xl font-bold text-neutral-50 mb-8">
          About PDF Dark
        </h1>

        <p className="text-lg mb-8">
          PDF Dark is a free, browser-side tool for reading PDFs in dark mode.
        </p>

        <p className="mb-5">
          It started as personal frustration — reading long PDFs at night meant
          either staring at a white page or uploading the file to a service
          whose privacy I didn&apos;t fully trust. Neither was great. The
          &ldquo;invert colors&rdquo; options on existing tools also mangled
          photos and charts, turning graphs into noise and faces into X-rays.
        </p>

        <p className="mb-5">
          So PDF Dark was built around two non-negotiable defaults:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-6">
          <li>
            <strong className="text-neutral-100">
              Nothing leaves your browser.
            </strong>{" "}
            The file never touches a server — you can confirm it yourself in
            DevTools → Network.
          </li>
          <li>
            <strong className="text-neutral-100">
              Images keep their original colors.
            </strong>{" "}
            A saturation-based algorithm detects photos and figures and leaves
            them untouched while it darkens the rest.
          </li>
        </ul>
        <p>
          Everything else — the four themes, the downloadable dark PDF, the iOS
          Safari support — grew out of those two defaults.
        </p>

        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Who runs this
        </h2>
        <p>
          PDF Dark is built and maintained by an independent developer, not a
          company. There&apos;s no team, no investor, no upsell. If you spot a
          bug, need a new feature, or just want to say hi, email{" "}
          <a
            href="mailto:hello@pdfdark.org"
            className="text-amber-400 hover:underline"
          >
            hello@pdfdark.org
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          How it works under the hood
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-neutral-100">PDF rendering:</strong>{" "}
            Mozilla&apos;s PDF.js — the same open-source library Firefox uses
          </li>
          <li>
            <strong className="text-neutral-100">Dark-mode algorithm:</strong>{" "}
            pixel saturation classification, runs in a Web Worker so the UI
            never blocks
          </li>
          <li>
            <strong className="text-neutral-100">PDF assembly:</strong>{" "}
            pdf-lib, to stitch themed pages back into a downloadable file
          </li>
          <li>
            <strong className="text-neutral-100">Hosting:</strong> Vercel
          </li>
          <li>
            <strong className="text-neutral-100">Error monitoring:</strong>{" "}
            Sentry, activated only when something actually breaks — with all
            content masked so the replay never captures your PDF
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Open source
        </h2>
        <p>
          PDF Dark is open source under the MIT license. The full codebase —
          including the saturation algorithm, Web Worker logic, and the Sentry
          masking config — lives at{" "}
          <a
            href="https://github.com/1436941541/pdf-dark"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            github.com/1436941541/pdf-dark
          </a>
          . The &ldquo;your file never leaves your browser&rdquo; promise is
          something you can verify line by line, not just take on trust.
        </p>

        <h2 className="text-xl font-semibold text-neutral-50 mt-12 mb-4">
          Why it&apos;s free
        </h2>
        <p>
          Right now, nothing — PDF Dark runs on free-tier hosting and costs me
          very little to keep online. If usage grows enough that it stops being
          free, the most likely next step is a small, unobtrusive ad on the
          landing page (never inside the PDF viewer). There will never be a
          paywall on the conversion itself.
        </p>
      </article>
    </LegalFrame>
  );
}
