# Local Pulse build integration

`yj-pulse-error-sdk-0.1.1.tgz` is a portable local package from the existing
`yj-pulse` SDK. It is used only by `next.config.ts`; PDF processing and the
existing browser tracker continue through their current entry points.

Without upload configuration the Pulse wrapper returns the existing Next/Sentry
configuration unchanged. To enable private source maps for a production build,
configure these **server/build-only** variables:

```dotenv
YJ_PULSE_SOURCE_MAPS=true
YJ_PULSE_URL=https://yj-pulse.vercel.app
YJ_PULSE_WEBSITE_ID=213aef26-7819-41db-9f70-6e19168da1ba
YJ_PULSE_API_KEY=<server-only artifact upload key>
YJ_PULSE_RELEASE=<unique label for this exact source snapshot>
```

An existing `NEXT_PUBLIC_PULSE_RELEASE` can supply the release if
`YJ_PULSE_RELEASE` is absent; the final fallback is `VERCEL_GIT_COMMIT_SHA`.
The plugin freezes the chosen value and injects only that public release label,
so the collector and artifacts use the same label. The key is never put in a
`NEXT_PUBLIC_*` variable. Missing/invalid configuration or failed uploads abort
an explicitly enabled production build.

The existing Sentry upload hook runs first and retains its maps when Pulse is
enabled. Pulse reads each real client/worker script's `sourceMappingURL`, uploads
under that script's actual asset path (including shared-map references), and removes all
public client `.map` files, including CSS maps, after every upload succeeds.
No uploader runs in `next dev`.

The Next/Sentry single-section map wrapper is flattened with its generated-line
offset preserved. More complex indexed maps are rejected rather than approximated.
Maps over the platform's 2 MiB per-file limit omit optional inline
`sourcesContent` in the uploaded copy while retaining exact source names,
function names and line/column mappings. This accommodates the PDF.js maps;
application maps below the limit keep their code context. The original files
remain complete for Sentry's earlier upload. Oversized mapping data still fails
the build instead of silently losing an artifact.

For local acceptance use only a loopback artifact endpoint and a test-only key.
Do not point a local test at the production artifact endpoint.

The package must be rebuilt and repacked after shared tracker/SDK changes, then
the local file dependency integrity in `package-lock.json` must be refreshed.
The package is a local integration snapshot, not an npm publication. Deployment
and verification records are maintained separately in the project's ops reports.
