# 🎓 EduCheck AI — by **Mindset-21**

> Smart, gamified homework grading for primary schools. Snap a photo of a notebook → a live AI teacher grades it, gives gentle feedback, and turns it into a reward-filled quest.

A polished, hackathon-ready MVP with a **real, working Live AI grading module** (OpenAI **or** Gemini Vision), a robust offline mock fallback, full **dark/light mode**, **3 languages**, **leaderboard + achievements**, animated analytics, and Framer-Motion micro-interactions everywhere.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Run it](#-run-it)
- [Scripts](#-scripts)
- [Deploy to Vercel](#️-deploy-to-vercel)
- [Connecting a real AI](#-connecting-a-real-ai)
- [Environment Variables](#-environment-variables)
- [Architecture](#-architecture)
- [License](#-license)

---

## ✨ Features

**Global**
- 🌗 **Dark / light theme** — animated, persisted, system-aware.
- 🌐 **3 languages** (UZ / RU / EN) with a live navbar switcher — every label *and the AI's feedback* update instantly and persist.
- 5-destination responsive nav: Teacher · Student · AI Review · Leaderboard · Settings.
- 🔊 Synthesised UI **sound effects**, ✨ floating particles, 🎉 confetti, skeleton/loading states, toast notifications, error boundary.

**1 · Teacher Dashboard** (professional white/dark panels)
- Animated metric counters: `Checked Today 26/30`, `Time Saved 2.5h`, `Class Avg 85%`.
- Class Tasks with status chips, **drag-and-drop** upload zone + *Upload New Task*.
- **AI Verification**: scanned work, AI score, flagged mistakes, **Confirm Grade** / **Override System** (with slider) + a **teacher comments** box.
- **Analytics**: animated line / bar / donut charts (weekly performance, student progress, AI accuracy).

**2 · Student / Parent Portal** (vibrant gamified UI)
- Cute mascot, simulated **QR-code login** with animated scanner.
- *Today's Quest* card on an animated aurora gradient.
- **Camera / file uploader** — take a real photo or pick a sample → "AI is analyzing handwriting and logic…" with particles, pulsing loader and scan line.

**3 · Real Working AI Module**
- ⚙️ **Settings modal**: separate **OpenAI** and **Gemini** key inputs, model picker, show/hide toggle, **Test connection** button.
- Edge-function-style API layer with **timeout + retry**; the hard-coded pedagogical system prompt is locked & visible.
- No key? A smart mock that *actually parses & checks the arithmetic* keeps the demo correct and language-aware. Any live failure silently falls back.

**4 · Gamified AI Review** ("Quest Completed!")
- Treasure-chest opening + crystal explosion + confetti + XP animation.
- Reward updates global state: **+50 XP / +2 Knowledge Crystals 💎**.
- Renders the **actual AI feedback** dynamically, plus a notebook-style **mistake map** circling wrong steps with corrections.
- **Achievements** unlock (Math Explorer, Homework Hero, Speed Solver, Flawless Run, Crystal Collector).

**Leaderboard** — weekly / all-time toggle, top-3 podium, animated rank bars, and your badge collection.

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | Framer Motion · canvas-confetti |
| AI providers | OpenAI Vision · Google Gemini Vision (with offline mock fallback) |
| State | React Context (`AppContext`, `ThemeContext`, `ToastContext`) |
| i18n | Custom dictionary (`src/i18n.ts`) — UZ / RU / EN |
| Persistence | Browser `localStorage` (keys, theme, language, progress) |
| Deploy | Vercel (SPA rewrites via `vercel.json`) |

---

## ✅ Prerequisites

- **Node.js 18+** (built & tested on Node 26)
- **npm** (ships with Node)
- *(Optional)* an **OpenAI** or **Gemini** API key for live AI grading — the app works fully without one via the mock engine.

---

## 🚀 Run it

```bash
npm install          # install dependencies
npm run dev          # start dev server → http://localhost:5173
npm run build        # type-check + production build → dist/
npm run preview      # preview the production build locally
```

---

## 📜 Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the Vite dev server with HMR on port `5173` (auto-opens browser). |
| `npm run build` | Runs `tsc --noEmit` (type-check) then builds the optimized production bundle to `dist/`. |
| `npm run preview` | Serves the built `dist/` locally to preview the production build. |

## ☁️ Deploy to Vercel

The repo includes `vercel.json` (Vite preset + SPA rewrites). Either:
- Import the repo in the Vercel dashboard (auto-detected), or
- `npx vercel` from the project root.

---

## 🔑 Environment Variables

All variables are **optional** — the app runs without them (mock engine) and keys can also be pasted at runtime via the in-app Settings modal. Copy `.env.example` → `.env.local` to pre-connect live AI:

| Variable | Description |
|----------|-------------|
| `VITE_OPENAI_API_KEY` | OpenAI API key (e.g. `sk-...`) for live grading. |
| `VITE_GEMINI_API_KEY` | Google Gemini API key (e.g. `AIza...`) for live grading. |

On Vercel, set these under **Project → Settings → Environment Variables** to pre-connect live AI without the in-app modal.

> ⚠️ `VITE_`-prefixed vars are **shipped to the browser**. For real production, proxy AI calls through a serverless/edge function instead of exposing keys client-side.

---

## 🤖 Connecting a real AI

1. Click the **⚙️ gear** (the dot is 🟠 demo / 🟢 live).
2. Choose **OpenAI** or **Gemini**, paste the matching key, pick a model.
3. Hit **Test connection** to verify, then **Save & Connect**.

Keys are stored **only in this browser's `localStorage`** and sent directly to the provider.

Locked system prompt (shown in Settings):
> *You are an empathetic, encouraging, and supportive primary school teacher and a game quest guide… (1) a score 1–100, (2) gently-formatted errors, (3) a gamified feedback message, in the UI language.*

---

## 🧱 Architecture

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · Framer Motion · canvas-confetti.

```
src/
├─ api/          # edge-function-style layer: client (timeout+retry), openai, gemini, prompt
├─ services/     # aiService — orchestration, parsing, mock fallback
├─ context/      # AppContext (state), ThemeContext, ToastContext
├─ hooks/        # useCountUp, useSound
├─ utils/        # cn, storage, image, mockEngine, gameData
├─ animations/   # Framer Motion variants
├─ components/   # Navbar, SettingsModal, Toast, Particles, TreasureChest, charts/, ui/
├─ pages/        # TeacherDashboard, StudentPortal, AIReview, Leaderboard
├─ i18n.ts       # UZ / RU / EN dictionaries
└─ types.ts
```

**Data flow:** `StudentPortal` (image/text) → `aiService.grade()` → `api/` layer (OpenAI **or** Gemini, with timeout + retry) → on failure, `utils/mockEngine` parses & checks the arithmetic locally → `AIResult` ({ score, errors, feedback, steps, source }) → `AIReview` renders the quest, mistake map & rewards → `AppContext` updates XP / crystals / achievements.

---

## 📄 License

This project was built for a hackathon by **team Mindset-21**. No formal open-source license is attached — contact the team before reuse.

---

Made with 💜 by **Mindset-21**.
