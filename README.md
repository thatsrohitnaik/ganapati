# Ganpati Quiz & Aarti 🕉️

A no-backend React app for Ganesh Chaturthi: a quiz, an aarti collection, and singlists.

## Features

1. **Ganpati Quiz** 🏆 — 50 questions in 4 languages (English, Hindi, Konkani, Marathi). Each game picks 10 random questions with score and time tracking, plus a **leaderboard** (top 15, stored in `localStorage`, cleared from the quiz screen).

2. **Aarti Collection** 🪔 — aartis of 11 deities (Ganpati, Shankar, Ram, Krishna, Hanuman, Datta, Vitthal, Vishnu, Durga, Laxmi, Santoshi) grouped by deity — 23 aartis in Marathi, Hindi & Sanskrit with full lyrics.

3. **Singlists** 🎶 — create multiple lists of aartis and sing them sequentially with a built-in player. Every ➕ on an aarti opens an explicit "Add to which singlist?" picker (star = active list, ＋/✔ = add/remove, inline notice + new-list creation). Share any list as a compact code or deep link (`…#singlist=<code>` auto-imports it).

4. **Settings** ⚙️ — UI language picker (English / हिंदी / कोंकणी / मराठी), stored in `localStorage`.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (Vite picks a free port).

## Data

- `src/data/quizQuestions.json` — 50 quiz questions, each in 4 languages
- `src/data/aartis.json` — deities with their aartis (`deities[].aartis[].lang` is `mr` / `hi` / `sa`)

## Build & deploy (GitHub Pages)

`vite.config.js` sets `base: '/ganapati/'`, so the site runs at
`https://thatsrohitnaik.github.io/ganapati/`.

```bash
npm run build        # outputs to dist/ with correct asset paths
```

Publish `dist/` to the `gh-pages` branch (e.g. `git subtree push --prefix dist origin gh-pages`), then set Pages source to the `gh-pages` branch / root in the repo settings.

## Storage keys

- `ganpati-leaderboard` — quiz leaderboard
- `ganpati-singlists` — singlists
- `ganpati-active-singlist` — active singlist id
- `ganpati-ui-lang` — UI language

## File map

- `src/App.jsx` — routes, `#singlist=` hash import, toasts
- `src/i18n.jsx` — UI language provider + translations
- `src/components/` — Home, Quiz, Aarti, SinglistScreen, SettingsScreen, Leaderboard
- `src/utils/singlists.js` — singlist storage + share code encode/decode
- `src/utils/storage.js` — leaderboard storage