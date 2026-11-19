const MAX_RANGE_SPAN = 10000;

export function parsePageRanges(
  input: string,
  maxPage?: number,
): { pages: Set<number>; invalid: boolean; outOfBounds: boolean } {
  const pages = new Set<number>();
  let invalid = false;
  let outOfBounds = false;

  for (const raw of input.split(/[;,]+/)) {
    const token = raw.trim();
    if (!token) continue;

    const single = /^(\d+)$/.exec(token);
    if (single) {
      const page = Number(single[1]);
      if (!Number.isSafeInteger(page) || page < 1) {
        invalid = true;
        continue;
      }
      if (maxPage !== undefined && page > maxPage) {
        outOfBounds = true;
        continue;
      }
      pages.add(page);
      continue;
    }

    const range = /^(\d+)\s*[-–]\s*(\d+)$/.exec(token);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || a < 1 || b < 1) {
        invalid = true;
        continue;
      }
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      if (maxPage !== undefined && lo > maxPage) {
        outOfBounds = true;
        continue;
      }
      if (maxPage !== undefined && hi > maxPage) {
        outOfBounds = true;
      }
      const cappedHi = Math.min(
        hi,
        maxPage !== undefined ? maxPage : lo + MAX_RANGE_SPAN - 1,
      );
      for (let p = lo; p <= cappedHi; p++) {
        pages.add(p);
      }
      continue;
    }

    // Allow partial trailing hyphen while the user is typing (e.g. "1, 80-")
    const partial = /^(\d+)\s*[-–]$/.exec(token);
    if (partial) {
      const page = Number(partial[1]);
      if (page >= 1 && (maxPage === undefined || page <= maxPage)) {
        pages.add(page);
      }
      continue;
    }

    invalid = true;
  }

  return { pages, invalid, outOfBounds };
}

export function formatPageRanges(pages: ReadonlySet<number>): string {
  const sorted = Array.from(pages)
    .filter((n) => Number.isInteger(n) && n >= 1)
    .sort((a, b) => a - b);
  if (sorted.length === 0) return "";

  const parts: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      parts.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = prev = cur;
    }
  }
  parts.push(start === prev ? `${start}` : `${start}-${prev}`);
  return parts.join(", ");
}
