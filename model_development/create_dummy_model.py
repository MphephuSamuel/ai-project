"""
Create a simple dummy model for testing the API
This allows you to test the predict endpoint immediately
"""
import json
import joblib
import numpy as np

print("Creating dummy model for testing...")

# Get script directory
import os
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load manifest to get features
manifest_path = os.path.join(script_dir, 'model_manifest.json')
with open(manifest_path, 'r') as f:
    manifest = json.load(f)

features = manifest['features']
print(f"Features: {len(features)}")

# Create a simple dummy model that predicts based on electricity and diesel
class DummyEmissionsModel:
    """Simple model that estimates CO2 based on electricity and fuel"""
    
    def predict(self, X):
        """
        Simple formula: CO2 ≈ (electricity * 0.5) + (diesel * 2.7) + base
        - Electricity: ~0.5 kg CO2 per kWh
        - Diesel: ~2.7 kg CO2 per liter
        """
        predictions = []
        for i in range(len(X)):
            # Get electricity and diesel, default to 0 if not present
            elec = X.iloc[i].get('electricity_kwh', 0) if hasattr(X, 'iloc') else X.get('electricity_kwh', 0)
            diesel = X.iloc[i].get('diesel_litres', 0) if hasattr(X, 'iloc') else X.get('diesel_litres', 0)
            output = X.iloc[i].get('output_tons', 0) if hasattr(X, 'iloc') else X.get('output_tons', 0)
            
            # Simple emissions calculation
            co2 = (elec * 0.5) + (diesel * 2.7) + (output * 0.1) + 10
            predictions.append(co2)
        
        return np.array(predictions)

# Create and save the model
model = DummyEmissionsModel()

model_pack = {
    'model': model,
    'features': features,
    'target': 'co2e_observed_kg',
    'note': 'This is a dummy model for testing. Train a real model for production use.'
}

output_path = os.path.join(script_dir, 'emissions_model.joblib')
joblib.dump(model_pack, output_path)
print(f"✅ Dummy model saved to: {output_path}")
print("\nYou can now test the API!")
print("The model uses a simple formula: CO2 ≈ (electricity * 0.5) + (diesel * 2.7) + (output * 0.1) + 10")
print("\nExample prediction for {electricity_kwh: 1000, diesel_litres: 50, output_tons: 200}:")
print(f"  CO2 = (1000 * 0.5) + (50 * 2.7) + (200 * 0.1) + 10 = {(1000 * 0.5) + (50 * 2.7) + (200 * 0.1) + 10} kg")
