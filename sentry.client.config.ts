import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn:
    process.env.SENTRY_DSN ||
    "https://1d7329a9488a29963e2ab4eec03fdd81@o4504938061955072.ingest.us.sentry.io/4509999364046848",
  sendDefaultPii: true,
  integrations: [],
})
