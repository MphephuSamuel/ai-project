# Model Development

This folder contains notebooks, models and helper artifacts used to develop, train and test the forecasting models for this project.

## What is here

- Notebooks: `forecasting (2).ipynb` — exploratory analysis and model training pipeline.
- Trained artifacts: `artifacts/` — contains serialized models and pipeline objects (joblib).
  - `pipeline_with_scaler_20251018T124847Z.joblib` — preprocessing + model pipeline.
  - `elasticnet_model_20251018T124847Z.joblib` — final ElasticNet model.
  - `grid_search_elasticnet_20251018T124847Z.joblib` — grid search object (if you want to inspect hyperparams).
  - `metadata_20251018T124847Z.json` — metadata about training (features, target, date, metrics).
- `requirements.txt` — Python dependencies used for model development.

## Prerequisites

- Windows or macOS/Linux with Python 3.10+ (project was developed using Python 3.12 virtualenv in `backend/myenv`).
- Recommended: create and use a virtual environment.

## Setup (PowerShell)

Open PowerShell and run:

```powershell
cd path\to\ai-project\model_development
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If you already have a project-wide `requirements.txt` in the repository root, prefer the file in this directory which contains the model development-specific packages.

## Quick usage — load a saved pipeline and predict

Below is a minimal example that shows how to load the saved pipeline and run a single prediction. Adjust the feature names and values to match the model metadata.

```python
from joblib import load
import pandas as pd

# Path to the pipeline artifact (change name if you have a different timestamp)
model_path = "artifacts/pipeline_with_scaler_20251018T124847Z.joblib"

pipeline = load(model_path)

# Example: create a single-row DataFrame with the same columns the model expects
X_new = pd.DataFrame([{"feature_1": 1.23, "feature_2": 4.56}])

pred = pipeline.predict(X_new)
print("Prediction:", pred)
```

Notes:
- If you prefer to use `elasticnet_model_*.joblib` alone, ensure you apply the same preprocessing (scaler/encoders) used during training.
- Inspect `metadata_*.json` for the exact input column order, feature engineering steps and model metrics.

## Reproduce training / notebooks

- Open `forecasting (2).ipynb` with Jupyter or VS Code's notebook UI.
- The notebook includes data loading, preprocessing, training, and grid search steps. Follow its top cells to run training end-to-end.

## Artifacts and versioning

- Artifacts have timestamps in their filenames. When retraining models, store new artifacts with a timestamp and update `metadata_*.json` accordingly.

## Where these models are used

- The backend service (FastAPI) in the `backend/` folder consumes pipeline/model artifacts from its `artifacts/` folder at runtime. If you plan to copy artifacts to the backend, use the `backend/artifacts/` directory so the running API can find them.

## Troubleshooting

- If you get shape/column errors at predict time, verify the DataFrame columns match the training columns recorded in `metadata_*.json`.
- If joblib fails to load due to version issues, check `requirements.txt` for the Joblib and scikit-learn versions used during training.


