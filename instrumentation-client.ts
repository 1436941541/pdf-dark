import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,

    // Privacy defaults — we don't want PII or user profiling
    sendDefaultPii: false,

    // Only record a replay when something actually breaks.
    // Normal sessions = 0%, sessions that hit an error = 100%.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        // Hide every bit of user content from the replay:
        //   - text (PDF file names, any on-page copy)
        //   - form inputs
        //   - images + canvas (the rendered PDF itself)
        maskAllText: true,
        maskAllInputs: true,
        blockAllMedia: true,
      }),
    ],

    // Ad-blockers / privacy extensions kill GA + Clarity requests; treat as noise, not a bug.
    // Crypto wallet extensions (MetaMask, Enkrypt, ...) inject a script into every
    // page to expose window.ethereum — their internal errors have nothing to do
    // with this site but still fire in the page's global error handler.
    denyUrls: [
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
      /clarity\.ms/i,
      /\/gtag\/js/i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^safari-web-extension:\/\//i,
    ],
    ignoreErrors: [
      /MetaMask/i,
      /webext-bridge/i,
      /enkrypt/i,
    ],

    tracesSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
