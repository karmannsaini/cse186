# Assignment 8 Setup

## Required local file

Create `backend/.env` on each machine.
You can copy from `backend/.env.example`.

Required keys:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SECRET`

## Run E2E like autograder

From `assignment8/e2e`:

1. `npm test`

This runs frontend build, starts docker DB, and runs vitest e2e.
If `backend/.env` is missing, the run fails early with a clear message.
