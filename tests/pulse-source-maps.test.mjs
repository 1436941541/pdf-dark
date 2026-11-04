import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const projectDir = resolve(dirname(new URL(import.meta.url).pathname), "..");
const sentryHandler = require(join(
  dirname(require.resolve("@sentry/nextjs")),
  "config/handleRunAfterProductionCompile.js",
));

async function loadConfig() {
  const source = await readFile(join(projectDir, "next.config.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const configModule = { exports: {} };
  vm.runInNewContext(outputText, { module: configModule, exports: configModule.exports, require, process, console });
  return configModule.exports.default;
}

async function withFixture(run) {
  const oldEnv = { ...process.env };
  const oldFetch = globalThis.fetch;
  const oldHandler = sentryHandler.handleRunAfterProductionCompile;
  const dir = await mkdtemp(join(tmpdir(), "pdf-pulse-compat-"));
  try {
    await mkdir(join(dir, "static/chunks"), { recursive: true });
    await writeFile(join(dir, "static/chunks/app.js"), "void 0;\n//# sourceMappingURL=hashed-map.js.map\n");
    await writeFile(join(dir, "static/chunks/hashed-map.js.map"), JSON.stringify({ version: 3, sources: [], names: [], mappings: "" }));
    await writeFile(join(dir, "static/chunks/style.css.map"), "{}");
    process.env.SENTRY_AUTH_TOKEN = "isolated-sentry-test-only";
    process.env.TURBOPACK = "1";
    process.env.YJ_PULSE_URL = "http://127.0.0.1:1";
    process.env.YJ_PULSE_WEBSITE_ID = "11111111-1111-4111-8111-111111111111";
    process.env.YJ_PULSE_API_KEY = "isolated-pulse-test-only";
    process.env.YJ_PULSE_RELEASE = "isolated-compat-release";
    await run(dir);
  } finally {
    sentryHandler.handleRunAfterProductionCompile = oldHandler;
    globalThis.fetch = oldFetch;
    for (const key of Object.keys(process.env)) if (!(key in oldEnv)) delete process.env[key];
    Object.assign(process.env, oldEnv);
    await rm(dir, { recursive: true, force: true });
  }
}

test("PDF config keeps Sentry first, shares the Pulse release and removes maps after both upload hooks", async () => {
  await withFixture(async (dir) => {
    process.env.YJ_PULSE_SOURCE_MAPS = "true";
    const order = [];
    // Run the real installed Sentry config wrapper, replacing only its network
    // build manager. No artifact or test exception can reach a remote service.
    sentryHandler.handleRunAfterProductionCompile = async (_context, options) => {
      assert.equal(options.sourcemaps.deleteSourcemapsAfterUpload, false);
      await access(join(dir, "static/chunks/hashed-map.js.map"));
      // Real Next/Sentry output may wrap a differently named map with a
      // generated banner offset. Exercise both together at this boundary.
      await writeFile(join(dir, "static/chunks/hashed-map.js.map"), JSON.stringify({
        version: 3,
        sections: [{ offset: { line: 1, column: 0 }, map: {
          version: 3, sources: ["original.ts"], sourcesContent: ["void 0;"], names: [], mappings: "AAAA",
        } }],
      }));
      order.push("sentry");
    };
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "http://127.0.0.1:1/api/websites/11111111-1111-4111-8111-111111111111/errors/artifacts");
      assert.deepEqual(order, ["sentry"]);
      const payload = JSON.parse(options.body);
      assert.equal(payload.release, "isolated-compat-release");
      assert.equal(payload.filename, "/_next/static/chunks/app.js");
      assert.equal(payload.map.mappings, ";AAAA");
      assert.equal(payload.map.sections, undefined);
      order.push("pulse");
      return { ok: true };
    };
    const config = await loadConfig();
    assert.equal(config.env.NEXT_PUBLIC_PULSE_RELEASE, "isolated-compat-release");
    assert.equal(config.env.YJ_PULSE_API_KEY, undefined);
    await config.compiler.runAfterProductionCompile({ projectDir, distDir: dir });
    assert.deepEqual(order, ["sentry", "pulse"]);
    await assert.rejects(access(join(dir, "static/chunks/hashed-map.js.map")));
    await assert.rejects(access(join(dir, "static/chunks/style.css.map")));
  });
});

test("PDF config leaves Sentry upload/deletion behavior unchanged when Pulse source maps are disabled", async () => {
  await withFixture(async (dir) => {
    process.env.YJ_PULSE_SOURCE_MAPS = "false";
    let sentryCalled = false;
    sentryHandler.handleRunAfterProductionCompile = async (_context, options) => {
      assert.equal(options.sourcemaps.deleteSourcemapsAfterUpload, true);
      sentryCalled = true;
    };
    globalThis.fetch = async () => { throw new Error("Unexpected Pulse upload"); };
    const config = await loadConfig();
    assert.equal(config.env?.NEXT_PUBLIC_PULSE_RELEASE, undefined);
    await config.compiler.runAfterProductionCompile({ projectDir, distDir: dir });
    assert.equal(sentryCalled, true);
    // The replaced Sentry network manager deliberately leaves this fixture in
    // place; Pulse must not run an extra cleanup pass in the disabled case.
    await access(join(dir, "static/chunks/hashed-map.js.map"));
  });
});
