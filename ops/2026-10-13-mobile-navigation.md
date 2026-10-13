# Mobile navigation

The shared responsive navigation shows a top-right Menu button below768px. Clicking opens the existing links in a dark dropdown, with the existing active-tool accent. At768px and wider links remain visible in a row. The wrapper is applied to the four English tool pages, six translated reader/invert pages and existing blog headers. Language names remain visible inside the mobile menu. No URL, keyword mapping or page content change.

Accessibility and interaction:44px minimum button and direct-link touch targets, aria-expanded/aria-controls, semantic nav and ordinary anchors. Escape closes and restores trigger focus; outside click, focus moving outside, link selection and crossing the desktop breakpoint close the dropdown. Navigation links are server-rendered in one list, avoiding duplicate links and keeping them present in HTML.

Validation: scoped lint and TypeScript plus isolated production build passed. Verified all21 individual app page edits can be reversed to exactly the original source by undoing the wrapper/import, preserving all page copy and link targets. Browser verification includes representative English tools, all six locales, blog index/article, mobile widths320/390/640, desktop768/1024/1280, active links, language switching, Escape, outside click, FAQ selection, keyboard and resize behavior. Screenshot/test harness artifacts are outside the checkout under `/workspace/pdf-dark-browser-tests/navigation/`.

No SEO URL/keyword-positioning mapping changed, so PAGES.md/project-console updates are not required. Deployment uses the existing main-branch workflow and live verification follows the push.
