import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const code = ts.transpileModule(fs.readFileSync(new URL('../lib/pulse-error-monitoring.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {}; new Function('exports', code)(exports);
const { createPulseErrorBridge, pulseTrackerSource } = exports;

test('opt-in fetches a versioned tracker while disabled URLs remain byte-identical', () => {
  const src = 'https://yj-pulse.vercel.app/p.js?existing=a%2Fb#fragment';
  assert.equal(pulseTrackerSource(src, false), src);
  const enabled = new URL(pulseTrackerSource(src, true));
  assert.equal(enabled.searchParams.get('pulse-errors'), '0.1.1');
  assert.equal(enabled.searchParams.get('existing'), 'a/b');
  assert.equal(enabled.hash, '#fragment');
  assert.equal(pulseTrackerSource(pulseTrackerSource(src, true), true), pulseTrackerSource(src, true));
  assert.equal(pulseTrackerSource('p.js', true), 'p.js?pulse-errors=0.1.1');
});

test('framework errors retain only code coordinates, never surrounding document text or URL secrets', () => {
  const sent = [], sandbox = {};
  new Function('exports', 'process', 'window', code)(sandbox,
    { env: { NEXT_PUBLIC_PULSE_ERRORS: 'true' } },
    { umami: { captureException(error) { sent.push(error); } } });
  const original = Error('document text');
  original.stack = 'Error: document text\n    at DOC_PREFIX (https://pdfdark.org/_next/static/chunks/app.js:12:34) PRIVATE_DOCUMENT_SENTINEL\nfn@https://user:password@pdfdark.org/assets/main.js?token=private:9:10';
  sandbox.capturePulseApplicationError(original);
  assert.equal(sent.length, 1);
  assert(sent[0].stack.includes('https://pdfdark.org/_next/static/chunks/app.js:12:34'));
  assert(sent[0].stack.includes('https://pdfdark.org/assets/main.js:9:10'));
  for (const text of ['document text','DOC_PREFIX','PRIVATE_DOCUMENT_SENTINEL','password','private','token=']) assert(!sent[0].stack.includes(text), text);
  assert(original.stack.includes('PRIVATE_DOCUMENT_SENTINEL'));
});

test('disabled integration is inert and never changes existing reporting', () => {
  let calls = 0;
  const bridge = createPulseErrorBridge(() => false, () => { calls++; throw Error('unavailable'); });
  bridge.addBreadcrumb({ category: 'worker', message: 'created' }); bridge.captureException(Error('active')); bridge.flush();
  assert.equal(calls, 0);
});
test('preserves detailed diagnostics and original exception when tracker becomes ready', () => {
  let api; const sent = [];
  const bridge = createPulseErrorBridge(() => true, () => api);
  bridge.addBreadcrumb({ category: 'pdf.worker', message: 'background.request', data: { page_number: 769 } });
  const error = Error('PDF processing failed');
  const contexts = { pdf_cache: { cached_pages: 768, total_bytes: 100000000 }, pdf_file_read: { phase: 'read' } };
  bridge.captureException(error, { contexts, fingerprint: ['pdf','reader','image','decode','TypeError','failed'] });
  api = { captureException: (e, options) => sent.push({ e, options }) }; bridge.flush(); bridge.flush();
  assert.equal(sent.length, 1); assert.equal(sent[0].e, error); assert.deepEqual(sent[0].options.contexts, contexts);
  assert.equal(sent[0].options.fingerprint.length, 5); assert.equal(sent[0].options.fingerprint[4], 'TypeError|failed');
  assert.equal(sent[0].options.breadcrumbs[0].data.page_number, 769);
});
test('bounded backlog and worker history do not grow when collector is blocked', () => {
  let api; const sent = []; const bridge = createPulseErrorBridge(() => true, () => api);
  for (let n=0;n<100;n++) { bridge.addBreadcrumb({ category:'worker',message:String(n) });bridge.captureException(Error(String(n))); }
  api = { captureException: (error, options) => sent.push({error,options}) }; bridge.flush();
  assert.equal(sent.length, 20);assert.equal(sent[0].error.message,'80');assert.equal(sent.at(-1).options.breadcrumbs.length,30);
});
test('transport errors cannot throw into the PDF flow and active errors are not name-filtered', async () => {
  const seen = []; const bridge = createPulseErrorBridge(() => true, () => ({ captureException(error) { seen.push(error); return Promise.reject(Error('offline')); } }));
  const error = Object.assign(Error('real active failure'), { name:'AbortError' });
  assert.doesNotThrow(() => bridge.captureException(error));await Promise.resolve(); assert.equal(seen[0],error);
});
