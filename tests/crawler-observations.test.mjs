import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import net from 'node:net';
import { AsyncLocalStorage } from 'node:async_hooks';
import ts from 'typescript';
// Match the Next server bootstrap before importing its async-storage users.
globalThis.AsyncLocalStorage ??= AsyncLocalStorage;
const { default: nextTesting } = await import('next/experimental/testing/server.js');
const unstable_doesProxyMatch = nextTesting.unstable_doesProxyMatch ?? nextTesting.unstable_doesMiddlewareMatch;

function compile(file, imports) {
  const code = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(name => {
    assert(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, exports);
  return exports;
}
const variants = compile('../lib/variants.ts', {});
const collector = compile('../lib/crawler-observations.ts', { 'node:crypto': crypto, 'node:net': net, './variants': variants });
const { createCrawlerObservation, signCrawlerObservation, sendCrawlerObservation, observeCrawlerRequest } = collector;
const env = {
  CRAWLER_COLLECTION_ENABLED: 'true', CRAWLER_ALLOWED_HOSTS: 'pdfdark.org,www.pdfdark.org',
  CRAWLER_INGEST_URL: 'https://collector.example/api/crawlers/ingest',
  CRAWLER_KEY_ID: '90812f31-542a-421a-8be1-da66f584f2ac', CRAWLER_SIGNING_SECRET: 'ab'.repeat(32),
  NODE_ENV: 'production', VERCEL: '1',
};
const req = (path = '/', headers = {}, method = 'GET') => ({
  url: `https://pdfdark.org${path}`, method,
  headers: new Headers({ 'user-agent': 'Googlebot/2.1', accept: 'text/html', ...headers }),
});

test('collection requires explicit server configuration and allowed hostname', () => {
  for (const overrides of [{ CRAWLER_COLLECTION_ENABLED: 'false' }, { CRAWLER_ALLOWED_HOSTS: '' },
    { CRAWLER_KEY_ID: 'bad' }, { CRAWLER_SIGNING_SECRET: '' },
    { CRAWLER_INGEST_URL: 'http://collector.example/api' }, { CRAWLER_INGEST_URL: 'https://user:password@collector.example/api' }]) {
    assert.equal(createCrawlerObservation(req(), { ...env, ...overrides }), null);
  }
  assert.equal(createCrawlerObservation({ ...req(), url: 'https://preview.vercel.app/' }, env), null);
});

test('known public paths are recorded without query/hash or user data', () => {
  const observation = createCrawlerObservation(req('/pdf-to-black-and-white?filename=secret.pdf#private'), env, 0);
  assert.equal(observation.path, '/pdf-to-black-and-white');
  assert.equal(observation.occurredAt, '1970-01-01T00:00:00.000Z');
  assert.equal(observation.resourceType, 'html');
  assert(!JSON.stringify(observation).includes('secret'));
  for (const path of ['/private.pdf', '/api/send', '/_next/data/build/index.json', '/.env', '/blog/private-customer', '/unknown']) {
    assert.equal(createCrawlerObservation(req(path), env), null);
  }
  for (const variant of variants.VARIANTS) assert(createCrawlerObservation(req(`/blog/${variant.slug}`), env));
});

test('robots and sitemap are distinguished from HTML', () => {
  assert.equal(createCrawlerObservation(req('/robots.txt', {}, 'HEAD'), env).resourceType, 'robots');
  assert.equal(createCrawlerObservation(req('/sitemap.xml'), env).resourceType, 'sitemap');
});

test('normal browser, non-read requests, RSC and prefetch do not enter crawler records', () => {
  for (const request of [req('/', { 'user-agent': 'Mozilla/5.0 Chrome/156 Safari/537.36' }), req('/', {}, 'POST'),
    req('/?_rsc=123'), req('/', { rsc: '1' }), req('/', { 'next-router-prefetch': '1' }),
    req('/', { purpose: 'prefetch' }), req('/', { 'sec-purpose': 'prefetch;prerender' }),
    req('/', { accept: 'text/x-component' }), req('/', { 'sec-fetch-dest': 'empty', accept: '*/*' }),
    req('/', { 'x-nextjs-data': '1' })]) assert.equal(createCrawlerObservation(request, env), null);
  assert(createCrawlerObservation(req('/', { 'sec-fetch-dest': 'document' }), env));
});

test('only the Vercel-owned single IP header is used; local forwarded claims are ignored', () => {
  const headers = { 'x-vercel-forwarded-for': '66.249.66.1', 'x-forwarded-for': '1.1.1.1', 'cf-connecting-ip': '8.8.8.8' };
  assert.equal(createCrawlerObservation(req('/', headers), env).sourceIp, '66.249.66.1');
  assert.equal(createCrawlerObservation(req('/', headers), { ...env, VERCEL: '' }).sourceIp, null);
  assert.equal(createCrawlerObservation(req('/', { 'x-forwarded-for': '66.249.66.1' }), env).sourceIp, null);
  assert.equal(createCrawlerObservation(req('/', { 'x-vercel-forwarded-for': '66.249.66.1, 1.1.1.1' }), env).sourceIp, null);
  assert.equal(createCrawlerObservation(req('/', { 'x-vercel-forwarded-for': '2001:db8::1' }), env).sourceIp, '2001:db8::1');
});

test('each actual request has an independent UUID and no verified claim', () => {
  const a = createCrawlerObservation(req(), env), b = createCrawlerObservation(req(), env);
  assert.notEqual(a.eventId, b.eventId);
  assert.equal(a.verified, undefined);
  assert.equal(a.websiteId, undefined);
});

test('named AI user-triggered fetchers are observed even when their names do not contain bot', () => {
  for (const userAgent of ['ChatGPT-User/1.0', 'Claude-User/1.0', 'Perplexity-User/1.0', 'GPTBot/1.0', 'OAI-SearchBot/1.0', 'NicheFetcher/1.0']) {
    const observation = createCrawlerObservation(req('/about', { 'user-agent': userAgent }), env);
    assert.equal(observation?.userAgent, userAgent);
    assert.equal(observation?.path, '/about');
    assert.equal(observation?.verified, undefined);
  }
});

test('protocol HMAC binds raw body and timestamp using the derived key', () => {
  const derived = crypto.createHash('sha256').update(env.CRAWLER_SIGNING_SECRET).digest('hex');
  const expected = crypto.createHmac('sha256', derived).update('123\n{"version":1}').digest('hex');
  assert.equal(signCrawlerObservation(env.CRAWLER_SIGNING_SECRET, '123', '{"version":1}'), expected);
  assert.notEqual(signCrawlerObservation(env.CRAWLER_SIGNING_SECRET, '124', '{"version":1}'), expected);
});

test('retry reuses the event ID, body and signature, never follows redirects', async () => {
  const sent = [];
  const observation = createCrawlerObservation(req(), env);
  assert.equal(await sendCrawlerObservation(observation, env, async (url, options) => {
    sent.push({ url, options });
    return new Response('', { status: sent.length === 1 ? 503 : 202 });
  }), true);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].options.body, sent[1].options.body);
  assert.deepEqual(sent[0].options.headers, sent[1].options.headers);
  assert.equal(sent[0].options.redirect, 'error');
  assert.equal(sent[0].options.signal.aborted, false);
  assert.equal(JSON.parse(sent[0].options.body).eventId, observation.eventId);
});

