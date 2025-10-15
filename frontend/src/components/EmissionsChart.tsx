import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const generateMockData = () => {
  const data = [];
  const hours = 24;
  
  for (let i = 0; i < hours; i++) {
    data.push({
      hour: `${i}:00`,
      co2e: Math.random() * 100 + 450,
      electricity: Math.random() * 50 + 200,
      diesel: Math.random() * 30 + 50,
    });
  }
  
  return data;
};

export const EmissionsChart = () => {
  const data = generateMockData();
  
  return (
    <Card className="p-6 border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">24-Hour Emissions Trend</h3>
        <p className="text-sm text-muted-foreground">CO2e and energy consumption patterns</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="hour" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="co2e" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="CO2e (kg)"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="electricity" 
            stroke="hsl(var(--accent))" 
            strokeWidth={2}
            name="Electricity (kWh)"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="diesel" 
            stroke="hsl(var(--chart-4))" 
            strokeWidth={2}
            name="Diesel (L)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
