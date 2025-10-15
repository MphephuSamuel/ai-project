"""carbon_scope_ai.py

Converted from notebook `carbon_scope_ai.ipynb` into a runnable script.

Usage examples (from `model_development`):
    python carbon_scope_ai.py --train-main       # trains model on IoT_Simulated_Data.csv
    python carbon_scope_ai.py --train-df-co      # trains models on Co2_Emissions_by_Sectors.csv
    python carbon_scope_ai.py --predict-sample   # run a sample prediction using the saved model

The script keeps notebook logic but removes interactive display() calls and guards plotting behind --plot.
"""

from __future__ import annotations
import argparse
import json
import os
from math import sqrt
from typing import Dict, Any

import pandas as pd
import numpy as np

# These sklearn imports are used for training. If you only want to run prediction with a saved model,
# you can avoid running training and still use predict (joblib will load the model).
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# Optional plotting
try:
    import matplotlib.pyplot as plt
    PLOTTING_AVAILABLE = True
except Exception:
    PLOTTING_AVAILABLE = False

ROOT = os.path.dirname(__file__)


def load_iot_data(path: str = "IoT_Simulated_Data.csv") -> pd.DataFrame:
    p = os.path.join(ROOT, path)
    print(f"Loading IoT data from {p}")
    df = pd.read_csv(p, parse_dates=["timestamp"]) if os.path.exists(p) else pd.DataFrame()
    return df


def load_df_co(path: str = "Co2_Emissions_by_Sectors.csv") -> pd.DataFrame:
    p = os.path.join(ROOT, path)
    print(f"Loading country-level CO2 data from {p}")
    df_co = pd.read_csv(p) if os.path.exists(p) else pd.DataFrame()
    return df_co


