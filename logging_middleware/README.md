# logging_middleware

Reusable logging middleware that posts structured logs to the Afford Medical
evaluation Log API (`http://20.207.122.201/evaluation-service/logs`).

Works in **both** Node/Express backends and browser frontends (via axios).

## Install (locally, inside this monorepo)

From `notification_app_be/` or `notification_app_fe/`:

```bash
npm install ../logging_middleware
```

This installs it as a local dependency. After publishing, you would
`npm install logging-middleware` instead.

## Build

```bash
cd logging_middleware
npm install
npm run build
```

## Use

```ts
import { initLogger, Log } from "logging-middleware";

// once, at app startup
initLogger({ authToken: process.env.LOG_API_TOKEN! });

// anywhere
await Log("backend", "info",  "service", "Notification dispatch started");
await Log("backend", "error", "handler", "received string, expected bool");
await Log("backend", "fatal", "db",      "Critical database connection failure.");
```

## Constraints enforced

- `stack`   ∈ `backend | frontend`
- `level`   ∈ `debug | info | warn | error | fatal`
- `package` (backend-only) ∈ `cache, controller, cron_job, db, domain, handler, repository, route, service`
- `package` (frontend-only) ∈ `api, component, hook, page, state, style`
- `package` (both) ∈ `auth, config, middleware, utils`
- All values lower-cased automatically before sending.
- Invalid combinations are rejected client-side with a console warning (the
  call to the API is skipped to avoid wasting protected-route quota).

## Behaviour notes

- **Never throws.** A failed log call returns `null` and prints a warning, so
  logging can never crash the host app.
- Mirrors every accepted log to `console.log` by default (toggle with
  `echoToConsole: false`).
- Default timeout is 5 s.
