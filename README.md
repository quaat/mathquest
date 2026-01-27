# MathQuest: Multiply and Master

MathQuest is a browser-based multiplication game built with React and Vite. It turns times tables into short, replayable challenges with streak-based scoring, daily challenges, and long-term progression saved in your browser.

## Gameplay overview
- Game modes: Journey (20-question progression), Sprint (60s time attack), Boss Run (hard tables only), Chill (untimed practice), and a Daily Challenge with a seeded 20-question deck and double XP.
- Difficulties: Beginner, Intermediate, Advanced, Expert with different table ranges and time limits.
- Question types: standard multiplication, missing factor, and reverse division prompts.
- Scoring: base points by difficulty + time bonus + streak multiplier (up to 5x); Daily Challenge doubles points.
- Progression: XP and levels, mastery per table, achievements, and unlockable themes.
- Session results: accuracy, solved count, charted breakdown, and unlock callouts.
- Storage: progress is saved locally in the browser using localStorage.

## Build and run locally
Prerequisites: Node.js 18+ and npm.

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`
4. Preview the production build:
   `npm run preview`

Vite prints the local URL for dev and preview (defaults: http://localhost:5173 and http://localhost:4173).

## Run the Docker image
The published image serves the built static app with Nginx on port 80.

```bash
docker pull ghcr.io/quaat/mathquest:latest
docker run --rm -p 8080:80 ghcr.io/quaat/mathquest:latest
```

Then open http://localhost:8080.

To run in the background:

```bash
docker run -d --name mathquest -p 8080:80 ghcr.io/quaat/mathquest:latest
docker stop mathquest
```
