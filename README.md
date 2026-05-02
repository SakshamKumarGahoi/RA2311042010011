# RA2311042010011

Submission for the Afford Medical Full-Stack track.

## Layout

```
.
├── logging_middleware/         reusable Log() package (TypeScript)
├── notification_app_be/        Express + TS backend, uses logging_middleware
├── notification_app_fe/        React + Vite + TS frontend, uses logging_middleware
└── notification_system_design.md
```

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A Bearer token for the protected Log API
  (`http://20.207.122.201/evaluation-service/logs`). Obtain it from the
  Afford Medical auth endpoint after registering with your `clientID` and
  `clientSecret`.

## Setup — do these in order

### 1. Build the logging middleware

```bash
cd logging_middleware
npm install
npm run build
cd ..
```

This produces `logging_middleware/dist/`. The two apps reference this folder
directly via `"logging-middleware": "file:../logging_middleware"` in their
`package.json`, so any rebuild here is picked up automatically.

### 2. Run the backend

```bash
cd notification_app_be
cp .env.example .env       # then paste your Bearer token into LOG_API_TOKEN
npm install
npm run dev                # boots on http://localhost:4000
```

Health check: `curl http://localhost:4000/health` → `{"ok":true}`.

### 3. Run the frontend

In a second terminal:

```bash
cd notification_app_fe
cp .env.example .env       # paste the same token into VITE_LOG_API_TOKEN
npm install
npm run dev                # boots on http://localhost:5173
```

Open http://localhost:5173. The default user id is `user_alice`. Use the
composer to send yourself a notification — every action emits structured
logs via the middleware to the protected Log API.

## Smoke-test the API directly

```bash
# create
curl -X POST http://localhost:4000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "senderId":"user_admin",
    "recipientId":"user_alice",
    "title":"Welcome",
    "body":"Hello from the API",
    "channel":"in_app"
  }'

# list
curl "http://localhost:4000/api/notifications?recipientId=user_alice"

# mark read (replace <id>)
curl -X PATCH http://localhost:4000/api/notifications/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status":"read"}'

# delete
curl -X DELETE http://localhost:4000/api/notifications/<id>
```

## What gets logged where

| Layer (backend)         | `package` tag |
| ----------------------- | ------------- |
| Express routes          | `route`       |
| Express controllers     | `handler`     |
| Service layer           | `service`     |
| Repository / store      | `repository`, `db` |
| Cross-cutting middleware| `middleware`  |
| Bootstrap / config      | `config`      |

| Layer (frontend) | `package` tag |
| ---------------- | ------------- |
| Axios client     | `api`         |
| Custom hooks     | `hook`        |
| UI components    | `component`   |
| Pages            | `page`        |
| Global error trap| `utils`       |
| Boot             | `config`      |

See `notification_system_design.md` for the full design rationale.

## Submission checklist

- [x] `logging_middleware/` folder exists at repo root
- [x] `notification_system_design.md` at repo root
- [x] `notification_app_be/` folder
- [x] `notification_app_fe/` folder
- [x] `.gitignore` includes `node_modules` (already present in each app folder)
- [x] Repository is **public** and named after your **roll number**
