# PDF usage, errors and performance monitoring

No URL, target-keyword or positioning change. Existing Umami source/website ID and Sentry DSN environment variables are reused; no new secret or SaaS service required.

## Destinations and events

**Umami**: existing pageview analytics plus custom events. The actual deployed self-hosted tracker `https://yj-pulse.vercel.app/p.js` already includes a native `data-performance` option, a `performance` event payload and `/api/p` collection. Enable `data-performance="true"` rather than duplicating Web Vitals observers. It observes navigation/paint/LCP/layout-shift/interaction entries and submits performance data on its timer/pagehide/route change. Native collector reports timing fields in milliseconds, CLS as a score, plus view duration. These are actual client measurements, not the old SEO script's deterministic estimates. No claim of Google CrUX availability or identical metric aggregation across vendors.

| Custom event | Meaning |
|---|---|
| `pdf_start` | Operation begins |
| `pdf_success` | Operation completes; includes `duration_ms` |
| `pdf_error` | Operation/preview/sample failure; reason=`invalid`, `password` or `processing` |
| `pdf_cancel` | Interrupted by user, file replacement or navigation; separate from failure |
| `pdf_download` | Browser download requested, **not proof the user saved the file** |

Dimensions: `tool`=reader/invert/monochrome/deskew/whiten; `stage`=read/prepare/export/preview/sample; `input`=file/sample; canonical allowlisted `page`; page count; coarse input/output size buckets under1MB/1–10MB/10–50MB/50MB+. No names, PDF text, page images, raw errors, full performance entries, document URLs or settings payloads are supplied to custom events. Existing Umami pageview URL/referrer behavior is unchanged.

Reader `read` measures the initial complete render pass. Invert `export` measures automatic rendering/conversion/download preparation. New three tools use `prepare` for opening (deskew includes automatic analysis), then `export` for output preparation/download request. Previews only emit failures, avoiding per-slider success/start spam. Successful sample loads are distinguished by input=sample; failed sample fetches use stage=sample. Lifecycle endpoints are idempotent, so finally/abort do not add a second outcome. Duration is wall time, including browser scheduling/background tabs, not CPU time.

**Sentry**: existing global/server error setup retained. Unexpected handled PDF errors from all five tools now report sanitized `PdfProcessingError`, tags tool/stage, original safe application code frames and existing numeric bitmap diagnostics when available. Known password/invalid inputs and cancellation remain outside Sentry bug reports. Drop console breadcrumbs and local data/blob URLs to prevent parser strings/media leaking through breadcrumbs. Replay masking/blocking remains enabled as previously configured; no new replay or tracing sampling added. `tracesSampleRate` stays0; performance lives in Umami and PDF duration events rather than Sentry tracing. No invented test error sent to the production Sentry project.

After `PDF-DARK-19`, the reader also supplies a fixed `reader_step` for each load/render phase and a numeric page number. All unexpected PDF errors include an allowlisted `original_error_type`; Sentry groups them by tool, stage, safe step and type. Raw exception messages, PDF text, file names and media still do not leave the browser. The original cause of `PDF-DARK-19` cannot be recovered retroactively from its sanitized event.

## Reliability and reading the data

Tracker startup queues at most50 safe events and flushes once the script is ready. Tracker rejection/throw, blocked script or Sentry SDK failure cannot block PDF processing/error UI. Respect the SDK's disabled behavior; no alternate collector/proxy/consent bypass.

In Umami, filter events by tool, stage and input=file to separate user work from demos. Compare export successes/errors/cancellations against starts and inspect numeric duration data. In Sentry, filter `tool` and `stage` to find actual bugs. Umami performance view depends on the deployed server UI supporting the tracker's native performance collection; verify ingestion separately from dashboard access. Browser closure before reporting/ad blockers can undercount; custom events do not provide a durable job ledger or exact conversion rate for unfinished sessions.

## Validation

- Eight meaningful monitoring tests (late/bounded queue, metadata allowlist, tracker failures, single settlement/abort, expected inputs, error redaction/frame preservation, safe error-type and step metadata, SDK failure isolation) plus24 existing pixel/deskew tests.
- Production browser test uses the **actual deployed Umami tracker** with intercepted test collectors and fake DSN, not a fabricated performance payload. Five tools' real success/download events verified, plus invalid input in all five, cancellation, unexpected worker error with sanitized Sentry event, and successful export with the complete analytics script blocked. Native `performance` request observed with actual FCP/LCP.
- Test fixtures are generated documents. Local artifacts `/workspace/pdf-dark-browser-tests/monitoring/`; no real user file uploaded and no fake test Sentry issue sent externally.
- Final production build/TypeScript passed (46 routes). Scoped lint passed; reader checked with its pre-existing set-state-in-effect rule findings excluded, leaving existing reader effect behavior unchanged. Final built app source hashes match checkout. No dependency added and no page copy/SEO changes.
