import { diagnosticTestImports } from './helpers/diagnostic-test-imports.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const T = { en: { errors: { password: 'password', invalid: 'invalid', fileUnavailable: 'unavailable' } } };
const code = ts.transpileModule(fs.readFileSync(new URL('../lib/pdf-load-error.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { pdfOpenErrorText } = (() => {
  const exports = {};
  const imports = { './i18n': { T }, './pdf-file-read-diagnostics': diagnosticTestImports['./pdf-file-read-diagnostics'] };
  new Function('require', 'exports', code)((name) => imports[name], exports);
  return exports;
})();
const { readPdfFile } = diagnosticTestImports['./pdf-file-read-diagnostics'];

async function readFailure(name) {
  const error = Object.assign(new Error('browser message'), { name });
  const file = { size: 818_540_629, type: 'application/pdf', lastModified: Date.now(), arrayBuffer: () => Promise.reject(error) };
  await assert.rejects(readPdfFile(file), (e) => e === error);
  return error;
}

test('files the browser cannot read get the save-a-copy message', async () => {
  assert.equal(pdfOpenErrorText(await readFailure('NotReadableError'), 'en'), 'unavailable');
  assert.equal(pdfOpenErrorText(await readFailure('NotFoundError'), 'en'), 'unavailable');
});

test('other failures keep their existing messages', async () => {
  assert.equal(pdfOpenErrorText(await readFailure('SecurityError'), 'en'), null);
  // Same error name outside the file read (e.g. a later page image) is not a file problem.
  assert.equal(pdfOpenErrorText(Object.assign(new Error('x'), { name: 'NotReadableError' }), 'en'), null);
  assert.equal(pdfOpenErrorText({ name: 'PasswordException' }, 'en'), 'password');
  assert.equal(pdfOpenErrorText({ name: 'InvalidPDFException' }, 'en'), 'invalid');
  assert.equal(pdfOpenErrorText(new Error('render failed'), 'en'), null);
});
