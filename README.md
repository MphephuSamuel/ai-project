# ai-project

This repository contains a small forecasting project with model development artifacts, a FastAPI backend that serves model predictions, and a React + Vite frontend that consumes the API.

Contents

- `backend/` — FastAPI service that loads a scikit-learn pipeline (joblib) and exposes prediction endpoints.
- `frontend/` — React + TypeScript single-page app (Vite) that calls the backend API.
- `model_development/` — Notebooks, training pipelines and saved artifacts used to build the models.
- `artifacts/` (optional repo-level) — alternative location for pipeline artifacts used by the backend.

Quick overview

- The backend looks for a pipeline artifact named like `pipeline_with_scaler_*.joblib` in `backend/artifacts/` by default. You can override the exact pipeline path using the `MODEL_PATH` environment variable.
- The frontend reads its backend base URL from the Vite environment variable `VITE_API_BASE_URL`. Do not commit private or production URLs into the repository.

Prerequisites

- Python 3.10+ (project developed with Python 3.12)
- Node.js 18+ and npm (or pnpm/yarn)
- Docker (optional, for container builds)

Setup & run (PowerShell examples)

1) Backend (FastAPI)

```powershell
cd C:\Users\mphep\Desktop\ai-project\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Ensure a pipeline artifact exists in backend/artifacts/ or set MODEL_PATH
# Example: set environment variable to a local artifact
$env:MODEL_PATH = 'C:\full\path\to\pipeline_with_scaler_YYYYMMDDTXXXXXX.joblib'

# start the app
uvicorn app:app --host 0.0.0.0 --port 8000
```

Notes:
- The backend exposes `/health`, `/info`, `/predict` and `/predict_batch` endpoints. See `backend/README.md` for full docs.
- If the backend can't find a pipeline at startup, it will still run but endpoints requiring the model will return HTTP 503 until a pipeline is available.

2) Frontend (React + Vite)

```powershell
cd C:\Users\mphep\Desktop\ai-project\frontend
npm install
copy .env.example .env  # optional
# edit frontend/.env and set VITE_API_BASE_URL to your backend (e.g. http://localhost:8000)
npm run dev
```

Important: do NOT commit private or production backend URLs into the repo. Use `.env` (ignored by git) and set `VITE_API_BASE_URL` in your deployment environment.

3) Model development

- Open the notebook in `model_development/` (for example `forecasting (2).ipynb`) to retrain or inspect training steps.
- Trained artifacts are in `model_development/artifacts/` and may be copied to `backend/artifacts/` for serving.

Docker (backend)

Build and run a container for the backend from the `backend/` folder:

```powershell
cd C:\Users\mphep\Desktop\ai-project\backend
# build image
docker build -t ai-backend:latest .

# run and mount the local backend folder so artifacts are visible in the container
docker run -it --rm -p 8000:8000 -v ${PWD}:/app ai-backend:latest

# or pass MODEL_PATH explicitly
docker run -it --rm -p 8000:8000 -e MODEL_PATH=/app/artifacts/pipeline_with_scaler_...joblib -v ${PWD}:/app ai-backend:latest
```

Security & configuration guidance

- Never hard-code production or private URLs in source code. Use environment variables and `.env` files for local development.
- Add placeholders in `.env.example` rather than real endpoints.
- The frontend previously used a hard-coded fallback URL. Remove or replace such fallbacks with `localhost` or a placeholder to avoid leaking private endpoints.

Example API usage (PowerShell / curl)

Replace `<BACKEND_BASE_URL>` with your configured base URL (e.g. `http://localhost:8000`).

PowerShell (single prediction):

```powershell
$body = '{"features":[1,2,3,4,5,6]}'
Invoke-RestMethod -Method POST -ContentType 'application/json' -Body $body "<BACKEND_BASE_URL>/predict"
```

curl (batch prediction):

```bash
curl -X POST -H "Content-Type: application/json" -d '{"batch":[[1,2,3,4,5,6],[2,3,4,5,6,7]]}' <BACKEND_BASE_URL>/predict_batch
```

Troubleshooting

- "Pipeline artifact not found": ensure a `pipeline_with_scaler_*.joblib` file exists under `backend/artifacts/` or set `MODEL_PATH` to the artifact path.
- Prediction shape errors: check `GET /info` for `feature_order` and ensure your request arrays match that order and length.
- Joblib load errors: validate `joblib` and `scikit-learn` versions in `backend/requirements.txt` match the versions used during model training.

Where to find documentation

- `backend/README.md` — backend-specific info (endpoints, Docker examples, artifact locations).
- `frontend/README.md` — frontend usage and environment variable notes.
- `model_development/README.md` — model development and how to load artifacts.

Live demo

There is a public frontend deployment that demonstrates the project UI (read-only):

https://unemployment-predictions.vercel.app/

Note: The public frontend is a read-only demonstration. The backend API and any private endpoints are not committed to this repository; configure your `VITE_API_BASE_URL` locally or in your deployment to point the frontend at a running backend instance.
Contributing

- Follow the repo linting and formatting rules. Run frontend lint via `npm run lint` in `frontend/`.
- Keep secrets and private endpoints out of the repository. Use environment variables for configuration.

License & contact

See repository root for license information and maintainers (or open an issue on the repo for questions).
