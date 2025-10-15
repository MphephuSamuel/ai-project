import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ModelPredictionProps {
  predictedEmissions: number;
  previousEmissions: number;
}

export const ModelPrediction = ({ 
  predictedEmissions, 
  previousEmissions
}: ModelPredictionProps) => {
  const difference = predictedEmissions - previousEmissions;
  const percentageChange = ((difference / previousEmissions) * 100);
  const isIncreasing = difference > 0;
  
  return (
    <Card className="p-6 border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Model Prediction</h3>
          <p className="text-sm text-muted-foreground">Next hour forecast</p>
        </div>
        <Badge className="bg-accent text-accent-foreground">
          {isIncreasing ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          Live
        </Badge>
      </div>
      
      <div className="space-y-4 mb-4">
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Predicted CO2e</p>
          <p className="text-3xl font-bold text-primary">{predictedEmissions.toFixed(1)} kg</p>
          <div className="flex items-center gap-2 mt-2">
            {isIncreasing ? (
              <TrendingUp className="w-4 h-4 text-destructive" />
            ) : (
              <TrendingDown className="w-4 h-4 text-accent" />
            )}
            <span className={`text-sm font-medium ${isIncreasing ? 'text-destructive' : 'text-accent'}`}>
              {isIncreasing ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="p-4 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Previous Hour</p>
          <p className="text-2xl font-bold text-foreground">{previousEmissions.toFixed(1)} kg</p>
        </div>
      </div>
    </Card>
  );
};
