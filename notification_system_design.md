# Notification System — Design

## 1. Goal

Build a small but production-shaped notification platform that lets a sender
deliver a message to a recipient over one of several channels (in-app, email,
SMS), and lets the recipient view, mark read, archive, or delete it. Every
significant lifecycle event is recorded through the shared **logging
middleware** so that the entire flow can be reconstructed months later from
logs alone.

## 2. Scope

In scope:
- Create / list / status-update / delete notifications.
- In-memory persistence (swappable for a real DB without changing the service
  surface).
- Backend (Express + TypeScript) + Frontend (React + Vite + TypeScript).
- Cross-cutting structured logging via the reusable `logging-middleware`
  package.

Out of scope (called out explicitly so reviewers don't assume gaps are bugs):
- Real authentication of end users (we treat user IDs as opaque strings).
- Actual email/SMS delivery — the `channel` field is recorded but no third
  party provider is invoked.
- Horizontal scaling, persistence durability, retries on send.

## 3. Architecture

```
┌────────────────┐   HTTP/JSON    ┌────────────────────┐
│ notification_  │ ─────────────▶ │ notification_app_be│
│ app_fe (React) │ ◀───────────── │ (Express)          │
└──────┬─────────┘                └──────┬─────────────┘
       │                                 │
       │ Log(stack, level, pkg, msg)     │ Log(stack, level, pkg, msg)
       ▼                                 ▼
            ┌────────────────────────────────────┐
            │     logging-middleware (npm pkg)   │
            └─────────────────┬──────────────────┘
                              │ POST (Bearer token)
                              ▼
            http://20.207.122.201/evaluation-service/logs
```

Both apps depend on the **same** `logging-middleware` package, so the wire
format and validation rules can never drift between client and server.

## 4. Data model

`Notification`

| field        | type                                        | notes                          |
| ------------ | ------------------------------------------- | ------------------------------ |
| id           | UUID v4                                     | server generated               |
| senderId     | string                                      | opaque user id                 |
| recipientId  | string                                      | opaque user id                 |
| title        | string (non-empty)                          |                                |
| body         | string (non-empty)                          |                                |
| channel      | `in_app` \| `email` \| `sms`                | delivery channel               |
| status       | `unread` \| `read` \| `archived`            | starts as `unread`             |
| createdAt    | ISO 8601                                    | server generated               |
| readAt       | ISO 8601 \| null                            | set on first transition→read   |

## 5. API

| Method | Path                                  | Purpose                              |
| ------ | ------------------------------------- | ------------------------------------ |
| POST   | `/api/notifications`                  | Create a notification                |
| GET    | `/api/notifications?recipientId=…`    | List for a recipient (newest first)  |
| PATCH  | `/api/notifications/:id/status`       | Body `{ status }` — read / archived  |
| DELETE | `/api/notifications/:id`              | Permanently remove                   |
| GET    | `/health`                             | Liveness probe                       |

All non-trivial responses are JSON. Invalid input returns `400` with
`{ error: "…" }`. A missing resource returns `404`.

## 6. Layered responsibilities (and their `package` tag in logs)

| Layer            | File                              | `package` value used in `Log()` |
| ---------------- | --------------------------------- | ------------------------------- |
| HTTP routing     | `routes/notificationRoutes.ts`    | `route`                         |
| Request handler  | `controllers/notificationController.ts` | `handler`                 |
| Business rules   | `services/notificationService.ts` | `service`                       |
| Persistence      | `db/notificationRepository.ts`    | `repository` / `db`             |
| Cross-cutting    | `middleware/loggingMiddleware.ts` | `middleware`                    |
| Bootstrap        | `index.ts`                        | `config`                        |

The frontend mirrors this with `api`, `hook`, `component`, `page`, `style`,
`utils`. The mapping is explicit so that a future developer reading a log
stream immediately knows which file to open.

## 7. Logging strategy

Logs are **the narrative of the application's execution**, not just an error
sink. We emit:

- `debug` — request entered router; repository read counts.
- `info`  — successful state transitions (created, marked read, archived,
            deleted); boot events.
- `warn`  — recoverable anomalies (missing recipient on delete, empty body in
            composer).
- `error` — handler/service exceptions, API failures, type mismatches.
- `fatal` — unhandled errors caught by the Express error middleware,
            uncaught browser errors trapped on `window`.

Every log includes a precise `package` so a search like
`level=error AND package=db` immediately points to the persistence layer.

The middleware **never throws** — a failed network call returns `null` and
prints a console warning. Logging cannot be allowed to break the app it is
trying to observe.

## 8. Validation

The middleware validates `stack`, `level` and `package` against the spec's
allow-lists **before** the network call, so a typo in a developer's `Log()`
call is caught locally and never wastes a quota-bound request to the
protected route. All values are lower-cased automatically.

## 9. Failure modes considered

| Scenario                             | Behaviour                                           |
| ------------------------------------ | --------------------------------------------------- |
| Log API token missing                | Boot warns; logs validate but aren't sent.          |
| Log API returns 401/5xx              | Warning to console; app continues normally.         |
| Notification with empty title/body   | Service throws → controller returns 400.            |
| Status update on missing id          | `repository` logs error; controller returns 404.    |
| Uncaught error in route handler      | `errorMiddleware` logs `fatal` + returns 500.       |
| Uncaught browser error               | `window.onerror` logs `fatal` from `utils`.         |

## 10. Why these choices

- **Reusable middleware as a separate package**, not just a function in each
  app, because the spec demands it and because any drift between the BE and
  FE log format would defeat the purpose of structured logs.
- **In-memory store** because the assignment is graded on structure, logging
  discipline and code quality — not on infra. The repository interface is
  small enough that swapping in Postgres is a one-file change.
- **Express + Vite + React** because they are the most boring, well-known
  TypeScript stacks; nothing exotic to debug in a campus-hire submission.
- **Layered logging tags** so log search is precise rather than full-text.
- **Lower-casing in the middleware** so every caller is correct by default
  and we never get a 400 from the protected route over a casing typo.
