# 🎬 Cinematic — Streaming Platform UI

> **Live Demo:** https://cinematic-streaming-platform-ui.vercel.app

A pixel-obsessed, cinematic streaming interface (movies · TV series · anime) built as an
experimental **UI/UX portfolio project**. Browse real TMDB catalogs, manage multiple
profiles with PIN locking, curate a personal watchlist, and watch official trailers —
all wrapped in a Netflix-grade dark experience with full Arabic (RTL) support.

---

## ✨ Features

- **Multi-profile experience with PIN locking** — Netflix-style "Who's Watching?" gate,
  create/switch/delete profiles, kid-safe avatars, and optional 4-digit PIN protection per profile.
- **Kids content filtering** — a dedicated kids profile hides mature titles and only surfaces
  family-friendly catalog entries.
- **TMDB streaming preview interface** — hero billboard, carousels, infinite browse pages,
  search, genre filtering, detail modals, episode lists for TV seasons, and a video-player
  preview surface, all powered by live TMDB metadata.
- **Official trailer playback** — "Watch Trailer" on every card, detail modal, and title page
  opens an embedded YouTube trailer (fetched via TMDB videos API) with graceful fallback.
- **Multi-language support (AR / FR / EN)** — Arabic (full RTL), English, and French catalog
  content with a display-language switcher.
- **Personal watchlist** — add/remove titles, continue-watching progress bars, and list pages.
- **Authentication** — email/password sign-up & sign-in plus Google Sign-In, with a protected
  profiles gate after login.
- **Google Analytics (GA4)** — optional page-view tracking, enabled via the `VITE_GA_ID`
  environment variable (no analytics ID is hardcoded in the source).
- **Responsive & motion-rich** — framer-motion transitions, hover previews, and mobile-first
  layouts down to small screens.

---

## ⚖️ Disclaimer

> **Disclaimer:**
> This application is an experimental UI/UX portfolio project built strictly for educational and demonstration purposes.
> - The developer does NOT host, upload, or store any full-length movies or copyrighted media files on any server.
> - Metadata, thumbnails, and preview data are dynamically fetched via public third-party APIs (TMDB).
> - The creator assumes no legal responsibility or liability for third-party content displayed via API endpoints.

This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · framer-motion · lucide-react |
| Routing / state | React Router 7 · React context + localStorage persistence |
| Backend | Express 5 (serverless-ready on Vercel) · Mongoose / MongoDB · JWT + bcryptjs |
| Data | [TMDB API](https://www.themoviedb.org/documentation/api) (metadata, images, trailers) |
| Analytics | Google Analytics 4 via `react-ga4` |
| Deploy | Vercel (static SPA + `/api` serverless functions) |

---

## 🚀 Local Setup

**1. Install dependencies**

```bash
npm install
```

**2. Run the frontend**

```bash
npm run dev
```

The app starts at `http://localhost:5173` and runs on bundled demo data for the home page.

**3. (Optional) Run the backend** — required for search, details, profiles, watchlist, and trailers:

```bash
cd backend
npm install
copy .env.example .env      # Windows  (macOS/Linux: cp .env.example .env)
npm start                   # Express API on http://localhost:5000
```

Fill in `backend/.env` with your own TMDB API key (free at
https://www.themoviedb.org/settings/api), then point the frontend at it by creating a
root `.env.local` file:

```bash
VITE_API_URL=http://localhost:5000/api
```

> **Environment files**
> - `.env.example` → copy to `.env.local` (frontend / Vite variables)
> - `backend/.env.example` → copy to `backend/.env` (TMDB key, JWT secret, Mongo URI, CORS origin)
>
> All real `.env*` files are **gitignored** — never commit secrets. In production, set the
> same variables in the Vercel project settings.

**Build for production**

```bash
npm run build     # outputs a single-file bundle to dist/
npm run preview   # serve the production build locally
```

---

## 📁 Project Structure

```
cinematic-streaming-platform-ui/
├── src/                  # React SPA (components, pages, context, lib)
├── backend/              # Express API (auth, watchlist, TMDB proxy)
│   ├── controllers/      # Route handlers (incl. TMDB proxy controllers)
│   ├── routes/           # /api/auth, /api/watchlist, /api/tmdb
│   ├── models/           # Mongoose User model
│   └── .env.example      # Backend environment template
├── api/index.js          # Vercel serverless entry → backend/server.js
├── public/               # Favicons & static images
├── .env.example          # Frontend environment template
└── vite.config.ts        # Vite + Tailwind + single-file build
```

---

## 📜 License

All Rights Reserved — proprietary. This source code is published for
**demonstration/portfolio viewing only** and may not be copied, cloned, forked,
redistributed, or reused without explicit written permission. See [LICENSE](./LICENSE).

Third-party content (metadata, posters, thumbnails) is served at runtime via the TMDB API
and remains the property of its respective owners.
