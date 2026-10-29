# Crawler observations

PDF Dark can forward a bounded sample of self-declared crawler requests to the private
yj-pulse crawler report. Collection is **off by default**. Existing JavaScript analytics
and PDF processing do not depend on this collector.

## Server configuration

Generate an ingest key for the PDF Dark website in the yj-pulse Crawlers report. Configure
these server environment variables on the PDF Dark deployment (never `NEXT_PUBLIC_*`):

```dotenv
CRAWLER_COLLECTION_ENABLED=true
CRAWLER_INGEST_URL=https://yj-pulse.vercel.app/api/crawlers/ingest
CRAWLER_KEY_ID=<key ID returned once by the administrator action>
CRAWLER_SIGNING_SECRET=<secret returned once by the administrator action>
CRAWLER_ALLOWED_HOSTS=pdfdark.org,www.pdfdark.org
```

Only explicitly allowed hosts are observed. Preview deployments are excluded unless
their hostname is deliberately configured. On Vercel, source IP comes only from the
Vercel-controlled `x-vercel-forwarded-for` header. On local/other deployments it is
`null`; arbitrary forwarded headers do not establish a verified identity. A proxy in
front of Vercel can hide the crawler's original source and cause an unverified result.

## Scope and failure behavior

- Known public page routes, `robots.txt` and `sitemap.xml`; GET/HEAD only. An explicit
  public-page allowlist avoids capturing arbitrary paths and document names. New public
  routes need adding to the allowlist (blog registry entries are included automatically).
- Candidate bot UA only. Normal browser visitors are not proved human by this exclusion.
- Browser RSC, prefetch, data and non-document fetches do not become HTML crawl records.
  Locale processing still runs for those requests.
- No query/hash, PDF content, uploaded files, filename, final HTTP status or render time.
- Background `waitUntil`, 1.5-second timeout per attempt, at most two attempts with the
  same event ID. Authentication errors and quota rejections are not retried. Redirects
  are refused. Up to eight background requests and 60 events/minute per process provide
  additional best-effort backpressure; yj-pulse applies transactional site-wide caps.
- Collector/configuration failures cannot change the page response or emit a Sentry bug.
  `waitUntil` is not a durable queue: network/process failures can lose observations.

The report means a request reached this entry point. It cannot establish a successful
page response, indexing, AI citation, complete crawl coverage or the share of humans.
Outer CDN/WAF/cache responses can bypass this code. AI referral traffic remains a
separate JavaScript analytics concept.

## Protocol and rollback

Protocol v1 signs `timestamp + "\n" + raw JSON` with HMAC-SHA256. Both sides derive the
HMAC key as the UTF-8 hexadecimal SHA256 of the one-time raw secret. The derived key is
itself a credential; the collector encrypts it at rest. The timestamp window is five
minutes and retries reuse the UUID. A key is bound to one website and its configured
domain; payloads cannot choose a website or assert that an identity is verified.

Deploy the receiver/migration before enabling the producer. Disable collection by
setting `CRAWLER_COLLECTION_ENABLED=false` and redeploying; the existing page and
analytics behavior remains available. Revoke a compromised key in yj-pulse immediately,
then generate and deploy a replacement. No paid log drains or new scheduled tasks are used.

Source IP trust follows [Vercel request headers](https://vercel.com/docs/headers/request-headers).
Collector identity evidence and retention are documented in the yj-pulse repository's
`docs/crawler-observations.md`.
