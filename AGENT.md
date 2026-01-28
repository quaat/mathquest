# MathQuest Agent Notes

These notes describe how the app is structured and how to work on it safely.

**Project Overview**
- MathQuest is a browser-based multiplication game with multiple modes, difficulty tiers, streak scoring, and unlockable progression.
- The app is client-only; all state persists in the browser using `localStorage`.
- The UI is mobile-first and uses Tailwind classes via a CDN include.

**Tech Stack**
- React 19 + TypeScript, built with Vite.
- UI: Tailwind CSS via CDN in `index.html`, custom inline keyframes.
- Charts: `recharts`.
- Icons: `lucide-react`.
- Docker runtime: Nginx serving the `dist` build output.

**Project Layout**
- Entry: `index.html`, `index.tsx`.
- Root app and navigation: `App.tsx`.
- Views: `views/Home.tsx`, `views/Game.tsx`, `views/Results.tsx`, `views/Profile.tsx`.
- State: `context/GameContext.tsx`.
- Game logic: `services/gameLogic.ts`.
- Persistence: `services/storage.ts`.
- Shared UI: `components/Components.tsx`, `components/Keypad.tsx`.
- Constants and game config: `constants.ts`.
- Types: `types.ts`.

**Runtime Flow**
- `index.tsx` mounts `<App />` into `#root`.
- `App.tsx` wraps the app in `GameProvider` and keeps a simple view-state router (`home`, `game`, `results`, `profile`).
- `Home` selects mode and difficulty, then starts a game session.
- `Game` generates questions, manages the timer, scoring, and question progression.
- `Results` commits stats to context (XP, mastery, achievements, themes).
- `Profile` shows progression, unlocks, and lets the user reset progress.

**State and Persistence**
- `GameContext` uses a reducer for XP, mastery, badges, and themes.
- `services/storage.ts` reads/writes a `localStorage` key (`mathquest_user_v1`) and merges with defaults for backward compatibility.
- Unlock checks run after every reducer action; new achievements and themes are surfaced via `Results`.

**Gameplay Rules (Current)**
- Modes: Journey (20 questions), Sprint (60s time attack), Boss Run (upper-range pressure), Chill (no timer), Daily Challenge (seeded 20 questions, double XP).
- Difficulties are centralized in `DIFFICULTY_RULES` in `constants.ts` (ranges, operation mix, time limits, and UI labels).
- Question generation and scoring live in `services/gameLogic.ts`.
- Scoring: base points by difficulty + time bonus + streak multiplier (max 5x). Daily doubles points.

**Styling Notes**
- Tailwind is loaded from the CDN in `index.html`, not via a build pipeline.
- Global animations and fonts live in `index.html`.
- Shared UI primitives live in `components/Components.tsx`.

**Development Commands**
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

**Docker**
- `Dockerfile` builds the Vite app and serves `dist` with Nginx on port 80.
- The published image is `ghcr.io/quaat/mathquest:latest`.

**When Changing Game Rules**
- Update `types.ts` for new modes, difficulties, or stats.
- Update `constants.ts` for ranges, operation mixes, time limits, achievements, and themes.
- Update `services/gameLogic.ts` for question generation and scoring rules.
- Update UI flows in `views/Home.tsx`, `views/Game.tsx`, and `views/Results.tsx`.

**When Adding Persistent Data**
- Add the field to `UserStats` in `types.ts`.
- Add a default to `INITIAL_STATS` in `services/storage.ts`.
- Keep the storage key unless you intentionally want to reset user data.
- Consider migration behavior since `loadUserStats` merges stored data with defaults.

**Known Gotchas**
- `Results` treats the current streak as the best streak; if you add true max-streak tracking, update this logic.
- `Game` uses closures for session state during `setTimeout` transitions; avoid stale state bugs when changing the answer flow.
