# Deploy Guide

## Runtime

- local and production minimum: `Node 18`
- recommended deployment target: `Node 22`

## Local Production Check

1. Install dependencies:

```powershell
npm install
```

2. Build the web and server workspace:

```powershell
npm run build
```

3. Start the single production service:

```powershell
npm start
```

4. Verify:

- [http://localhost:3100/](http://localhost:3100/)
- [http://localhost:3100/health](http://localhost:3100/health)

## Storage

- default: file persistence in `apps/server/.data/repository.json`
- development memory mode:

```powershell
$env:STORE_MODE='memory'; npm start
```

- PostgreSQL mode:

```powershell
$env:DATABASE_URL='postgres://user:password@host:5432/db'; npm start
```

## Render

This project already includes:

- [render.yaml](C:/Users/yohon/Documents/Playground/finance-simulator-rebuild/render.yaml)

Production settings:

- build command: `npm install && npm run build`
- start command: `npm start`
- health path: `/health`
- runtime: `Node 22`

Set the following environment variables in Render:

- `PORT=3100`
- `DATABASE_URL` when using PostgreSQL

Render launch order:

1. Push [finance-simulator-rebuild](C:/Users/yohon/Documents/Playground/finance-simulator-rebuild) to a Git repo
2. Create a new Render Web Service from that repo
3. Confirm Render picks up [render.yaml](C:/Users/yohon/Documents/Playground/finance-simulator-rebuild/render.yaml)
4. Add `DATABASE_URL` if you want PostgreSQL persistence
5. Deploy and verify `/` and `/health`

## Smoke Test

After the server is running:

```powershell
npm run smoke
```

Windows fallback if the local Node runtime has a script-entry `EPERM lstat` issue:

```powershell
npm run smoke:windows
```

The smoke script verifies:

- room creation
- student join
- dice
- decision submit
- lock
- settle
- history
- round detail
- student review
- screen payload

## Release Checklist

- `npm run build` passes
- `npm run smoke` passes against a running server
- `/` serves the SPA
- `/health` returns ok
- teacher can open, lock, settle, archive, and reset a room
- students can join, submit, and review ledgers
