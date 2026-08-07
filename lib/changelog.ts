export type ChangelogTag = "New" | "Improved" | "Fixed";

export type ChangelogEntry = {
  /** YYYY-MM-DD */
  date: string;
  tag: ChangelogTag;
  title: string;
  description: string;
};

// Newest first. User-visible changes only — internal refactors, SEO plumbing,
// and analytics tweaks don't belong here.
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-08-08",
    tag: "Improved",
    title: "Blocked third-party embedding",
    description:
      "PDF Dark can no longer be loaded inside other sites' iframes. Your reading experience is unchanged — this closes the door on shady traffic-exchange sites wrapping the app.",
  },
  {
    date: "2026-08-04",
    tag: "Fixed",
    title: "Conversion crashes in some browsers",
    description:
      "Switched the PDF engine to a broadly compatible build, fixing conversions that failed with engine errors on certain browser versions.",
  },
  {
    date: "2026-08-01",
    tag: "Fixed",
    title: "Firefox conversions hanging",
    description:
      "Conversions no longer stall in Firefox, and when a conversion does fail you now see an error message instead of an endless spinner.",
  },
  {
    date: "2026-07-30",
    tag: "New",
    title: "Windows dark-mode guide",
    description:
      "Added the missing platform guide: how to get PDF dark mode on Windows. All 14 guides were also rewritten to answer their question in the first paragraph.",
  },
  {
    date: "2026-07-29",
    tag: "New",
    title: "8 platform-specific guides and a blog index",
    description:
      "Dedicated dark-mode guides for Chrome, Firefox, Edge, Mac, iPad/iPhone, Android, Adobe Acrobat, and Sumatra PDF — plus a browsable index at /blog.",
  },
  {
    date: "2026-07-28",
    tag: "New",
    title: "Dedicated converter page",
    description:
      "Reading and converting are now two pages: the homepage reads PDFs in dark mode instantly, and /converter focuses on downloading a permanent dark copy.",
  },
  {
    date: "2026-07-20",
    tag: "New",
    title: "Darkness and warmth sliders",
    description:
      "Tune the output to your eyes: lift the background toward white if full dark is too harsh (50–100%), and shift the color temperature toward candle-light for night reading.",
  },
  {
    date: "2026-07-17",
    tag: "New",
    title: "Smart image handling and searchable text",
    description:
      "Photos and diagrams now keep their original colors instead of becoming negatives, vector graphics are recolored cleanly, and the downloaded dark PDF keeps its text selectable and searchable.",
  },
  {
    date: "2026-07-13",
    tag: "New",
    title: "Theme preview",
    description:
      "See what each theme looks like on your document before and during conversion, instead of committing blind.",
  },
  {
    date: "2026-04-25",
    tag: "New",
    title: "PDF Dark launches",
    description:
      "First release: read any PDF in dark mode directly in the browser, with four themes. Files are processed locally and never leave your device.",
  },
];

/** Date of the most recent entry — used as the changelog page's lastModified. */
export const CHANGELOG_UPDATED_AT = CHANGELOG[0].date;