def basic_preprocess_iot(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    # drop rows without co2 estimate and fill remaining NaNs with 0
    if "co2e_estimated_kg" in df.columns:
        df = df.dropna(subset=["co2e_estimated_kg"]) 
    df = df.fillna(0)

    # add time features
    if "timestamp" in df.columns:
        df["hour"] = df["timestamp"].dt.hour
        df["dow"] = df["timestamp"].dt.dayofweek
        df["is_weekend"] = (df["dow"] >= 5).astype(int)

    # ensure site id
    if "site_id" not in df.columns:
        df["site_id"] = "SITE_1"

    # rename common columns to expected names (if present)
    rename_map = {
        "energy_usage_kwh": "electricity_kwh",
        "fuel_liters": "diesel_litres",
        "temperature_c": "temp_c",
        "equipment_load_%": "equipment_load_pct",
        "shift_id": "shift",
        "co2e_estimated_kg": "co2e_observed_kg",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

    # ensure numeric
    for c in ["electricity_kwh", "diesel_litres", "output_tons", "temp_c", "equipment_load_pct"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    # sort
    if set(["site_id", "timestamp"]).issubset(df.columns):
        df = df.sort_values(["site_id", "timestamp"]).reset_index(drop=True)

    # engineer lags and rolling features for drivers
    drivers = [c for c in ["electricity_kwh", "diesel_litres", "output_tons"] if c in df.columns]
    for col in drivers:
        g = df.groupby("site_id")[col]
        df[f"{col}_lag1"] = g.shift(1).reset_index(level=0, drop=True)
        df[f"{col}_lag4"] = g.shift(4).reset_index(level=0, drop=True)
        df[f"{col}_roll4"] = g.rolling(4, min_periods=1).mean().reset_index(level=0, drop=True)
        df[f"{col}_roll96"] = g.rolling(96, min_periods=1).mean().reset_index(level=0, drop=True)

    # fill created NaNs
    eng_cols = [c for c in df.columns if any(s in c for s in ["_lag1", "_lag4", "_roll4", "_roll96"]) ]
    if eng_cols:
        df[eng_cols] = df[eng_cols].fillna(0)

    return df


def train_iot_model(df: pd.DataFrame, plot: bool = True) -> Dict[str, Any]:
    if df.empty:
        raise ValueError("Input dataframe is empty. Can't train.")

    target = "co2e_observed_kg" if "co2e_observed_kg" in df.columns else "co2e_estimated_kg"
    base_feats = [c for c in [
        "electricity_kwh", "diesel_litres", "output_tons",
        "temp_c", "equipment_load_pct", "shift",
        "hour", "dow", "is_weekend"
    ] if c in df.columns]
    eng_feats = [c for c in df.columns if c.endswith(("_lag1", "_lag4", "_roll4", "_roll96"))]
    features = base_feats + eng_feats
    print("Using features:", len(features), "->", features[:10], "..." if len(features) > 10 else "")

    X = df[features].copy()
    y = df[target].astype(float).copy()
    X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

    split_idx = int(len(df) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    categorical = [c for c in ["shift"] if c in X.columns]
    numeric = [c for c in X.columns if c not in categorical]

    if len(categorical) > 0:
        preprocess = ColumnTransformer([
            ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
            ("num", StandardScaler(), numeric),
        ])
    else:
        preprocess = StandardScaler()

    model = Pipeline([
        ("prep", preprocess),
        ("reg", RandomForestRegressor(n_estimators=400, max_depth=None, random_state=42, n_jobs=-1))
    ])

    print("Training RandomForestRegressor...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Test MAE:  {mae:,.2f}")
    print(f"Test RMSE: {rmse:,.2f}")
    print(f"Test R²:   {r2:,.3f}")

    # save
    out = {"model": model, "features": features}
    joblib.dump(out, os.path.join(ROOT, "emissions_model.joblib"))
    with open(os.path.join(ROOT, "model_manifest.json"), "w") as f:
        json.dump({
            "features": features,
            "target": target,
            "rows": int(len(df)),
            "train_rows": int(len(X_train)),
            "test_rows": int(len(X_test)),
            "metrics": {"mae": float(mae), "rmse": float(rmse), "r2": float(r2)}
        }, f, indent=2)
    print("Saved emissions_model.joblib and model_manifest.json")

    if plot and PLOTTING_AVAILABLE:
        try:
            rf = model.named_steps["reg"]
            if hasattr(model.named_steps["prep"], "get_feature_names_out"):
                feat_names = model.named_steps["prep"].get_feature_names_out()
            else:
                feat_names = X.columns
            importances = rf.feature_importances_
            imp = pd.DataFrame({"feature": feat_names, "importance": importances}).sort_values("importance", ascending=False)
            print(imp.head(15))
            imp.head(15).plot(kind="barh", x="feature", y="importance", legend=False, figsize=(8,6))
            plt.gca().invert_yaxis()
            plt.title("Top 15 Feature Importances (Random Forest)")
            plt.tight_layout()
            plt.show()
        except Exception as e:
            print("Plotting failed:", e)

    return {"model": model, "features": features, "metrics": {"mae": mae, "rmse": rmse, "r2": r2}}


def predict_emissions_from_sample(sample: Dict[str, Any]) -> Dict[str, Any]:
    p = os.path.join(ROOT, "emissions_model.joblib")
    if not os.path.exists(p):
        raise FileNotFoundError("Saved model not found. Run training first or provide a joblib file named emissions_model.joblib in the same folder.")
    pack = joblib.load(p)
    mdl, feats = pack["model"], pack["features"]
    Xnew = pd.DataFrame([sample])[feats].replace([np.inf, -np.inf], np.nan).fillna(0)
    yhat = float(mdl.predict(Xnew)[0])
    intensity = {}
    if "electricity_kwh" in Xnew.columns and Xnew.at[0, "electricity_kwh"] > 0:
        intensity["kg_per_kwh"] = yhat / Xnew.at[0, "electricity_kwh"]
    if "output_tons" in Xnew.columns and Xnew.at[0, "output_tons"] > 0:
        intensity["kg_per_ton"] = yhat / Xnew.at[0, "output_tons"]
    return {"co2e_total_kg": yhat, "intensity": intensity}


# ----- df_co (country-level) helpers -----

def prepare_df_co(df_co: pd.DataFrame) -> pd.DataFrame:
    if df_co.empty:
        return df_co
    categorical_cols = [c for c in ["Industry_Type", "Region", "Country"] if c in df_co.columns]
    if categorical_cols:
        df_encoded = pd.get_dummies(df_co, columns=categorical_cols, drop_first=True)
    else:
        df_encoded = df_co.copy()
    return df_encoded


def train_df_co_models(df_co: pd.DataFrame, plot: bool = True) -> Dict[str, Any]:
    if df_co.empty:
        raise ValueError("df_co is empty")
    df_co_encoded = prepare_df_co(df_co)
    target_co = "Co2_Emissions_MetricTons"
    features_co = [col for col in df_co_encoded.columns if col != target_co]

    from sklearn.model_selection import train_test_split
    X_train_co, X_test_co, y_train_co, y_test_co = train_test_split(
        df_co_encoded[features_co], df_co_encoded[target_co], test_size=0.2, random_state=42
    )

    rf = RandomForestRegressor(n_estimators=400, max_depth=None, random_state=42, n_jobs=-1)
    rf.fit(X_train_co, y_train_co)
    y_pred_co = rf.predict(X_test_co)

    mae_co = mean_absolute_error(y_test_co, y_pred_co)
    rmse_co = np.sqrt(mean_squared_error(y_test_co, y_pred_co))
    r2_co = r2_score(y_test_co, y_pred_co)
    print(f"Test MAE for Random Forest on df_co: {mae_co:,.4f}")
    print(f"Test RMSE for Random Forest on df_co: {rmse_co:,.4f}")
    print(f"Test R² for Random Forest on df_co: {r2_co:,.4f}")

    try:
        import matplotlib.pyplot as plt
        if plot and PLOTTING_AVAILABLE:
            plt.figure(figsize=(8, 6))
            plt.scatter(y_test_co, y_pred_co, alpha=0.5)
            plt.plot([y_test_co.min(), y_test_co.max()], [y_test_co.min(), y_test_co.max()], 'k--', lw=2)
            plt.xlabel("Actual CO2 Emissions (Metric Tons)")
            plt.ylabel("Predicted CO2 Emissions (Metric Tons)")
            plt.title("Predicted vs. Actual CO2 Emissions (df_co Test Set - Random Forest)")
            plt.grid(True)
            plt.tight_layout()
            plt.show()
    except Exception:
        pass

    return {"model": rf, "features": features_co, "metrics": {"mae": mae_co, "rmse": rmse_co, "r2": r2_co}}


def main(args: argparse.Namespace) -> None:
    if args.train_main:
        df = load_iot_data()
        df = basic_preprocess_iot(df)
        if df.empty:
            print("IoT dataset not found or empty. Ensure IoT_Simulated_Data.csv is present in the same folder.")
        else:
            res = train_iot_model(df, plot=args.plot)

    if args.train_df_co:
        df_co = load_df_co()
        if df_co.empty:
            print("df_co CSV not found or empty. Ensure Co2_Emissions_by_Sectors.csv is present in the same folder.")
        else:
            res_co = train_df_co_models(df_co, plot=args.plot)

    if args.predict_sample:
        # sample similar to the notebook
        sample_data = {
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
            "diesel_litres_lag1": 48,
            "diesel_litres_lag4": 45,
            "diesel_litres_roll4": 49,
            "diesel_litres_roll96": 52,
            "output_tons_lag1": 190,
            "output_tons_lag4": 180,
            "output_tons_roll4": 195,
            "output_tons_roll96": 210,
        }
        try:
            pred = predict_emissions_from_sample(sample_data)
            print("Prediction for sample:", pred)
        except Exception as e:
            print("Prediction failed:", e)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Carbon Scope AI training/eval/predict from script converted from notebook")
    parser.add_argument("--train-main", action="store_true", help="Train emissions model on IoT_Simulated_Data.csv")
    parser.add_argument("--train-df-co", action="store_true", help="Train country-level models on Co2_Emissions_by_Sectors.csv")
    parser.add_argument("--predict-sample", action="store_true", help="Run a sample prediction using saved model")
    parser.add_argument("--no-plot", dest="plot", action="store_false", help="Disable plotting (useful on headless servers)")
    parser.set_defaults(plot=True)
    args = parser.parse_args()
    main(args)
