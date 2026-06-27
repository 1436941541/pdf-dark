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
    denyUrls: [
      /google-analytics\.com/i,
      /googletagmanager\.com/i,
      /clarity\.ms/i,
      /\/gtag\/js/i,
    ],

    tracesSampleRate: 0,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
