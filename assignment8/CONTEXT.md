# Assignment 8 – Context Summary

Use this file in another folder or paste into a new chat so the next session has full context.

---

## Repo layout

- **assignment8/** – root (package.json: zip, install-*, start-*)
- **assignment8/backend/** – Node API, Docker Postgres, tests
- **assignment8/frontend/** – React (Vite, MUI), unit tests, coverage
- **assignment8/e2e/** – Puppeteer + Vitest e2e tests

---

## Frontend

- **App.jsx** – Exported `AppRoutes` (used by e2e with MemoryRouter). `App` wraps with `BrowserRouter`.
- **AuthContext.jsx** – Exported `AuthContext` for tests that inject `user: null`.
- **NotFoundPage.jsx** – 404 page; tested in `__tests__/NotFoundPage.test.jsx`.
- **Coverage** – 100% stmts/branch/funcs/lines. Added:
  - `NotFoundPage.test.jsx` – render with MemoryRouter, assert message + Go to Home link.
  - HomePage tests: invalid group (MemoryRouter + AppRoutes + localStorage auth), groups API non-array, groups !ok after unmount, groups throw after unmount, user null app bar (AuthContext.Provider).
  - PostCard test: post with `groupId` + `groups` prop for “Group Post by … into …”.
  - Helper `unmountThenSettleGroups(settleGroups)` in HomePage.test.jsx (CPD); JSDoc uses typedef `UnmountSettleGroupsArg` (object/Error, no `*`).
- **Lint** – 80-char max, single quotes, indent, JSDoc (no bare `Function`, no `*`, describe params).
- **.gitignore** (assignment8 root) – `coverage/`, `**/coverage/`, `**/copypaste/`, `node_modules/`, etc.

---

## Backend

- Groups use UUIDs; posts filtered by membership; `authorDisplayName` on post response (join users).
- No major structural changes from this context.

---

## E2E (e2e/test/)

- **auth.e2e.test.js** – Single file: starts Express frontend server (static + SPA fallback via `app.use`), Puppeteer, backend health check. No `app.get('*')` (path-to-regexp issue); use `app.use((_req, res) => res.sendFile('index.html', { root: distDir }))`.
- **Port** – Frontend: 3000 (or `E2E_FRONTEND_PORT`). Backend: 3010.
- **Isolation** – Each test uses `browser.newPage()` and `ensureLoginScreen(page)` (goto, clear localStorage/sessionStorage, reload) so every test sees the login form. No `createIncognitoBrowserContext` (not in this Puppeteer version).
- **Helpers** – `startFrontendServer()`, `ensureLoginScreen(page)`, `loginAsMolly(page)` (wait email input, type, submit, wait “Welcome to your feed” 20s).
- **Tests** – Authentication (login → home), Posts feed (Molly/Anna seeded text), Group posts (click Books Club → URL + content; direct nav to group URL), Responsiveness (mobile viewport, menu button).
- **Running** – Backend and Docker (Postgres) must be running first. Then: `cd e2e && npm run build && npm run e2e`. Do **not** run full `npm test` if backend is already up (it does `docker compose down && up` and can break the backend’s DB connection).
- **setup.js** – `vi.setConfig({ testTimeout: 20000 })`; LF line endings (not CRLF) or ESLint linebreak-style fails.
- **BOOKS_CLUB_GROUP_ID** – `a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d` (from backend seed).

---

## Copy-paste / CPD

- Frontend: `npm run cpd` (jscpd). Duplication removed by `unmountThenSettleGroups` in HomePage.test.jsx.

---

## Quick commands

- Frontend: `npm test` (unit + coverage), `npm run cpd`, `npm run lint`
- Backend: `npm test`
- E2E (with backend already running): `cd e2e && npm run build && npm run e2e`
