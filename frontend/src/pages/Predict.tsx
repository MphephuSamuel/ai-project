import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator } from "lucide-react";

const Predict = () => {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [predictionError, setPredictionError] = useState<string>("");
  const [formData, setFormData] = useState({
    electricity_kwh: 0,
    diesel_litres: 0,
    output_tons: 0,
    temp_c: 0,
    equipment_load_pct: 0,
    shift: "A",
    hour: 0,
    dow: 0,
    is_weekend: 0,
    electricity_kwh_lag1: 0,
    electricity_kwh_lag4: 0,
    electricity_kwh_roll4: 0,
    electricity_kwh_roll96: 0,
    diesel_litres_lag1: 0,
    diesel_litres_lag4: 0,
    diesel_litres_roll4: 0,
    diesel_litres_roll96: 0,
    output_tons_lag1: 0,
    output_tons_lag4: 0,
    output_tons_roll4: 0,
    output_tons_roll96: 0,
  });

  const handleInputChange = (field: string, value: string) => {
    // shift is categorical, keep as string; others as numbers
    if (field === "shift") {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value === "" ? 0 : Number(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrediction(null);
    setPredictionError("");
    const sample: Record<string, any> = {};
    Object.entries(formData).forEach(([k, v]) => {
      if (k === "shift") {
        sample[k] = v;
      } else {
        sample[k] = typeof v === "string" ? Number(v) : v;
      }
    });
    try {
      // Get company_id from localStorage
      const company_id = Number(localStorage.getItem("company_id"));
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample, company_id })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Prediction failed");
      }
      const data = await res.json();
      setPrediction(data.co2e_total_kg ?? null);
    } catch (err: any) {
      setPredictionError(err.message || "Prediction failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
  <div className="max-w-6xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Emissions Prediction</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Enter operational parameters to predict carbon emissions</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  Input Features
                </CardTitle>
                <CardDescription className="text-sm">Provide values for the features you want to focus on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                {/* Current Metrics */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Current Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="electricity_kwh">Electricity (kWh)</Label>
                      <Input
                        id="electricity_kwh"
                        type="number"
                        step="0.01"
                        placeholder="1000"
                        value={formData.electricity_kwh}
                        onChange={(e) => handleInputChange("electricity_kwh", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diesel_litres">Diesel (Litres)</Label>
                      <Input
                        id="diesel_litres"
                        type="number"
                        step="0.01"
                        placeholder="50"
                        value={formData.diesel_litres}
                        onChange={(e) => handleInputChange("diesel_litres", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="output_tons">Output (Tons)</Label>
                      <Input
                        id="output_tons"
                        type="number"
                        step="0.01"
                        placeholder="200"
                        value={formData.output_tons}
                        onChange={(e) => handleInputChange("output_tons", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="temp_c">Temperature (°C)</Label>
                      <Input
                        id="temp_c"
                        type="number"
                        step="0.1"
                        placeholder="25"
                        value={formData.temp_c}
                        onChange={(e) => handleInputChange("temp_c", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipment_load_pct">Equipment Load (%)</Label>
                      <Input
                        id="equipment_load_pct"
                        type="number"
                        step="0.1"
                        placeholder="75"
                        value={formData.equipment_load_pct}
                        onChange={(e) => handleInputChange("equipment_load_pct", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Temporal Features */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Temporal Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shift">Shift</Label>
                      <Input
                        id="shift"
                        type="number"
                        min="0"
                        max="3"
                        placeholder="0"
                        value={formData.shift}
                        onChange={(e) => handleInputChange("shift", e.target.value)}
                        inputMode="numeric"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hour">Hour (0-23)</Label>
                      <Input
                        id="hour"
                        type="number"
                        min="0"
                        max="23"
                        placeholder="10"
                        value={formData.hour}
                        onChange={(e) => handleInputChange("hour", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dow">Day of Week (0-6)</Label>
                      <Input
                        id="dow"
                        type="number"
                        min="0"
                        max="6"
                        placeholder="2"
                        value={formData.dow}
                        onChange={(e) => handleInputChange("dow", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="is_weekend">Is Weekend</Label>
                      <Select value={String(formData.is_weekend)} onValueChange={(value) => handleInputChange("is_weekend", value)}>
                        <SelectTrigger id="is_weekend">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No</SelectItem>
                          <SelectItem value="1">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Electricity Lag Features */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Electricity Lag Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="electricity_kwh_lag1">Lag 1</Label>
                      <Input
                        id="electricity_kwh_lag1"
                        type="number"
                        step="0.01"
                        placeholder="950"
                        value={formData.electricity_kwh_lag1}
                        onChange={(e) => handleInputChange("electricity_kwh_lag1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electricity_kwh_lag4">Lag 4</Label>
                      <Input
                        id="electricity_kwh_lag4"
                        type="number"
                        step="0.01"
                        placeholder="800"
                        value={formData.electricity_kwh_lag4}
                        onChange={(e) => handleInputChange("electricity_kwh_lag4", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electricity_kwh_roll4">Roll 4</Label>
                      <Input
                        id="electricity_kwh_roll4"
                        type="number"
                        step="0.01"
                        placeholder="925"
                        value={formData.electricity_kwh_roll4}
                        onChange={(e) => handleInputChange("electricity_kwh_roll4", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electricity_kwh_roll96">Roll 96</Label>
                      <Input
                        id="electricity_kwh_roll96"
                        type="number"
                        step="0.01"
                        placeholder="850"
                        value={formData.electricity_kwh_roll96}
                        onChange={(e) => handleInputChange("electricity_kwh_roll96", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Diesel Lag Features */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Diesel Lag Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="diesel_litres_lag1">Lag 1</Label>
                      <Input
                        id="diesel_litres_lag1"
                        type="number"
                        step="0.01"
                        placeholder="48"
                        value={formData.diesel_litres_lag1}
                        onChange={(e) => handleInputChange("diesel_litres_lag1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diesel_litres_lag4">Lag 4</Label>
                      <Input
                        id="diesel_litres_lag4"
                        type="number"
                        step="0.01"
                        placeholder="45"
                        value={formData.diesel_litres_lag4}
                        onChange={(e) => handleInputChange("diesel_litres_lag4", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diesel_litres_roll4">Roll 4</Label>
                      <Input
                        id="diesel_litres_roll4"
                        type="number"
                        step="0.01"
                        placeholder="47"
                        value={formData.diesel_litres_roll4}
                        onChange={(e) => handleInputChange("diesel_litres_roll4", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diesel_litres_roll96">Roll 96</Label>
                      <Input
                        id="diesel_litres_roll96"
                        type="number"
                        step="0.01"
                        placeholder="46"
                        value={formData.diesel_litres_roll96}
                        onChange={(e) => handleInputChange("diesel_litres_roll96", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Output Lag Features */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Output Lag Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="output_tons_lag1">Lag 1</Label>
                      <Input
                        id="output_tons_lag1"
                        type="number"
                        step="0.01"
                        placeholder="195"
                        value={formData.output_tons_lag1}
                        onChange={(e) => handleInputChange("output_tons_lag1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="output_tons_lag4">Lag 4</Label>
                      <Input
                        id="output_tons_lag4"
                        type="number"
                        step="0.01"
                        placeholder="180"
                        value={formData.output_tons_lag4}
                        onChange={(e) => handleInputChange("output_tons_lag4", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="output_tons_roll4">Roll 4</Label>
                      <Input
                        id="output_tons_roll4"
                        type="number"
                        step="0.01"
                        placeholder="190"
                        value={formData.output_tons_roll4}
                        onChange={(e) => handleInputChange("output_tons_roll4", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="output_tons_roll96">Roll 96</Label>
                      <Input
                        id="output_tons_roll96"
                        type="number"
                        step="0.01"
                        placeholder="185"
                        value={formData.output_tons_roll96}
                        onChange={(e) => handleInputChange("output_tons_roll96", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Prediction
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setFormData({
                    electricity_kwh: 0,
                    diesel_litres: 0,
                    output_tons: 0,
                    temp_c: 0,
                    equipment_load_pct: 0,
                    shift: "A",
                    hour: 0,
                    dow: 0,
                    is_weekend: 0,
                    electricity_kwh_lag1: 0,
                    electricity_kwh_lag4: 0,
                    electricity_kwh_roll4: 0,
                    electricity_kwh_roll96: 0,
                    diesel_litres_lag1: 0,
                    diesel_litres_lag4: 0,
                    diesel_litres_roll4: 0,
                    diesel_litres_roll96: 0,
                    output_tons_lag1: 0,
                    output_tons_lag4: 0,
                    output_tons_roll4: 0,
                    output_tons_roll96: 0,
                  })}>
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        {/* Prediction Result Section */}
        <div className="mt-8">
          {prediction !== null && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center shadow-md animate-fade-in">
              <h2 className="text-2xl font-bold text-green-700 mb-2">Predicted CO₂ Emissions</h2>
              <p className="text-4xl font-extrabold text-green-900 mb-2">{prediction.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg</p>
              <p className="text-green-600">This is your estimated total carbon emissions for the given parameters.</p>
            </div>
          )}
          {predictionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center shadow-md animate-fade-in">
              <h2 className="text-2xl font-bold text-red-700 mb-2">Prediction Error</h2>
              <p className="text-red-800">{predictionError}</p>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
};

export default Predict;
