import type { Metadata } from "next";
import { LegalFrame } from "@/components/legal-frame";
import { CHANGELOG, type ChangelogTag } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog — PDF Dark",
  description:
    "What's new in PDF Dark: features, fixes, and improvements to the browser-side PDF dark mode tool, newest first.",
  alternates: { canonical: "/changelog" },
};

const TAG_STYLES: Record<ChangelogTag, string> = {
  New: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  Improved: "bg-sky-400/10 text-sky-400 border-sky-400/30",
  Fixed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function ChangelogPage() {
  return (
    <LegalFrame>
      <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
        <h1 className="text-3xl font-bold text-neutral-50 mb-4">Changelog</h1>
        <p className="text-lg mb-12">
          What&apos;s new in PDF Dark, newest first. Only changes you can
          actually see or feel — internal plumbing doesn&apos;t make the list.
        </p>

        <ol className="space-y-10">
          {CHANGELOG.map((entry) => (
            <li key={`${entry.date}-${entry.title}`}>
              <div className="flex items-center gap-3 mb-2">
                <time
                  dateTime={entry.date}
                  className="text-sm text-neutral-500 tabular-nums"
                >
                  {formatDate(entry.date)}
                </time>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${TAG_STYLES[entry.tag]}`}
                >
                  {entry.tag}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-neutral-50 mb-2">
                {entry.title}
              </h2>
              <p>{entry.description}</p>
            </li>
          ))}
        </ol>

        <p className="mt-12 text-sm text-neutral-500">
          Spotted a bug or want a feature on this list? Email{" "}
          <a
            href="mailto:hello@pdfdark.org"
            className="text-amber-400 hover:underline"
          >
            hello@pdfdark.org
          </a>{" "}
          or open an issue on{" "}
          <a
            href="https://github.com/1436941541/pdf-dark"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            GitHub
          </a>
          .
        </p>
      </article>
    </LegalFrame>
  );
}
