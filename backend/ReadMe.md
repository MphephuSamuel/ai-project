# Emissions Model API — Usage & docs

This document describes a minimal HTTP API that serves the saved emissions model (`model_development/emissions_model.joblib`). The API is designed to be simple to run locally and to integrate into a backend service.

Suggested framework: FastAPI (lightweight, async, automatic OpenAPI docs). You can use Flask if you prefer.

## Endpoints (recommended)

1. GET /health
   - Purpose: basic liveness/health check.
   - Response: 200 OK with JSON {"status": "ok"}

2. GET /metadata
   - Purpose: return model metadata (loaded feature list, manifest contents).
   - Response example:
     {
       "features": [...],
       "target": "co2e_observed_kg",
       "rows": 69144,
       "metrics": {"mae": 3.95, "rmse": 5.23, "r2": 0.99998}
     }

3. POST /predict
   - Purpose: accept a single sample (or batch) and return predicted emissions and optional intensities.
   - Request JSON (single sample):
     {
       "sample": { "electricity_kwh": 1000, "diesel_litres": 50, "output_tons": 200, ... }
     }

   - Request JSON (batch):
     {
       "samples": [ { ... }, { ... } ]
     }

   - Response (single):
     {
       "co2e_total_kg": 1234.5,
       "intensity": { "kg_per_kwh": 1.2345 }
     }

   - Response (batch):
     {
       "predictions": [ {"co2e_total_kg": 1234.5, "intensity": {...}}, ... ]
     }

## Example FastAPI implementation (summary)

- Load the joblib file once at startup: pack = joblib.load('model_development/emissions_model.joblib')
- Extract model and feature list: model = pack['model']; feats = pack['features']
- For each incoming request: create a pandas DataFrame with the same `feats` columns, apply the same inf/NaN cleaning (replace([np.inf,-np.inf], np.nan).fillna(0)), then call model.predict(X).

Important: the pipeline saved in the joblib includes preprocessing; do not re-apply preprocessing. Only construct DataFrame columns in the same order as `feats`.

## Local run steps (Windows PowerShell)

```powershell
# from repository root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn joblib pandas numpy

# run the app (example module name: backend.api_app:app)
uvicorn backend.api_app:app --reload --port 8000
```

Open http://127.0.0.1:8000/docs for interactive API docs (if using FastAPI).

## Example request (PowerShell using Invoke-RestMethod)

```powershell
# single sample
$body = @{
  sample = @{
    electricity_kwh = 1000
    diesel_litres = 50
    output_tons = 200
    temp_c = 25
    equipment_load_pct = 75
    shift = 'A'
    hour = 10
    dow = 2
    is_weekend = 0
    electricity_kwh_lag1 = 950
    electricity_kwh_lag4 = 800
    electricity_kwh_roll4 = 925
    electricity_kwh_roll96 = 850
    diesel_litres_lag1 = 48
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri http://127.0.0.1:8000/predict -Method POST -Body $body -ContentType 'application/json'
```

## Security and validation

- Validate incoming JSON. Reject requests that are missing required numeric columns (or provide defaults).
- Rate-limit or authenticate the endpoint in production.

## Error handling

- Return HTTP 400 for malformed input with a clear error message.
- Return HTTP 500 for server errors and log stack traces to a file or monitoring system.

## Example file I can add for you

- `backend/api_app.py` — FastAPI app that implements the endpoints above.

If you want, I will create `backend/api_app.py` with a FastAPI implementation matching this README and include a small test script. Which would you prefer: FastAPI or Flask? Also confirm whether `model_development/emissions_model.joblib` will be present at that path when serving, or if you want a different path.

## Concrete examples & expected responses (quick tests)

Follow these steps after you start the server with uvicorn (see "Local run steps"). The examples below assume the app is reachable at http://127.0.0.1:8000.

1) Health check

PowerShell:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/health -Method GET
```

Expected response:

```json
{"status": "ok"}
```

curl:

```bash
curl -s http://127.0.0.1:8000/health
```

2) Metadata (features and manifest)

PowerShell:

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8000/metadata -Method GET | ConvertTo-Json -Depth 5
```

Expected response (example):

```json
{
  "features": ["electricity_kwh","diesel_litres","output_tons","temp_c", ...],
  "target": "co2e_observed_kg",
  "rows": 69144,
  "metrics": {"mae": 3.958, "rmse": 5.233, "r2": 0.99998}
}
```

3) Predict — single sample (PowerShell)

Below is the same example you provided, wrapped as a JSON body for the API. The server will construct a DataFrame with the model's `features` and call predict.

```powershell
$body = @{
  sample = @{
    electricity_kwh = 1000
    diesel_litres = 50
    output_tons = 200
    temp_c = 25
    equipment_load_pct = 75
    shift = 'A'
    hour = 10
    dow = 2
    is_weekend = 0
    electricity_kwh_lag1 = 950
    electricity_kwh_lag4 = 800
    electricity_kwh_roll4 = 925
    electricity_kwh_roll96 = 850
    diesel_litres_lag1 = 48
  }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri http://127.0.0.1:8000/predict -Method POST -Body $body -ContentType 'application/json' | ConvertTo-Json -Depth 4
```

Expected single-sample response (example):

```json
{
  "co2e_total_kg": 1234.56,
  "intensity": { "kg_per_kwh": 1.2345, "kg_per_ton": 6.1728 }
}
```

4) Predict — batch (curl)

Save the following JSON as `batch.json` and post it with curl:

batch.json

```json
{
  "samples": [
    {
      "electricity_kwh": 1000,
      "diesel_litres": 50,
      "output_tons": 200,
      "temp_c": 25,
      "equipment_load_pct": 75,
      "shift": "A",
      "hour": 10,
      "dow": 2,
      "is_weekend": 0,
      "electricity_kwh_lag1": 950,
      "electricity_kwh_lag4": 800,
      "electricity_kwh_roll4": 925,
      "electricity_kwh_roll96": 850,
      "diesel_litres_lag1": 48
    },
    {
      "electricity_kwh": 2000,
      "diesel_litres": 0,
      "output_tons": 400,
      "temp_c": 22,
      "equipment_load_pct": 60,
      "shift": "B",
      "hour": 14,
      "dow": 1,
      "is_weekend": 0,
      "electricity_kwh_lag1": 1980,
      "electricity_kwh_lag4": 1700,
      "electricity_kwh_roll4": 1950,
      "electricity_kwh_roll96": 1800,
      "diesel_litres_lag1": 0
    }
  ]
}
```

curl command:

```bash
curl -s -X POST http://127.0.0.1:8000/predict -H "Content-Type: application/json" -d @batch.json
```

Expected batch response (example):

```json
{
  "predictions": [
    { "co2e_total_kg": 1234.56, "intensity": {"kg_per_kwh": 1.2345} },
    { "co2e_total_kg": 2100.00, "intensity": {"kg_per_kwh": 1.05} }
  ]
}
```

Notes on verifying the examples:

- If `/metadata` returns a `features` list different from the keys you send, adapt the JSON keys or let the server map missing keys to 0 before predict (recommended for robust clients).
- If a requested sample omits lag or roll features, the API can either reject the request (400) or accept it and substitute 0s — the notebook's training used filled zeros for early rows, so substituting 0 is the more forgiving option.
- Use the FastAPI docs at `/docs` to interactively try the endpoints in a browser.