test('invalid authentication and site caps are not retried; network failures settle safely', async () => {
  for (const status of [400, 401, 403, 429]) {
    let count = 0;
    assert.equal(await sendCrawlerObservation(createCrawlerObservation(req(), env), env, async () => { count++; return new Response('', { status }); }), false);
    assert.equal(count, 1);
  }
  let count = 0;
  assert.equal(await sendCrawlerObservation(createCrawlerObservation(req(), env), env, async () => { count++; throw Error('offline'); }), false);
  assert.equal(count, 2);
});

test('page proxy returns immediately with locale intact even if observation scheduling fails', async () => {
  const { proxy, config } = compile('../proxy.ts', {
    'next/server': { NextResponse: { next: options => options } },
    './lib/crawler-observations': { observeCrawlerRequest },
  });
  const request = req('/es'); request.nextUrl = new URL(request.url);
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  let pendingObservation;
  globalThis.fetch = async () => { throw Error('isolated offline fixture'); };
  Object.assign(process.env, env);
  try {
    // The waitUntil implementation fails synchronously; the PDF page must still render.
    const result = proxy(request, { waitUntil(promise) { pendingObservation = promise; throw Error('scheduler unavailable'); } });
    assert.equal(result.request.headers.get('x-html-lang'), 'es');
    for (const path of ['/', '/de', '/pdf-to-black-and-white', '/robots.txt', '/sitemap.xml']) {
      assert.equal(unstable_doesProxyMatch({ config, nextConfig: {}, url: `https://pdfdark.org${path}` }), true);
    }
    for (const path of ['/_next/static/chunk.js', '/favicon.ico', '/assets/demo.pdf']) {
      assert.equal(unstable_doesProxyMatch({ config, nextConfig: {}, url: `https://pdfdark.org${path}` }), false);
    }
  } finally {
    // A retry can run after the synchronous proxy returns; keep it isolated too.
    await pendingObservation;
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
  }
});

