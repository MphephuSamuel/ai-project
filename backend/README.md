# Backend (FastAPI) Service

This folder contains a small FastAPI application that serves predictions from a saved scikit-learn pipeline (typically a `pipeline_with_scaler_*.joblib` artifact).

Key files
- `app.py` - FastAPI application (endpoints documented below).
- `requirements.txt` - Python packages required to run the service.
- `Dockerfile` - Container image definition to build and run the service.
- `artifacts/` - Recommended location to store trained model artifacts used by the API.

Overview

The service tries to load a pipeline artifact on startup. By default it looks for files matching `pipeline_with_scaler_*.joblib` in the `backend/artifacts/` folder. If that folder doesn't exist it will fall back to the workspace-level `artifacts/` folder (one level up).

You can override the pipeline path by setting the `MODEL_PATH` environment variable to an absolute path to a joblib file.

Requirements

- Python 3.10+ (the project used Python 3.12 for development). Use a virtual environment.
- Recommended to install dependencies from this folder's `requirements.txt`.

Running locally (PowerShell)

Open PowerShell in the `backend` folder and run:

```powershell
cd C:\path\to\ai-project\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

If you need to point to a specific model file for the running process, set `MODEL_PATH` in the same PowerShell session before starting uvicorn:

```powershell
$env:MODEL_PATH = 'C:\full\path\to\pipeline_with_scaler_20251018TXXXXXX.joblib'
uvicorn app:app --host 0.0.0.0 --port 8000
```

Docker (build & run)

From the `backend` folder, build and run with Docker (PowerShell examples):

```powershell
# build
docker build -t ai-backend:latest .

# run (expose port 8000)
# if you want to mount a local artifacts folder into the container:
docker run -it --rm -p 8000:8000 -v ${PWD}:/app ai-backend:latest

# or provide MODEL_PATH via environment variable
docker run -it --rm -p 8000:8000 -e MODEL_PATH=/app/artifacts/pipeline_with_scaler_20251018TXXXXXX.joblib -v ${PWD}:/app ai-backend:latest
```

API Endpoints

- GET /health
  - Returns basic health info and whether a model is loaded.
  - Example response:
    {
      "ok": true,
      "model_loaded": true,
      "pipeline_path": "C:\\...\\pipeline_with_scaler_...joblib"
    }

- GET /info
  - Returns metadata about the loaded pipeline: `pipeline_path`, `feature_order`, `coefficients`, `intercept`, `model_class`.
  - Returns HTTP 503 if the model is not loaded.

- POST /predict
  - Single-row prediction. Request body model: { "features": [float, float, ...] }
  - The features must be provided in the training `feature_order` (length must match). If the feature vector length doesn't match, you'll get HTTP 400.
  - Example request body:
    {
      "features": [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
    }
  - Example response model:
    {
      "prediction": 12.345,
      "model": "pipeline_with_scaler_20251018T...joblib"
    }

- POST /predict_batch
  - Batch predictions. Request body model: { "batch": [[...], [...], ...] }
  - Each inner list must match the feature length.
  - Example request body:
    {
      "batch": [[1,2,3,4,5,6], [2,3,4,5,6,7]]
    }
  - Example response:
    {
      "predictions": [12.3, 16.7],
      "model": "pipeline_with_scaler_20251018T...joblib"
    }

Feature ordering

The API exposes the feature order in `GET /info`. The implementation uses a default feature order defined in the code; for the current version it is:

["2012", "2013", "2014", "2015", "2016", "2017"]

Make sure the input arrays use this same order and length.

Artifact placement

- By default place a pipeline artifact matching `pipeline_with_scaler_*.joblib` in `backend/artifacts/` (recommended for local development).
- Alternatively, place artifacts in the repository-level `artifacts/` folder if preferred.
- To explicitly point the app to a single artifact, set the `MODEL_PATH` environment variable to the joblib path.

CORS and security

- The app is configured with permissive CORS (allow all origins) for development convenience. For production, restrict allowed origins.
- The API returns detailed error messages. Sanitize or reduce error verbosity for production deployments.

Troubleshooting

- "Pipeline artifact not found" on startup: Ensure a `pipeline_with_scaler_*.joblib` file exists in `backend/artifacts/` or set `MODEL_PATH` to the correct file.
- Shape/length errors at predict time: Check `feature_order` from `/info` and ensure your request arrays match length and order.
- Joblib load errors: Verify `joblib` and `scikit-learn` versions in `requirements.txt` match those used during model training.

Contact / Maintainer

See repository root for project maintainer information. Open an issue or contact the author if you need help.
