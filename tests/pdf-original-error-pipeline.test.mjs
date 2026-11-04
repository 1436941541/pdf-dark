import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { createErrorClient } from '@yj-pulse/error-sdk';
import { diagnosticTestImports } from './helpers/diagnostic-test-imports.mjs';

function compile(name, imports = {}, globals = {}) {
  const source = fs.readFileSync(new URL(`../lib/${name}.ts`, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('require', 'exports', ...Object.keys(globals), code)(name => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports, ...Object.values(globals));
  return exports;
}

test('real PDF failure contexts survive the portable SDK transport scrubber without original private text', async () => {
  const envelopes = [], sentry = [];
  const client = createErrorClient({
    website: '11111111-1111-4111-8111-111111111111', release: 'offline-original-error',
    context: () => ({ url: 'https://pdfdark.org/' }),
    transport: async envelope => { envelopes.push(envelope); return { status: 200 }; },
  });
  try {
    const pulse = compile('pulse-error-monitoring').createPulseErrorBridge(() => true, () => client);
    const original = new TypeError('Load failed', { cause: new Error('PRIVATE document.pdf https://private.invalid/?token=SECRET data:image/jpeg;base64,PRIVATE') });
    Object.defineProperty(original, 'code', { value: 0 });
    const helpers = compile('pdf-image-diagnostics', {
      ...diagnosticTestImports,
      './dark-worker-diagnostics': compile('dark-worker-diagnostics'),
      './pdf-image-resource-diagnostics': compile('pdf-image-resource-diagnostics'),
      './pulse-error-monitoring': { capturePulseException: pulse.captureException },
      '@sentry/nextjs': { captureException: (error, report) => sentry.push({ error, report }) },
    }, {
      fetch: async () => { throw original; },
      console: { error() {} },
      document: { visibilityState: 'visible', hasFocus: () => true },
      navigator: { onLine: true },
    });
    await assert.rejects(helpers.loadPageBitmap('data:image/jpeg;base64,/9j/' + 'A'.repeat(12000), { pageNumber: 104, width: 892, height: 1262, imageRegionCount: 0 }, () => {}, () => ({ cached_pages: 103, cached_data_url_chars: 91_271_430 })), error => error === original);
    helpers.capturePdfProcessingException(original, 'read', { tool: 'reader' }, { readerStep: 'darkify_page' });
    await client.flush();
    assert.equal(sentry.length, 1);
    assert.equal(envelopes.length, 1);
    const payload = envelopes[0].payload;
    for (const name of ['pdf_original_error', 'pdf_image_read']) {
      assert(sentry[0].report.contexts[name], `missing new context ${name}`);
      // The SDK deliberately uses null-prototype dictionaries; compare the
      // serialized values that are actually transported over the wire.
      assert.deepEqual(JSON.parse(JSON.stringify(payload.contexts[name])), JSON.parse(JSON.stringify(sentry[0].report.contexts[name])));
    }
    assert.equal(payload.contexts.pdf_image_processing.cached_data_url_chars, 91_271_430);
    assert.equal(payload.tags.pdf_diagnostic_version, '4');
    assert(!/PRIVATE|SECRET|document\.pdf|private\.invalid|data:image|token=/.test(JSON.stringify([payload, sentry[0].report])));
    if (process.env.PDF_LOG_PIPELINE_EVIDENCE) fs.writeFileSync(process.env.PDF_LOG_PIPELINE_EVIDENCE, JSON.stringify(payload, null, 2));
  } finally { client.dispose(); }
});
