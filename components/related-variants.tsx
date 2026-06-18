import Link from "next/link";
import { VARIANTS } from "@/lib/variants";

export function RelatedVariants({ currentSlug }: { currentSlug: string }) {
  const others = VARIANTS.filter((v) => v.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <section className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900">
      <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
        Related PDF dark mode tools
      </h2>
      <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
        Different angles on the same problem — pick the one that matches what
        you actually need.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        {others.map((v) => (
          <Link
            key={v.slug}
            href={`/${v.slug}`}
            className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-amber-400/40 transition-colors"
          >
            <div className="font-semibold text-neutral-50 group-hover:text-amber-400 transition-colors flex items-center justify-between">
              <span>{v.title}</span>
              <span
                aria-hidden
                className="text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
              >
                →
              </span>
            </div>
            <div className="mt-1 text-sm text-neutral-400">{v.blurb}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
