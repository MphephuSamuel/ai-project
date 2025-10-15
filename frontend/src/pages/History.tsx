import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Replace with your auth/user context if available
const getCompanyId = () => {
  // Example: read from localStorage or context
  return Number(localStorage.getItem("company_id"));
};

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const company_id = getCompanyId();
    if (!company_id) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    fetch(`http://127.0.0.1:8000/history?company_id=${company_id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch history");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Prediction History</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">All your past predictions with input details and results</p>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : history.length === 0 ? (
            <div>No predictions found.</div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => {
                let values = {};
                try {
                  values = JSON.parse(item.values);
                } catch {}
                return (
                  <Card key={item.emission_id}>
                    <CardHeader>
                      <CardTitle>Prediction on {format(new Date(item.recorded_at), "yyyy-MM-dd HH:mm")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <span className="font-semibold">Prediction:</span> {values['prediction']} kg CO2e
                      </div>
                      <div>
                        <span className="font-semibold">Input:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-muted p-3 rounded mt-1">
                          {values['input'] && Object.entries(values['input']).map(([key, val]) => (
                            <div key={key} className="flex flex-col">
                              <span className="text-xs text-muted-foreground font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              <span className="text-sm font-semibold text-foreground">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
