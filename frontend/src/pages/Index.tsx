import { Header } from "@/components/Header";
import { MetricCard } from "@/components/MetricCard";
import { ModelPrediction } from "@/components/ModelPrediction";
import { EmissionsChart } from "@/components/EmissionsChart";
import { Cloud, Zap, Fuel, Factory, TrendingDown } from "lucide-react";

const Index = () => {
  // Mock current metrics - in production, these would come from your backend
  const currentMetrics = {
    co2e: 487.3,
    electricity: 235.8,
    diesel: 67.4,
    output: 145.2,
    efficiency: 92.3,
  };

  const predictionData = {
    predictedEmissions: 492.8,
    previousEmissions: 487.3,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="mb-4 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Dashboard Overview</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time carbon emissions monitoring and predictive analytics</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <MetricCard
            title="CO2e Emissions"
            value={currentMetrics.co2e}
            unit="kg"
            icon={Cloud}
            trend={{ value: 5.2, isPositive: false }}
            subtitle="Last hour"
          />
          <MetricCard
            title="Electricity Usage"
            value={currentMetrics.electricity}
            unit="kWh"
            icon={Zap}
            trend={{ value: 3.1, isPositive: true }}
            subtitle="Current consumption"
          />
          <MetricCard
            title="Diesel Consumption"
            value={currentMetrics.diesel}
            unit="L"
            icon={Fuel}
            trend={{ value: 8.7, isPositive: false }}
            subtitle="Last hour"
          />
          <MetricCard
            title="Output Production"
            value={currentMetrics.output}
            unit="tons"
            icon={Factory}
            trend={{ value: 2.4, isPositive: true }}
            subtitle="Current shift"
          />
        </div>

        {/* Charts and Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          <div className="lg:col-span-2">
            <EmissionsChart />
          </div>
          <div>
            <ModelPrediction
              predictedEmissions={predictionData.predictedEmissions}
              previousEmissions={predictionData.previousEmissions}
            />
          </div>
        </div>

        {/* Additional Info Card */}
        <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-accent mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-foreground mb-1">Carbon Reduction Insights</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your facility is performing {currentMetrics.efficiency}% efficiently. 
                The AI model predicts optimal operating conditions to reduce emissions by up to 12% 
                while maintaining output targets.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
