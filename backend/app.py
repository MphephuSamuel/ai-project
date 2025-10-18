import os
import joblib
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from glob import glob


# Default artifacts folder: prefer the artifacts folder next to this module (backend/artifacts)
# which matches how models are saved in this project. Fall back to the workspace-level
# artifacts/ folder (parent directory) for compatibility.
_ARTIFACTS_NEXT_TO_MODULE = os.path.join(os.path.dirname(__file__), "artifacts")
_ARTIFACTS_IN_WORKSPACE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "artifacts")
ARTIFACTS_DIR = _ARTIFACTS_NEXT_TO_MODULE if os.path.exists(_ARTIFACTS_NEXT_TO_MODULE) else _ARTIFACTS_IN_WORKSPACE
DEFAULT_GLOB = os.path.join(ARTIFACTS_DIR, "pipeline_with_scaler_*.joblib")

# The feature order used for training
FEATURE_ORDER = ["2012", "2013", "2014", "2015", "2016", "2017"]

app = FastAPI(title="ElasticNet Forecast API", version="1.0")

# Allow CORS from any origin (permissive - intended for development / testing).
# If you deploy to production, narrow the allowed origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SinglePredictionRequest(BaseModel):
    # Provide features in the training order (list of floats; length must match FEATURE_ORDER)
    features: List[float]


class BatchPredictionRequest(BaseModel):
    # List of feature-lists
    batch: List[List[float]]


class PredictionResponse(BaseModel):
    prediction: float
    model: Optional[str] = None


def find_latest_pipeline() -> Optional[str]:
    # Allow override with environment variable
    env_path = os.environ.get("MODEL_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    files = sorted(glob(DEFAULT_GLOB))
    return files[-1] if files else None


def load_pipeline(path: Optional[str] = None):
    p = path or find_latest_pipeline()
    if not p or not os.path.exists(p):
        raise FileNotFoundError("Pipeline artifact not found. Place a pipeline_with_scaler_*.joblib in artifacts/")
    return joblib.load(p), p


# Load model on startup
try:
    PIPELINE, PIPELINE_PATH = load_pipeline()
except Exception as e:
    PIPELINE, PIPELINE_PATH = None, None


@app.on_event("startup")
def startup_event():
    global PIPELINE, PIPELINE_PATH
    if PIPELINE is None:
        try:
            PIPELINE, PIPELINE_PATH = load_pipeline()
            print("Loaded pipeline:", PIPELINE_PATH)
        except Exception as e:
            # Keep the app running but endpoints will error until a pipeline is available
            print("Warning: could not load pipeline on startup:", e)


@app.get("/health")
def health():
    return {"ok": True, "model_loaded": PIPELINE is not None, "pipeline_path": PIPELINE_PATH}


@app.get("/info")
def info():
    if PIPELINE is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    # If pipeline is Pipeline([('scaler', scaler), ('elasticnet', model)])
    model = None
    if hasattr(PIPELINE, "named_steps") and "elasticnet" in PIPELINE.named_steps:
        model = PIPELINE.named_steps["elasticnet"]
    else:
        # pipeline might embed model under other name; fallback to last step
        model = list(PIPELINE.steps)[-1][1] if hasattr(PIPELINE, "steps") else None
    coef = getattr(model, "coef_", None)
    intercept = getattr(model, "intercept_", None)
    return {
        "pipeline_path": PIPELINE_PATH,
        "feature_order": FEATURE_ORDER,
        "coefficients": coef.tolist() if coef is not None else None,
        "intercept": float(intercept) if intercept is not None else None,
        "model_class": model.__class__.__name__ if model is not None else None
    }


def validate_features_vector(vec: List[float]):
    if len(vec) != len(FEATURE_ORDER):
        raise HTTPException(
            status_code=400,
            detail=f"Feature vector length must be {len(FEATURE_ORDER)} (order: {FEATURE_ORDER})"
        )


@app.post("/predict", response_model=PredictionResponse)
def predict(req: SinglePredictionRequest):
    if PIPELINE is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    validate_features_vector(req.features)
    import numpy as np
    X = np.array(req.features, dtype=float).reshape(1, -1)
    try:
        y_pred = PIPELINE.predict(X)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
    return PredictionResponse(prediction=float(y_pred.flatten()[0]), model=os.path.basename(PIPELINE_PATH))


@app.post("/predict_batch")
def predict_batch(req: BatchPredictionRequest):
    if PIPELINE is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    import numpy as np
    for row in req.batch:
        if len(row) != len(FEATURE_ORDER):
            raise HTTPException(
                status_code=400,
                detail=f"Each row must have length {len(FEATURE_ORDER)} (order: {FEATURE_ORDER})"
            )
    X = np.array(req.batch, dtype=float)
    try:
        preds = PIPELINE.predict(X).flatten().tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")
    return {"predictions": preds, "model": os.path.basename(PIPELINE_PATH)}