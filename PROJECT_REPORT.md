# PROJECT_REPORT.md — Cinematic

**Technical Report & Executive Summary**
*Repository: `cinematic-streaming-platform-ui` · Main branch · Report date: September 2026*

---

## 1. Project Overview

**Cinematic** is a modern **UI/UX showcase web application** — a full streaming-platform
interface (movies · TV series · anime) built to demonstrate production-grade frontend
craft: cinematic dark design language, motion-rich interactions, account-aware state
management, and a secure full-stack architecture.

The application reproduces the experience of a premium streaming service (Netflix-class
information architecture) while remaining a **portfolio/educational project**: it never
hosts or stores any copyrighted media — all metadata, artwork, and trailers are fetched
at runtime from public third-party APIs (TMDB).

**Live Demo:** https://cinematic-streaming-platform-ui.vercel.app

What makes it more than a static mock-up:

- A real **Express + MongoDB backend** (auth, JWT sessions, watchlist API, TMDB proxy)
  deployed as a Vercel serverless function.
- **Account-isolated state**: profiles, active profile, PIN locks, and watchlists are
  scoped per authenticated user — verified end-to-end by automated Playwright tests.
- **Graceful degradation**: bundled demo data + clean fallback panels keep the UI alive
  even when upstream APIs fail.

---

## 2. Tech Stack & Architecture

### Frontend

| Layer | Technology |
| --- | --- |
| UI library | **React 19** + **TypeScript** (strict `tsc --noEmit` clean) |
| Build tooling | **Vite 7** with `vite-plugin-singlefile` (single-file `dist/index.html` bundle, ~688 kB) |
| Styling | **Tailwind CSS 4** (`@tailwindcss/vite`), custom design tokens (ink/neon palettes) |
| Animation | **framer-motion** (page transitions, modal choreography, hover states) |
| Icons | **lucide-react** |
| Routing | **React Router 7** (`BrowserRouter`, deep routes such as `/title/:type/:id`) |
| State persistence | **`localStorage`** — session token, user object, per-account profiles, per-profile watchlists, display language |
| Analytics | **Google Analytics 4** via `react-ga4` — initialized only when `VITE_GA_ID` is present (no hardcoded measurement ID) |

> **Note:** this is a **Vite + React SPA**, not a Next.js application. There is no
> server-side rendering layer; routing and state are handled entirely client-side and
> the production build is inlined into one HTML file for fast cold loads.

### Backend (Node.js)

- **Express 5** (`backend/server.js`) mounted serverless through `api/index.js` on Vercel
  (`vercel.json` rewrites `/api/*` → the function, everything else → SPA fallback).
- **Route groups**
  - `/api/auth` — register, login, Google Sign-In (token verification), `getMe`
  - `/api/tmdb` — **TMDB proxy** (search, details, trending, discover, genres, season/episode, **videos**)
  - `/api/watchlist` — per-user watchlist CRUD behind JWT middleware
- **Database:** MongoDB via **Mongoose** (Atlas in production; `mongodb-memory-server`
  fallback for local development with zero setup).
- **Auth:** `jsonwebtoken` (7-day expiry) + `bcryptjs` password hashing; the TMDB API key
  never reaches the browser — all TMDB traffic is proxied server-side with the key
  injected from environment variables (`axios` instance with `api_key` param).

### TMDB API Integration

- Server-side client: `backend/controllers/tmdbController.js` creates one `axios` instance
  with `baseURL` + `api_key` from env; responses are mapped to a normalized UI shape
  (`tmdbToTitle` in `src/api.ts`) before reaching components.
- Image renditions come from `image.tmdb.org` (`w500` posters, `original` backdrops).
- **Trailer endpoint:** `GET /api/tmdb/videos/:id?type=movie|tv` — filters to
  `site === "YouTube"` and `type` ∈ {Trailer, Teaser}, sorts official/English first, and
  returns `{ found, key, name, url, total }` (or `found: false` when TMDB has no video).

---

## 3. Key Features Breakdown

### 3.1 Account-isolated Profile Management ("Who's Watching?")

The Netflix-style profile gate is the security-sensitive core of the experience:

