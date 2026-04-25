import type { Metadata } from "next";
import { LegalFrame } from "@/components/legal-frame";

export const metadata: Metadata = {
  title: "Terms — PDF Dark",
  description:
    "The short, plain-English terms of using PDF Dark. Use it freely, but at your own risk — no warranty, no liability.",
};

export default function TermsPage() {
  return (
    <LegalFrame>
      <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Terms</h1>
        <p className="text-sm text-neutral-500 mb-10">
          Last updated: April 24, 2026
        </p>

        <p className="text-lg mb-8">
          PDF Dark is a free tool provided{" "}
          <strong className="text-neutral-50">as-is</strong>. No warranty, no
          guarantees, no liability. By using it, you agree to the following:
        </p>

        <ol className="space-y-6 list-decimal pl-6">
          <li>
            <strong className="text-neutral-100">It&apos;s yours to use.</strong>
            <p className="mt-1 text-neutral-400">
              Personal or commercial, any project, any volume. No restrictions on
              the files you produce with it.
            </p>
          </li>
          <li>
            <strong className="text-neutral-100">
              You bring your own content.
            </strong>
            <p className="mt-1 text-neutral-400">
              You are responsible for the PDFs you process. Don&apos;t use PDF
              Dark for anything illegal, malicious, or that infringes on
              someone&apos;s rights.
            </p>
          </li>
          <li>
            <strong className="text-neutral-100">No warranty.</strong>
            <p className="mt-1 text-neutral-400">
              We try to render PDFs correctly, but some may fail — encrypted files,
              very large files, unusual fonts, damaged files. If it doesn&apos;t
              work, try another tool. No refunds because there&apos;s nothing to
              refund.
            </p>
          </li>
          <li>
            <strong className="text-neutral-100">No liability.</strong>
            <p className="mt-1 text-neutral-400">
              If something goes wrong with your file, workflow, device, or data,
              we can&apos;t take responsibility. Keep backups of anything you
              can&apos;t afford to lose.
            </p>
          </li>
          <li>
            <strong className="text-neutral-100">We can change this.</strong>
            <p className="mt-1 text-neutral-400">
              We may update these terms, retire features, or shut the site down.
              Material changes to these terms will be posted here first, with a
              new &ldquo;Last updated&rdquo; date.
            </p>
          </li>
        </ol>

        <p className="mt-12 text-neutral-400">
          Short version: the tool is free, the risk is yours, and we&apos;re not
          your lawyer.
        </p>
      </article>
    </LegalFrame>
  );
}
