# Ganpati Quiz & Aarti 🕉️

A no-backend React application built for **Ganesh Chaturthi** celebrations and Hindu devotional practice. Features a multilingual quiz, an extensive aarti collection with a playlist system, and a mantra counter — all running entirely in the browser with no server required.

## Features

### 🏆 Ganpati Quiz

A knowledge-testing quiz about Lord Ganesha with **50 questions** across topics including mythology, festivals, temples, mantras, and Maharashtra history.

- **4 languages**: English, Hindi, Konkani, Marathi
- Each game picks **10 random questions** from the full pool
- **Real-time feedback** — correct/incorrect indicators after each answer
- **Timer** tracking total quiz duration
- **Progress bar** showing current question advancement
- **Results screen** with score summary, time taken, and contextual messages
- **Leaderboard** — top 15 entries sorted by score (desc) then time (asc), stored in `localStorage`
- Player name input with "Anonymous" fallback

### 🪔 Aarti Collection

An extensive collection of **23+ aartis** across **12 deity groups** with full line-by-line lyrics in Marathi, Hindi, and Sanskrit.

| Deity | Aartis |
|---|---|
| Ganapati | 15 |
| Shankar/Shiva | 4 |
| Viththal/Pandurang | 3 |
| Ram | 2 |
| Krishna | 2 |
| Hanuman | 2 |
| Datta | 2 |
| Vishnu | 2 |
| Durga | 2 |
| Laxmi | 2 |
| Santoshi | 1 |
| Konkani | 3 |

- **3-level navigation**: deity grid → aarti list → lyric view
- **Deep linking** via URL hash (`#/aarti/deityId/aartiId`)
- **Share** aartis via WhatsApp, native share API, or copy link
- **Add to Singlist** — bottom sheet picker with create/add/remove/toggle functionality
- Language badges and in-singlist indicators

### 🎶 Singlists

Create and manage playlists of aartis for sequential singing during prayers and celebrations.

- **Create multiple named playlists**
- **Reorder items** within a list (move up/down)
- **Built-in player** — sing aartis sequentially with Previous/Next/Finish navigation
- **Share singlists** via compact Base64-encoded codes or deep links (`#singlist=<code>`)
- **Import singlists** from share codes
- **Active singlist** concept — star-based selection for quick access
- Delete singlists with confirmation dialog

### 🔮 Japa Mala (Mantra Counter)

A digital mantra counter for devotional chanting practice.

- **20 mantras** across 11 deities (Ganapati, Shankar, Ram, Krishna, Hanuman, Datta, Viththal, Vishnu, Durga, Laxmi, Santoshi)
- **Visual bead display** — up to 108 beads filling as you count
- **Configurable targets**: 27, 54, 108, 1080, or custom number
- **Mala completion celebration** with vibration feedback (`navigator.vibrate`)
- **Undo and reset** buttons
- **Progress persistence** in `localStorage` (survives page refresh)
- Stats display: chants, malas (rounds), target

### ⚙️ Settings

- **UI language picker** — English, Hindi (हिंदी), Konkani (कोंकणी), Marathi (मराठी)
- Language preference persisted in `localStorage`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the printed local URL (Vite picks a free port, typically `http://localhost:5173/ganapati/`).

### Production Build

```bash
npm run build
```

Output is written to `dist/` with correct asset paths for deployment.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