- **Strict per-account isolation** — profiles are stored under **`profiles_<email>`**
  and the active selection under **`activeProfileId_<email>`** in `localStorage`.
  `getCurrentUserId()` resolves identity from the session token + user object and
  returns `null` for guests/signed-out visitors, making profile storage inaccessible
  outside an authenticated session.
- **No mock/default profiles** — a brand-new account (e.g., a fresh Gmail login) sees a
  clean **"Create Your First Profile"** screen (EN/AR) instead of pre-seeded
  "Normal"/"Kids" profiles. Legacy account-agnostic `profiles` keys are purged
  automatically so old shared data can never leak between accounts.
- **PIN lock** — optional 4-digit PIN per profile, enforced through an animated
  `PinModal` (digit slots, error shake) both at the gate and in the profile switcher.
- **Kids mode** — a kids profile restricts the catalog (animation/family/documentary
  genres via `src/lib/kidsFilter.ts`), swaps the hero to kid-safe content, and filters
  every trending/browse/search result set.
- **Guest / "Skip for now"** — issues a temporary `local-*` session, **completely hides
  the profile page** (direct guest browsing, `/profiles` redirects home, no profile keys
  are ever written), while keeping a Sign-In affordance in the top bar.
- **Logout hygiene** — clears `token`, `user`, the scoped active-profile key, pending
  auth continuations, search cache, and gate flags in one operation, preventing any
  state bleed when switching between different accounts.

> Verified by an automated 27-check Playwright suite (two fresh accounts + guest flow),
> executed **locally and against production**: isolation, guest bypass, and logout reset
> all pass — **27/27** in both environments.

### 3.2 Official TMDB Trailer Playback

- A **"Watch Trailer / شاهد الإعلان"** action on every poster card (hover toolbar),
  the detail modal, and the title page opens a dedicated `TrailerModal`.
- Rendered through a **portal to `document.body`** (escapes transformed ancestors),
  `z-[200]`, with full-screen backdrop, embedded YouTube player
  (`/embed/{key}?autoplay=1&rel=0`) and localized chrome (EN/AR).
- **Close behaviors:** ESC (captured, stops propagation), backdrop click, and X button —
  the iframe is unmounted immediately on close so playback stops instantly; body scroll
  is locked while open.
- **Error fallbacks:** loading spinner → trailer fetched from the always-on videos
  endpoint → if TMDB has no YouTube trailer (e.g., some TV shows), a clean
  *"Trailer unavailable"* panel with a **YouTube search deep link**
  (`https://www.youtube.com/results?search_query={Title}+Official+Trailer`) instead of a
  broken embed.
- Verified by a 23-check e2e suite (open/close paths + route-stubbed fallback), local and production.

### 3.3 Other Notable Features

- **Authentication:** email/password sign-up & sign-in plus Google Sign-In (JWT),
  protected profile gate after login.
- **Watchlist:** per-profile `watchlist_<profileId>` storage, My List / continue-watching
  progress bars, server-side watchlist API behind auth middleware.
- **Multi-language (AR / FR / EN):** language catalog data with Arabic RTL-aware UI
  (gate titles, trailer labels, settings switch persisted in `localStorage.lang`).
- **Catalog UX:** hero billboard, carousels, advanced browse with genre filters, search,
  TV season/episode lists, title pages, in-page video preview player.
- **Branding assets:** hand-authored SVG favicon set, inline `LogoMark` in the top bar.

---

## 4. Security, Intellectual Property & Deployment

### 4.1 API Keys & Secrets Isolation

- **Zero secrets in source.** A full-tree scan plus a **git-history blob scan** confirmed
  the MongoDB Atlas URI, TMDB key, and JWT secret exist only in untracked env files.
- **Frontend secrets** live in **`.env.local`** (gitignored) — e.g. `VITE_GA_ID`,
  optional `VITE_API_URL`. Vite only exposes `VITE_`-prefixed variables, and GA
  initialization is skipped entirely when the variable is absent.
- **Backend secrets** live in `backend/.env` (gitignored): `TMDB_API_KEY`,
  `JWT_SECRET`, `MONGO_URI`, `CLIENT_URL`.