test('real Next adapter strips Flight hints while proxy preserves Spanish locale without recording RSC or data requests', async () => {
  // Next's server bootstrap provides this global before loading its async stores.
  const originalAsyncLocalStorage = globalThis.AsyncLocalStorage;
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  const { adapter } = await import('next/dist/server/web/adapter.js');
  const { NextResponse } = await import('next/server.js');
  const { proxy } = compile('../proxy.ts', {
    'next/server': { NextResponse },
    './lib/crawler-observations': { observeCrawlerRequest },
  });
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;
  let scheduled = 0;
  let sent = 0;
  globalThis.fetch = async () => { sent++; return new Response(null, { status: 202 }); };
  Object.assign(process.env, env);
  try {
    for (const input of [
      { url: 'https://pdfdark.org/es?_rsc=normal-navigation', headers: { rsc: '1', 'sec-fetch-dest': 'empty' } },
      { url: 'https://pdfdark.org/es?_rsc=link-prefetch', headers: { rsc: '1', 'next-router-prefetch': '1', 'sec-fetch-dest': 'empty' } },
      { url: 'https://pdfdark.org/_next/data/build/es.json', headers: { 'x-nextjs-data': '1' } },
    ]) {
      const result = await adapter({
        page: '/proxy',
        request: {
          url: input.url,
          method: 'GET',
          headers: { 'user-agent': 'Googlebot/2.1', accept: '*/*', ...input.headers },
          nextConfig: {},
        },
        handler(request, event) {
          assert.equal(new URL(request.url).pathname, '/es');
          assert.equal(new URL(request.url).searchParams.has('_rsc'), false);
          assert.equal(request.headers.get('rsc'), null);
          assert.equal(request.headers.get('next-router-prefetch'), null);
          return proxy(request, { waitUntil(promise) { scheduled++; event.waitUntil(promise); } });
        },
      });
      await result.waitUntil;
      assert.equal(result.response.headers.get('x-middleware-request-x-html-lang'), 'es');
      if (input.headers.rsc) assert.equal(result.response.headers.get('x-middleware-request-rsc'), '1');
    }
    assert.equal(scheduled, 0);
    assert.equal(sent, 0);
  } finally {
    process.env = originalEnv;
    globalThis.fetch = originalFetch;
    if (originalAsyncLocalStorage === undefined) delete globalThis.AsyncLocalStorage;
    else globalThis.AsyncLocalStorage = originalAsyncLocalStorage;
  }
});
