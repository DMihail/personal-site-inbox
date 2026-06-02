# Developer Inbox

PWA inbox for contact messages: realtime list, filters, replies via a backend API, and optional FCM push. Built for a **single authenticated operator**, not multi-tenant use.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20FCM-ffca28?logo=firebase&logoColor=black)

## Features

- Firestore-backed inbox with search, filters, and sorting
- Responsive desktop, mobile, and tablet layouts
- Email replies through a configurable HTTP API
- FCM push (optional) with in-app toast fallback
- Installable PWA with offline shell
- **Telegram Mini App** — same inbox inside Telegram (see [docs/telegram-mini-app.md](./docs/telegram-mini-app.md))

## Tech stack

React 19 (React Compiler, `useActionState`, `useFormStatus`), React Router 7, Tailwind CSS 4, Radix UI, Zustand, Firebase Auth / Firestore / FCM, Vite 8, Vitest.

## Project structure

```
src/           Application code
tests/         Vitest specs, fixtures, setup, and test config (isolated from src/)
public/        Static assets and generated messaging service worker
.github/       CI — tests run on every push and pull request
.githooks/     Optional local pre-push hook (see Tests)
```

Path aliases: `@/` → `src/`, `@tests/` → `tests/`, `@security/headers` → `security-headers.ts` (see `alias.config.ts`).

## Setup

**Prerequisites:** Node.js 20+, Firebase project, companion HTTP API for replies and optional server-sent FCM (e.g. a Next.js portfolio backend with `/api/inbox/reply` and `/api/inbox/test-push`).

```bash
npm install
cp .env.example .env
# fill in .env — see .env.example
npm run dev
```

Default dev URL: [http://localhost:5173](http://localhost:5173)

Local API (optional): run the backend on port 3000 and set `VITE_PORTFOLIO_API_URL=http://localhost:3000` — Vite proxies `/api` to avoid CORS.

Deploy Firestore security rules when using Firebase:

```bash
firebase deploy --only firestore:rules
```

FCM tokens are stored per device at `fcmTokens/{uid}/devices/{deviceId}` so push can reach every phone and browser. Update the portfolio API to send to all tokens — see [docs/fcm-multi-device-backend.md](./docs/fcm-multi-device-backend.md).

### Telegram Mini App

Point your bot’s menu button Web App URL to this deployment (`https://…`). Sign-in is unchanged (Firebase email/password). Browser push is disabled inside Telegram; use portfolio Telegram notifications or the installed PWA for FCM. Setup: [docs/telegram-mini-app.md](./docs/telegram-mini-app.md).

## Security (public deployment)

This app is a **single-operator** inbox, not multi-tenant. Before going public:

- Restrict Firebase Authentication (no open sign-up; one or few allowed accounts).
- Deploy `firestore.rules` and keep `INBOX_ALLOWED_UIDS` (or equivalent) on your API backend.
- Set `VITE_ZUSTAND_STORAGE_KEY` in production (persist is skipped without it).
- Client state uses **IndexedDB** with [`navigator.storage.persist()`](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist) on iOS and Android (legacy `localStorage` keys migrate on first read). Offline Firestore cache is capped at **48 MiB**; Workbox image cache up to **100** entries / **30** days (`src/pwa/storageBudgets.ts`, Workbox limits in `workboxCacheLimits.js`). `sessionStorage` is only used for ephemeral UI dismiss flags.
- Firebase web config in `.env` is visible in the client bundle — restrict API keys by domain in Firebase Console.
- Do not commit `.env`; only `.env.example` belongs in git.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test:run` | Vitest (CI) |
| `npm run test` | Vitest (watch) |

## Tests

All specs live under `tests/` (mirrors `src/` layout). Application code in `src/` has no `*.test.*` files.

```bash
npm run test:run
```

**On push (GitHub):** workflow `.github/workflows/ci.yml` runs typecheck, lint, tests, and build.

**Local pre-push hook (optional):**

```bash
chmod +x .githooks/pre-push
git config core.hooksPath .githooks
```

After that, `git push` runs `npm run test:run` locally before the push completes.

## UI

Dark glassmorphism theme. Form and layout primitives follow [shadcn/ui](https://ui.shadcn.com/) patterns — see [ATTRIBUTIONS.md](./ATTRIBUTIONS.md).

## License

Add a `LICENSE` file (e.g. MIT) if you want others to use or fork this code. Without it, the repository is public but not clearly open-source.
