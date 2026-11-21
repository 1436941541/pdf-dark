import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8").replace(/^\s*\/\/.*$/gm, ""));
const exportDir = resolve(config.assets.directory);
const configFile = resolve(".wrangler/crawler-routes.json");
const pages = new Set();

for (const entry of readdirSync(exportDir, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
  const file = relative(exportDir, join(entry.parentPath, entry.name)).replaceAll("\\", "/");
  if (file === "404.html" || file === "_not-found.html" || file.startsWith("_next/") || file.startsWith("_not-found/")) continue;
  const page = `/${file.slice(0, -".html".length)}`.replace(/\/index$/, "") || "/";
  pages.add(page);
}

const metadata = ["/robots.txt", "/sitemap.xml"];
if (!pages.has("/") || metadata.some((path) => !existsSync(join(exportDir, path)))) {
  throw new Error("The static export is missing its homepage, robots.txt or sitemap.xml.");
}

const paths = [...pages].sort().flatMap((path) => (path === "/" ? [path] : [path, `${path}/`]));
paths.push(...metadata);

const redirects = JSON.parse(readFileSync(new URL("../worker/redirects.json", import.meta.url), "utf8"));
for (const path of Object.keys(redirects)) {
  paths.push(path);
  if (!path.includes("%")) paths.push(`${path}/`);
}

const uniquePaths = [...new Set(paths)];
// Cloudflare allows at most 100 run_worker_first patterns.
config.assets.run_worker_first = uniquePaths.length <= 100 ? uniquePaths : true;
config.assets.directory = relative(dirname(configFile), exportDir);
config.main = relative(dirname(configFile), resolve(config.main));

mkdirSync(dirname(configFile), { recursive: true });
writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`);
console.log(
  `Worker-first routes: ${pages.size} HTML pages + ${metadata.length} metadata paths + ${Object.keys(redirects).length} redirects (${uniquePaths.length} patterns).`,
);