Uses [oxlint](https://oxc-project.github.io/oxlint/) with React and OXC plugins.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.8 | UI framework |
| React DOM | ^19.2.8 | DOM rendering |
| Vite | ^8.2.2 | Build tool & dev server |
| @vitejs/plugin-react | ^6.1.0 | React support for Vite |
| oxlint | ^1.79.0 | Linting |

### Key Characteristics

- **Zero runtime dependencies** beyond React — no router, no state management library, no i18n library
- **No TypeScript** — pure JSX (type hints available via dev dependencies)
- **No CSS-in-JS** — plain CSS files
- **No backend** — everything runs client-side
- **localStorage** for all data persistence
- **100% self-contained data** — JSON files for quiz questions, aartis, and mantras

## Project Structure

```
ganpati/
├── index.html                    # Entry HTML (lang="mr")
├── package.json                  # Project manifest
├── vite.config.js                # Vite config (base: '/ganpati/')
├── .oxlintrc.json                # Linter config
├── .gitignore
├── README.md
│
├── public/
│   ├── favicon.svg               # Purple lightning bolt favicon
│   └── icons.svg                 # SVG sprite (social icons)
│
├── src/
│   ├── main.jsx                  # React entry point (StrictMode)
│   ├── App.jsx                   # Root component — routing, hash handling, toasts
│   ├── App.css                   # All component styles (1469 lines)
│   ├── index.css                 # Global CSS variables & reset
│   ├── i18n.jsx                  # Internationalization provider + 4-language translations
│   │
│   ├── components/
│   │   ├── Home.jsx              # Landing page with navigation cards
│   │   ├── Quiz.jsx              # Quiz game (details → playing → results)
│   │   ├── Aarti.jsx             # Aarti browser (deity grid → list → lyrics)
│   │   ├── Japa.jsx              # Mantra counter with visual bead display
│   │   ├── Leaderboard.jsx       # Ranked quiz scores table
│   │   ├── SinglistScreen.jsx    # Singlist management + player
│   │   └── SettingsScreen.jsx    # Language settings
│   │
│   ├── data/
│   │   ├── quizQuestions.json    # 50 quiz questions in 4 languages
│   │   ├── aartis.json           # Deities + aarti lyrics (Marathi/Hindi/Sanskrit)
│   │   └── mantras.json          # 20 mantras across 11 deities
│   │
│   └── utils/
│       ├── storage.js            # Leaderboard localStorage CRUD
│       └── singlists.js          # Singlist localStorage CRUD + Base64 encode/decode
│
└── dist/                         # Production build output
```

## Data Files

### `src/data/quizQuestions.json`

- **50 questions** (IDs 1–50)
- Each question contains: `id`, `question` (4 languages), `options` (4 choices × 4 languages), `answer` (correct index per language)
- Topics: Ganesha mythology, festivals, temples, mantras, traditions, Maharashtra history

### `src/data/aartis.json`

- **12 deity groups** with nested aartis
- Each aarti has: `id`, `title`, `lang` (`mr` / `hi` / `sa`), `lines` (array of lyric lines)
- Ganapati has the largest collection with 15 aartis

### `src/data/mantras.json`

- **20 mantras** across 11 deities
- Each mantra has: `id`, `deityId`, `title`, `titleEn`, `lang`, `defaultTarget`, `text` (array of lines)

## Architecture

### Routing

No router library — view switching is managed via `useState` in `App.jsx` with string states (`'home'`, `'quiz'`, `'aarti'`, `'japa'`, `'singlist'`, `'settings'`). Hash-based deep linking is used for specific aartis and singlist imports.

### State Management

All state is local to components using React hooks. Data persistence is handled through `localStorage` with dedicated utility modules.

### Internationalization

Custom i18n system built with React Context. Provides a `t()` function with dot-notation key lookup and string interpolation (`{n}`, `{name}`). Falls back to English if a key is missing in the current language.

### Styling

Single CSS file (`App.css`) with CSS custom properties for theming. Mobile-first responsive design with `@media (max-width: 600px)` breakpoint. Warm saffron/maroon/cream color scheme reflecting Hindu devotional aesthetics.

## Deployment (GitHub Pages)

`vite.config.js` sets `base: '/ganapati/'`, so the site runs at `https://thatsrohitnaik.github.io/ganapati/`.

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

Then set Pages source to the `gh-pages` branch / root in the repository settings.

## localStorage Keys

| Key | Purpose |
|---|---|
| `ganpati-leaderboard` | Quiz leaderboard (top 15 entries) |
| `ganpati-singlists` | User-created singlists |
| `ganpati-active-singlist` | ID of the currently active singlist |
| `ganpati-ui-lang` | Selected UI language |
| `ganpati-japa-*` | Japa mala progress per mantra |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is open source. See the repository for license details.

---

**Ganpati Bappa Morya!** 🙏
