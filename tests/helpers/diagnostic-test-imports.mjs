import fs from 'node:fs';
import ts from 'typescript';

function compile(name, imports = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(`../../lib/${name}.ts`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(dependency => {
    if (!(dependency in imports)) throw Error(`Unexpected diagnostic dependency: ${dependency}`);
    return imports[dependency];
  }, exports);
  return exports;
}

// Share each real module instance so WeakMap observations survive reporter tests.
export const diagnosticTestImports = {
  './pdf-original-error-diagnostics': compile('pdf-original-error-diagnostics'),
  './pulse-error-monitoring': { capturePulseException() {}, addPulseBreadcrumb() {} },
  './pdf-encoding-diagnostics': compile('pdf-encoding-diagnostics'),
  './pdf-file-read-diagnostics': compile('pdf-file-read-diagnostics'),
  './background-worker-diagnostics': compile('background-worker-diagnostics', {
    '@sentry/nextjs': { addBreadcrumb() {} },
    './pulse-error-monitoring': { addPulseBreadcrumb() {} },
  }),
};
