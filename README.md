# Finance Simulator Rebuild

This workspace is the clean rebuild target for the classroom finance simulator.

## What Is Included

- `apps/web`: React frontend for student, teacher, screen, print, archive, and round review pages
- `apps/server`: Node HTTP backend with classroom flow, settlement, history, archive, export, and screen APIs
- `packages/shared`: shared app types
- `packages/rules`: settlement and scoring rules
- `data`: module config and event master data
- `scripts/smoke.mjs`: end-to-end smoke script for a local classroom loop

## Core Features

- Teacher creates a classroom and controls the round lifecycle
- Students join with a room code and choose roles
- Macro events, 1d6 personal events, and settlement explanations are wired in
- Debt, preparedness, insurance, vehicle, housing, family, tax, retirement, and legacy modules are active
- Teacher views include history, round detail, archive, print view, export, and live screen
- Runtime persistence supports file storage by default and PostgreSQL when `DATABASE_URL` is provided

## Local Run

Install dependencies:

```powershell
npm install
```

Runtime requirement:

- `Node 18+` works for this project
- Render deployment target is `Node 22`

Run the server:

```powershell
npm run dev:server
```

Run the web app in another terminal:

```powershell
npm run dev:web
```

Default URLs:

- Server: `http://localhost:3100`
- Web: `http://localhost:5173`

Production-style single service run after build:

```powershell
npm start
```

In production, the Node server serves both:

- API routes under `/api/*`
- built frontend assets from `apps/web/dist`
- SPA fallback for browser routes like `/student`, `/teacher`, and `/screen`

## Build

```powershell
npm run build
```

## Smoke Test

Start the server first, then run:

```powershell
npm run smoke
```

If your Windows environment hits a `EPERM ... lstat C:\Users\...` issue when Node tries to execute a script file directly, use the PowerShell fallback:

```powershell
npm run smoke:windows
```

The smoke script verifies:

- teacher room creation
- round open
- student join
- dice roll
- decision submit
- lock
- settle
- teacher history
- teacher round detail
- student round review
- live screen payload

## Storage Modes

Default file persistence:

- `apps/server/.data/repository.json`

Optional runtime modes:

- `STORE_MODE=memory` for pure in-memory development
- `DATABASE_URL=...` for PostgreSQL persistence
- `.env.example` for local environment setup

## Module Config

Module flags are loaded from:

- `data/module-config.example.json`

Current optional modules include:

- `realestate`
- `tax`
- `retirement`
- `legacy`

## Reference Docs

Use the parent project docs in `../docs/` as the source of truth for product scope, rules, data model, APIs, UI, and rebuild plan.

## Deploy

For production deployment steps, environment variables, and final verification, use:

- [DEPLOY.md](C:/Users/yohon/Documents/Playground/finance-simulator-rebuild/DEPLOY.md)
