# Developer Inbox

Private **PWA inbox** for contact messages from a personal portfolio site. A companion frontend to a Next.js portfolio: visitors submit the contact form on the site; this app lets the owner read, organize, and reply to messages in real time.

Built for a **single authenticated user** — not a multi-tenant product.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20FCM-ffca28?logo=firebase&logoColor=black)

## Highlights

- Realtime inbox with search, filters, and sorting
- Message detail view with read / star / archive actions
- Email replies through a portfolio backend API
- FCM push notifications and installable PWA
- Offline-aware UI when connectivity drops
- React 19, TypeScript, Zustand, Tailwind CSS 4

## Features

| Area | Description |
|------|-------------|
| **Inbox** | Live updates — inbox, unread, important, archived |
| **Search & sort** | Find messages; sort by date, unread, or importance |
| **Message detail** | Full message body and metadata |
| **Reply** | Send a reply from the app (handled by the portfolio backend) |
| **Push** | FCM alerts for new messages (background + foreground) |
| **PWA** | Installable app with service worker support |

## Tech stack

- **UI**: React 19, React Compiler, React Router 7, Tailwind CSS 4, Radix UI (shadcn-style primitives)
- **State**: Zustand with memoized selectors for derived inbox lists
- **Services**: Firebase Authentication, Cloud Firestore, Firebase Cloud Messaging
- **Tooling**: Vite 8, TypeScript 6, ESLint, Vitest, vite-plugin-pwa

## Project structure

```
src/
├── app/
│   ├── components/     # UI layouts and inbox screens
│   ├── features/       # Inbox types, routing, selectors
│   ├── hooks/          # App controllers and document title
│   ├── pages/          # Shell and login
│   ├── push/           # FCM registration and notification helpers
│   ├── notifications/  # In-app toast fallback
│   └── store/          # Auth, messages, and push state
├── styles/             # Theme and typography
└── utils/              # Firebase and API helpers
```

## Getting started

### Prerequisites

- Node.js 20+
- Firebase project (shared with the portfolio site)
- Portfolio backend with contact and reply endpoints configured

### Install & run

```bash
npm install
cp .env.example .env
# fill in values from .env.example
npm run dev
```

Development server: [http://localhost:5173](http://localhost:5173).

Configuration details are documented in [`.env.example`](./.env.example) (not committed: your local `.env`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Vitest (watch) |
| `npm run test:run` | Vitest (single run) |
| `npm run test:coverage` | Coverage report |

## Bundle (production build)

Measured with `npm run build` (Vite 8 + Rolldown code splitting). Gzip sizes from the build report.

| Chunk | Gzip | Loaded on |
|-------|------|-----------|
| `index` (router, bootstrap, providers) | ~3.5 kB | Every page |
| `firebase-auth` | ~25 kB | Sign-in and inbox |
| `vendor` (React, Radix, Sonner, …) | ~130 kB | Shared |
| `LoginPage` | ~2 kB | `/login` only |
| `firebase-firestore` | ~99 kB | Inbox route (lazy) |
| `firebase-messaging` | ~6.6 kB | Push enable / FCM (lazy) |
| `InboxShell` | ~14 kB | Inbox route (lazy) |
| `DesktopInboxLayout` or `MobileInboxLayout` | ~2–3 kB | One layout per viewport (lazy) |

**Sign-in critical path** (excluding shared vendor): about **29 kB gzip** for `index` + `firebase-auth`. Firestore and FCM are not preloaded on `/login`.

**PWA precache** (full offline shell): about **1 MB** including Workbox, CSS, and icons.

## Tests

Unit tests ([Vitest](https://vitest.dev/) + Testing Library) cover inbox selectors, routing, API helpers, and selected UI components.

```bash
npm run test:run
```

## Design

Dark glassmorphism UI aligned with the portfolio theme. Layout inspiration: [Figma — Premium Engineering Inbox Design](https://www.figma.com/design/rH8forvmQLubuW6tn0mu8r/Premium-Engineering-Inbox-Design). UI primitives follow [shadcn/ui](https://ui.shadcn.com/) patterns — see [ATTRIBUTIONS.md](./ATTRIBUTIONS.md).

## License

Private pet project — all rights reserved unless an open-source license is added.
