# Nightwatch – Cinematic Watchlist

A bespoke, cinematic watchlist built with Vite + React + TypeScript. Designed for GitHub Pages with HashRouter routing, grainy textures, and thoughtfully tuned interactions.

## Features
- Poster grid and compact list layouts with keyboard shortcuts
- Fuzzy search, genre chips, watched/favorite toggles, poster/review filters, and year range control
- Sorting by title, year, personal rating, external rating, recently added/watched
- Rich detail modal with notes, ratings, favorites, and review normalization
- Local enrichment fallback plus optional OMDb API key with cached lookups (30-day TTL)
- LocalStorage persistence with reset option
- Import/export entire library or current filtered set as JSON
- HashRouter for reliable deep links on GitHub Pages

## Development
```bash
npm install
npm run dev
```
Visit `http://localhost:5173/watchlist/` during development (Vite base is set for Pages).

### Building
```bash
npm run build
```
Outputs to `dist/` with the `base` path `/watchlist/` so assets load correctly on GitHub Pages project sites.

### Preview
```bash
npm run preview
```

## Deployment
GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the project with `npm ci` and deploys the `dist` folder to GitHub Pages. Routing uses `HashRouter`, so refreshes on deep links work without custom rewrites.

## OMDb Enrichment (Optional)
1. Obtain an OMDb API key.
2. Open the Settings panel in the app and store the key (saved to LocalStorage).
3. When present, the app fetches details/ratings, caches them locally for 30 days, and merges them with shipped local enrichment (`src/data/local.enrichment.json`).

The app remains fully functional without an API key.

## Import/Export Format
Exports produce a JSON payload:
```json
{
  "movies": [
    {
      "id": "dangerous-animals-2005",
      "title": "Dangerous Animals",
      "year": 2005,
      "watched": true,
      "favorite": true,
      "myRating": 8.5,
      "notes": "...",
      "dateWatched": "2024-01-02T12:00:00Z",
      "customPosterOverride": "...",
      "customSynopsisOverride": "..."
    }
  ],
  "generatedAt": "2024-01-10T00:00:00.000Z",
  "filtered": false
}
```
Importing merges by stable `id` when possible, or falls back to matching by `title` + `year`.

## Keyboard Shortcuts
- `/` – focus search
- `g` – toggle grid/list
- `w` – toggle watched filter
- `Esc` – close modal
- `Cmd/Ctrl + K` – open command palette

## Base Path Notes
Vite is configured with `base: "/watchlist/"` to match the project Pages URL (`https://fosbrader.github.io/watchlist/`). HashRouter ensures client-side routing works on refresh without server rewrites.
