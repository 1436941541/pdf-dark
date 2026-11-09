import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { telemetryPage } from '../lib/analytics-events.ts';

const code = ts.transpileModule(fs.readFileSync(new URL('../lib/client-diagnostics.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
new Function('require', 'exports', code)(name => {
  assert.equal(name, './analytics-events'); return { telemetryPage };
}, exports);
const { createClientDiagnostics, diagnosticTarget, diagnosticCodeFrames } = exports;
function event() {
  return { exception: { values: [{ type: 'UnhandledRejection', value: 'undefined' }] }, contexts: { existing: { kept: true } } };
}

test('URLs and code frames exclude PDF data, credentials, tracker IDs and arbitrary paths', () => {
  assert.equal(diagnosticTarget('data:application/pdf;SECRET'), null);
  assert.equal(diagnosticTarget('blob:https://pdfdark.org/SECRET'), null);
  assert.equal(diagnosticTarget('https://pdfdark.org/?private=' + 'x'.repeat(5000)), null);
  assert.equal(diagnosticTarget('https://x.ingest.us.sentry.io/api/123/envelope/?sentry_key=SECRET'), null);
  assert.deepEqual(diagnosticTarget('https://pdfdark.org/deskew-pdf?_rsc=SECRET'), { service: 'site', url: 'site:/deskew-pdf', rsc: true });
  for (const input of ['https://name:SECRET@private.example/private.pdf?token=SECRET', 'https://pdfdark.org/private-document.pdf', 'https://region1.google-analytics.com/g/collect?cid=SECRET']) {
    assert(!JSON.stringify(diagnosticTarget(input)).includes('SECRET'));
    assert(!JSON.stringify(diagnosticTarget(input)).includes('private'));
  }
  const frames = diagnosticCodeFrames('Error: SECRET\n at x (https://pdfdark.org/_next/static/chunks/a.js:12:34)\n at user (blob:https://pdfdark.org/SECRET)\n at private (https://private.example/_next/static/SECRET.js:1:2)');
  assert.deepEqual(frames, [{ filename: 'https://pdfdark.org/_next/static/chunks/a.js', lineno: 12, colno: 34 }]);
});

test('fetch keeps arguments, receiver, response and abort behavior intact', async () => {
  const diagnostics = createClientDiagnostics();
  const response = new Response('ok');
  const controller = new AbortController();
  const options = { signal: controller.signal, headers: { Authorization: 'SECRET' }, body: 'PRIVATE PDF CONTENT', method: 'POST' };
  const receiver = {};
  const fetcher = diagnostics.wrapFetch(function (url, init) {
    assert.equal(this, receiver); assert.equal(url, 'https://pdfdark.org/whiten-pdf?secret=SECRET'); assert.equal(init, options);
    return Promise.resolve(response);
  });
  assert.equal(await fetcher.call(receiver, 'https://pdfdark.org/whiten-pdf?secret=SECRET', options), response);
  const enriched = diagnostics.enrich(event(), { originalException: undefined });
  assert.equal(enriched.contexts.client_diagnostics.requests[0].outcome, 'fulfilled');
  assert.equal(enriched.contexts.client_diagnostics.requests[0].abort_requested, false);
  assert(!JSON.stringify(enriched).includes('SECRET'));
  assert(!JSON.stringify(enriched).includes('PRIVATE PDF CONTENT'));
});

test('undefined rejection is propagated and directly observed promise can be matched without inventing a stack', async () => {
  const diagnostics = createClientDiagnostics();
  const listeners = {};
  diagnostics.observeWindow({ addEventListener: (type, handler) => { listeners[type] = handler; } });
  const wrapped = diagnostics.wrapFetch(() => Promise.reject(undefined));
  const promise = wrapped('https://pdfdark.org/pdf-to-black-and-white');
  const rejection = await promise.then(() => 'unexpected success', reason => reason);
  assert.equal(rejection, undefined);
  listeners.unhandledrejection({ promise, reason: undefined });
  const original = event();
  const enriched = diagnostics.enrich(original, { originalException: undefined });
  assert.equal(enriched, original);
  const context = enriched.contexts.client_diagnostics;
  assert.equal(context.requests[0].outcome, 'rejected');
  assert.equal(context.requests[0].reason_type, 'undefined');
  assert.equal(context.rejections[0].returned_fetch_request_id, context.requests[0].id);
  assert.equal(context.captured_value_type, 'undefined');
  assert.equal(enriched.tags.reported_stack, 'missing');
  assert.equal(enriched.exception.values[0].stacktrace, undefined);
  assert.deepEqual(enriched.contexts.existing, { kept: true });
});

test('unmapped chained promises stay unmapped and page lifecycle is observation only', async () => {
  const diagnostics = createClientDiagnostics();
  const listeners = {};
  diagnostics.observeWindow({ addEventListener: (type, handler) => { listeners[type] = handler; } });
  assert.equal(listeners.beforeunload, undefined);
  const fetcher = diagnostics.wrapFetch(() => Promise.resolve(new Response('ok')));
  const chained = fetcher('https://pdfdark.org/').then(() => { throw 'PRIVATE REASON'; });
  await chained.catch(() => {});
  let prevented = false;
  listeners.unhandledrejection({ promise: chained, reason: 'PRIVATE REASON', preventDefault: () => { prevented = true; } });
  listeners.pagehide();
  const context = diagnostics.enrich(event(), {}).contexts.client_diagnostics;
  assert.equal(context.leaving, true);
  assert.equal(context.rejections[0].returned_fetch_request_id, undefined);
  assert.equal(prevented, false);
  assert(!JSON.stringify(context).includes('PRIVATE REASON'));
  listeners.pageshow();
  assert.equal(diagnostics.enrich(event(), {}).contexts.client_diagnostics.leaving, false);
});

test('bounded buffers, real aborts and operation single settlement keep diagnostic behavior predictable', async () => {
  const diagnostics = createClientDiagnostics();
  const controller = new AbortController();
  const abort = new DOMException('SECRET reason', 'AbortError');
  controller.abort();
  const wrapped = diagnostics.wrapFetch(() => Promise.reject(abort));
  await assert.rejects(wrapped('https://pdfdark.org/', { signal: controller.signal }), error => error === abort);
  let context = diagnostics.enrich(event(), {}).contexts.client_diagnostics;
  assert.equal(context.requests[0].abort_requested, true);
  assert.equal(context.requests[0].reason_type, 'AbortError');
  const success = diagnostics.wrapFetch(() => Promise.resolve(new Response('ok')));
  for (let i = 0; i < 20; i++) {
    await success('https://pdfdark.org/');
    const operation = diagnostics.beginOperation('reader', 'read');
    operation.finish('cancel'); operation.finish('failure');
  }
  context = diagnostics.enrich(event(), {}).contexts.client_diagnostics;
  assert.equal(context.requests.length, 10);
  assert.equal(context.operations.length, 8);
  assert(context.operations.every(operation => operation.outcome === 'cancel'));
  assert(!JSON.stringify(context).includes('SECRET'));
});

test('breadcrumb whitelisting and synchronous fetch errors preserve failures without leaking inputs', () => {
  const diagnostics = createClientDiagnostics();
  const crumb = diagnostics.networkBreadcrumb({ category: 'fetch', data: { url: 'https://region1.google-analytics.com/g/collect?cid=SECRET', method: 'POST', status_code: 503, __span: '0123456789abcdef', body: 'SECRET', headers: { Authorization: 'SECRET' } } });
  assert.equal(crumb.data.status_code, 503);
  assert.equal(crumb.data.service, 'google_analytics');
  assert.equal(crumb.data.__span, '0123456789abcdef');
  assert(!JSON.stringify(crumb).includes('SECRET'));
  const original = new TypeError('PRIVATE MESSAGE');
  const wrapped = diagnostics.wrapFetch(() => { throw original; });
  assert.throws(() => wrapped('https://pdfdark.org/'), error => error === original);
  assert.equal(diagnostics.enrich(event(), {}).contexts.client_diagnostics.requests[0].outcome, 'threw');
});

test('client entry point wires diagnostics before Sentry and preserves router capture', async () => {
  const entry = ts.transpileModule(fs.readFileSync(new URL('../instrumentation-client.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const listeners = {};
  const win = { addEventListener: (name, handler) => { listeners[name] = handler; }, fetch: () => Promise.resolve(new Response('ok')) };
  const originalFetch = win.fetch;
  let options;
  let routerArgs;
  let scriptObserved = false;
  let scriptEnriched = false;
  const sdk = {
    init(value) { assert.equal(typeof listeners.unhandledrejection, 'function'); assert.equal(scriptObserved, true); options = value; },
    replayIntegration: () => ({}),
    captureRouterTransitionStart: (...args) => { routerArgs = args; },
  };
  const diagnostic = createClientDiagnostics();
  const entryExports = {};
  new Function('require', 'exports', 'window', 'process', entry)(name => {
    if (name === '@sentry/nextjs') return sdk;
    if (name === './lib/browser-script-diagnostics') return { browserScriptDiagnostics: {
      observeWindow(target) { assert.equal(target, win); scriptObserved = true; },
      enrich(value) { assert.equal(value.tags.client_diagnostics, 'v1'); scriptEnriched = true; return value; },
    } };
    assert.equal(name, './lib/client-diagnostics'); return { clientDiagnostics: diagnostic };
  }, entryExports, win, { env: { NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.invalid/1' } });
  assert.notEqual(win.fetch, originalFetch);
  await win.fetch('https://pdfdark.org/deskew-pdf?_rsc=SECRET');
  entryExports.onRouterTransitionStart('/whiten-pdf?secret=SECRET', 'push');
  assert.deepEqual(routerArgs, ['/whiten-pdf?secret=SECRET', 'push']);
  assert.equal(options.beforeBreadcrumb({ category: 'console' }), null);
  const enriched = options.beforeSend(event(), { originalException: undefined });
  assert.equal(scriptEnriched, true);
  assert.equal(enriched.contexts.client_diagnostics.navigation.page, '/whiten-pdf');
  assert.equal(enriched.contexts.client_diagnostics.requests.length, 1);
  assert(!JSON.stringify(enriched).includes('SECRET'));
  assert.equal(options.tracesSampleRate, 0);
});

test('unavailable diagnostic event hooks do not interrupt startup', () => {
  assert.doesNotThrow(() => createClientDiagnostics().observeWindow({ addEventListener: () => { throw Error('unavailable'); } }));
});
