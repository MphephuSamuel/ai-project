## Frontend (React + Vite)
This folder contains the single-page application for the ai-project. The app is built with React + TypeScript and Vite and communicates with the backend forecasting API.

The frontend reads the backend base URL from the Vite environment variable `VITE_API_BASE_URL`. If not set, the app falls back to a public demo backend.

Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)

Quick start (PowerShell)

```powershell
cd C:\path\to\ai-project\frontend
npm install

# optional: copy the example env file
copy .env.example .env

# start development server with hot reload
npm run dev
```

Environment variable

Set the API base URL using the Vite environment variable `VITE_API_BASE_URL`. Example `.env` (place in `frontend/.env`):

```
VITE_API_BASE_URL=http://localhost:8000
```

Scripts

- `npm run dev` — start Vite dev server (HMR)
- `npm run build` — build optimized production assets (output: `dist`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

Build & deploy

```powershell
npm run build
# deploy the `dist` folder to your static host (Netlify, Vercel, Render, etc.)
```

When deploying, set `VITE_API_BASE_URL` in the host environment to the backend URL.

Where to look in source

- `src/main.tsx` — application bootstrap
- `src/App.tsx` — routes and top-level layout
- `src/pages/` — page components (PredictPage, InfoPage, HealthPage)
- `src/api.ts` — axios client and typed API calls

API client notes

`src/api.ts` builds an axios client where `baseURL` is taken from `import.meta.env.VITE_API_BASE_URL`. The exported helpers match the backend endpoints:

- `predict(features: number[])` — POST /predict
- `predictBatch(batch: number[][])` — POST /predict_batch
- `getInfo()` — GET /info
- `getHealth()` — GET /health

Example (browser console) — call health endpoint:

```js
fetch((import.meta.env.VITE_API_BASE_URL) + '/health')
  .then(r => r.json()).then(console.log)
```

Tips

- For local end-to-end testing, run the backend locally (see `backend/README.md`) and set `VITE_API_BASE_URL=http://localhost:8000`.
- After changing `.env`, restart the dev server for Vite to pick up changes.
- Use the browser devtools network tab to inspect API requests.

Contributing & linting

- Run `npm run lint` and fix issues before opening PRs.

License

See repository root for license information.

If you'd like, I can add terminal/curl/PowerShell examples for `/predict` and `/predict_batch` or expand troubleshooting guidance.

Live demo

The project frontend is deployed publicly as a read-only demo:

https://unemployment-predictions.vercel.app/

This demo shows the UI; it may point to a hosted backend for demonstration purposes. Do not commit private backend URLs in this repository — instead set `VITE_API_BASE_URL` in your local `.env` or your deployment environment to point to the backend you control.

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run locally:

```bash
# optionally create a .env file based on .env.example
cp .env.example .env
npm run dev
```

The frontend will call the backend at the base URL configured in VITE_API_BASE_URL (defaults to https://unemployment-backend-latest.onrender.com).

Deployment (static hosts)

1. Build:

```bash
npm run build
```

2. Deploy the `dist` folder to Netlify/Vercel/Render static site. Set the environment variable `VITE_API_BASE_URL` to `https://unemployment-backend-latest.onrender.com` in the host settings.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ## Frontend (React + Vite)

      This folder contains the single-page application for the ai-project. The app is built with React + TypeScript and Vite and communicates with the backend forecasting API.

      The frontend reads the backend base URL from the Vite environment variable `VITE_API_BASE_URL`. Do not hard-code a private backend URL in this repository — set `VITE_API_BASE_URL` in your local or deployment environment instead.

      Prerequisites

      - Node.js 18+ and npm (or pnpm/yarn)

      Quick start (PowerShell)

      ```powershell
      cd C:\path\to\ai-project\frontend
      npm install

      # optional: copy the example env file
      copy .env.example .env

      # start development server with hot reload
      npm run dev
      ```

      Environment variable

      Set the API base URL using the Vite environment variable `VITE_API_BASE_URL`. Example `.env` (place in `frontend/.env`):

      ```
      VITE_API_BASE_URL=http://localhost:8000
      ```

      If you do not set this variable, the app will try to use a demo backend by default — do not commit production or private URLs into the repo.

      Scripts

      - `npm run dev` — start Vite dev server (HMR)
      - `npm run build` — build optimized production assets (output: `dist`)
      - `npm run preview` — preview the production build locally
      - `npm run lint` — run ESLint

      Build & deploy

      ```powershell
      npm run build
      # deploy the `dist` folder to your static host (Netlify, Vercel, Render, etc.)
      ```

      When deploying, set `VITE_API_BASE_URL` in the host environment to the backend base URL for that environment (for example, the staging or production API). Avoid placing private URLs in the repository.

      Where to look in source

      - `src/main.tsx` — application bootstrap
      - `src/App.tsx` — routes and top-level layout
      - `src/pages/` — page components (PredictPage, InfoPage, HealthPage)
      - `src/api.ts` — axios client and typed API calls

      API client notes

      `src/api.ts` builds an axios client where `baseURL` is taken from `import.meta.env.VITE_API_BASE_URL`. The exported helpers match the backend endpoints:

      - `predict(features: number[])` — POST /predict
      - `predictBatch(batch: number[][])` — POST /predict_batch
      - `getInfo()` — GET /info
      - `getHealth()` — GET /health

      Example (browser console) — call health endpoint (uses the configured base URL):

      ```js
      const base = import.meta.env.VITE_API_BASE_URL || '<SET_VITE_API_BASE_URL>'
      fetch(base + '/health').then(r => r.json()).then(console.log)
      ```

      Tips

      - For local end-to-end testing, run the backend locally (see `backend/README.md`) and set `VITE_API_BASE_URL=http://localhost:8000` in your local `.env` (localhost is safe to include in examples).
      - After changing `.env`, restart the dev server for Vite to pick up changes.
      - Use the browser devtools network tab to inspect API requests.

      Contributing & linting

      - Run `npm run lint` and fix issues before opening PRs.

      License

      See repository root for license information.

      If you'd like, I can add terminal/curl/PowerShell examples for `/predict` and `/predict_batch` or expand troubleshooting guidance.
