"""
Train emissions prediction model using IoT data
"""
import pandas as pd
import numpy as np
import json
import joblib
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

print("Loading data...")
data_path = os.path.join(script_dir, 'IoT_Simulated_Data.csv')
df = pd.read_csv(data_path)

print(f"Data shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# Load manifest to get features
manifest_path = os.path.join(script_dir, 'model_manifest.json')
with open(manifest_path, 'r') as f:
    manifest = json.load(f)

features = manifest['features']
target = 'co2e_estimated_kg'  # Use the actual target column in CSV

print(f"\nFeatures from manifest: {len(features)}")
print(f"Target: {target}")

# Engineer features to match manifest
print("\nEngineering features...")
df['timestamp'] = pd.to_datetime(df['timestamp'])

# Rename to match manifest
df['electricity_kwh'] = df['energy_usage_kwh']
df['diesel_litres'] = df['fuel_liters']
df['temp_c'] = df['temperature_c']
df['equipment_load_pct'] = df['equipment_load_%']
df['shift'] = df['shift_id'].map({'A': 0, 'B': 1, 'C': 2})

# Time features
df['hour'] = df['timestamp'].dt.hour
df['dow'] = df['timestamp'].dt.dayofweek
df['is_weekend'] = (df['dow'] >= 5).astype(int)

# Lag features for electricity
df['electricity_kwh_lag1'] = df.groupby('site_id')['electricity_kwh'].shift(1)
df['electricity_kwh_lag4'] = df.groupby('site_id')['electricity_kwh'].shift(4)
df['electricity_kwh_roll4'] = df.groupby('site_id')['electricity_kwh'].rolling(4).mean().reset_index(0, drop=True)
df['electricity_kwh_roll96'] = df.groupby('site_id')['electricity_kwh'].rolling(96).mean().reset_index(0, drop=True)

# Lag features for diesel
df['diesel_litres_lag1'] = df.groupby('site_id')['diesel_litres'].shift(1)
df['diesel_litres_lag4'] = df.groupby('site_id')['diesel_litres'].shift(4)
df['diesel_litres_roll4'] = df.groupby('site_id')['diesel_litres'].rolling(4).mean().reset_index(0, drop=True)
df['diesel_litres_roll96'] = df.groupby('site_id')['diesel_litres'].rolling(96).mean().reset_index(0, drop=True)

# Lag features for output
df['output_tons_lag1'] = df.groupby('site_id')['output_tons'].shift(1)
df['output_tons_lag4'] = df.groupby('site_id')['output_tons'].shift(4)
df['output_tons_roll4'] = df.groupby('site_id')['output_tons'].rolling(4).mean().reset_index(0, drop=True)
df['output_tons_roll96'] = df.groupby('site_id')['output_tons'].rolling(96).mean().reset_index(0, drop=True)

# Fill NaN values from lag/rolling operations
df = df.fillna(0)

print(f"Features engineered. New shape: {df.shape}")

# Check if all features exist in data
missing_features = [f for f in features if f not in df.columns]
if missing_features:
    print(f"\nWarning: Missing features in data: {missing_features}")
    # Use only available features
    features = [f for f in features if f in df.columns]
    print(f"Using {len(features)} available features")

# Prepare data
X = df[features].copy()
y = df[target].copy()

# Handle any missing values
X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
y = y.replace([np.inf, -np.inf], np.nan).fillna(0)

print(f"\nTraining data shape: X={X.shape}, y={y.shape}")

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Train set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples")

# Train model
print("\nTraining Random Forest model...")
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Evaluate
print("\nEvaluating model...")
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\nModel Performance:")
print(f"  MAE: {mae:.4f}")
print(f"  RMSE: {rmse:.4f}")
print(f"  R²: {r2:.6f}")

# Save model
print("\nSaving model...")
model_pack = {
    'model': model,
    'features': features,
    'target': target,
    'metrics': {
        'mae': mae,
        'rmse': rmse,
        'r2': r2
    }
}

output_path = os.path.join(script_dir, 'emissions_model.joblib')
joblib.dump(model_pack, output_path)
print(f"✅ Model saved to: {output_path}")

# Test prediction
print("\n" + "="*60)
print("Testing model with sample prediction...")
sample = X_test.iloc[0:1]
prediction = model.predict(sample)[0]
actual = y_test.iloc[0]
print(f"Sample features: {sample.to_dict('records')[0]}")
print(f"Predicted CO2: {prediction:.2f} kg")
print(f"Actual CO2: {actual:.2f} kg")
print(f"Error: {abs(prediction - actual):.2f} kg")
print("="*60)

print("\n✅ Model training complete! You can now use the API for predictions.")