- **Documentation templates:** root **`.env.example`** (frontend) and
  **`backend/.env.example`** (backend) list every variable with placeholder values —
  safe to commit, sufficient to reproduce a local environment.
- **TMDB key never ships to the browser** — all TMDB calls are proxied by the Express
  layer, which injects the key server-side.
- Hardcoded credentials found during audit (a legacy TMDB key in a helper `.bat`, a GA4
  fallback literal in `main.tsx`) were **removed**; the GA measurement ID now comes from
  Vercel's environment configuration (`VITE_GA_ID`), and legacy `NEXT_PUBLIC_GA_ID`
  was purged from project settings.

### 4.2 Repository Hygiene (`.gitignore`)

- Ignores **`.env`, `.env.local`, `.env.*.local`, `backend/.env`** (only `*.example`
  templates are tracked).
- Ignores **build outputs** (`dist/`, `.next/`, `out/`), `node_modules/`, and Vercel's
  local `.vercel/` directory.
- **Local test media exclusion:** `*.mp4`, `*.mkv`, `*.webm`, `*.mov`, `*.avi`,
  `test-media/`, `media/` — large video assets are never committed, keeping the GitHub
  repository lean and clone-friendly.
- Verified with `git check-ignore`; working tree contains no secrets before every push.

### 4.3 Vercel Production Configuration

- **`vercel.json`** rewrites `/api/(.*)` → `api/index.js` (serverless Express) and every
  other path → `index.html` (SPA fallback) so deep links like `/title/movie/550` work.
- `vite.config.ts` pins `base: "/"` via `viteSingleFile({ overrideConfig })` so absolute
  asset/favicon URLs survive the single-file build on deep routes.
- Environment variables (TMDB, JWT, Mongo, `VITE_GA_ID`) are managed in Vercel's
  dashboard as **Secret/Config** entries — never in the repository.
- Deploys are verified post-release: health checks on `/`, deep routes, `/api/tmdb/*`,
  and full Playwright suites run against the production URL.

### 4.4 Intellectual Property & Legal

- **`LICENSE` — Proprietary, All Rights Reserved.** The source is published for
  demonstration/portfolio viewing only; copying, cloning, forking, redistribution, or
  commercial use requires explicit written permission. `package.json` declares
  `"license": "UNLICENSED"`.
- **Disclaimer (also surfaced in `README.md`):**

  > **Disclaimer:**
  > This application is an experimental UI/UX portfolio project built strictly for
  > educational and demonstration purposes.
  > - The developer does NOT host, upload, or store any full-length movies or
  >   copyrighted media files on any server.
  > - Metadata, thumbnails, and preview data are dynamically fetched via public
  >   third-party APIs (TMDB).
  > - The creator assumes no legal responsibility or liability for third-party content
  >   displayed via API endpoints.

- The product uses the TMDB API but is not endorsed or certified by TMDB; trademarked
  titles and artwork remain the property of their respective owners.

---

## 5. Executive Summary

Cinematic demonstrates **production readiness beyond a typical portfolio UI**:

- **Solid engineering foundations** — React 19 + TypeScript (strict, zero-error
  typecheck), Vite single-file builds, an Express/Mongoose backend deployed as a
  Vercel serverless function, and a normalized API layer that keeps third-party concerns
  (TMDB) server-side.
- **Security standards** — no secrets in code or git history; environment-driven
  configuration with committed `.env.example` templates; JWT + bcrypt auth; TMDB key
  proxying; per-account storage isolation with verified logout hygiene; a documented
  proprietary license and legal disclaimer.
- **Quality assurance** — key flows are covered by automated Playwright suites
  (**27/27** profile-isolation checks, **23/23** trailer checks) executed both locally
  and against the live production deployment, plus recurring smoke tests after every
  release.
- **Portfolio value** — it showcases the rare combination of *visual* craft (cinematic
  design system, motion design, RTL/Arabic support) and *systems* craft (auth flows,
  state isolation, CI-verified deployments), making it a credible reference for
  front-end and full-stack roles alike.

**Status:** production-deployed, actively maintained, and continuously verified.
