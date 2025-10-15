import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Zap, UtensilsCrossed, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/useI18n";

const Calculator = () => {
  const { t } = useI18n();
  const [transport, setTransport] = useState("");
  const [distance, setDistance] = useState("");
  const [electricity, setElectricity] = useState("");
  const [meatMeals, setMeatMeals] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const calculateEmissions = () => {
    // Simple emission factors (kg CO2 per unit)
    const transportFactors: Record<string, number> = {
      car: 0.21,
      bus: 0.10,
      walk: 0,
      bicycle: 0,
      taxi: 0.25,
    };

    const distanceNum = parseFloat(distance) || 0;
    const electricityNum = parseFloat(electricity) || 0;
    const meatMealsNum = parseInt(meatMeals) || 0;

    const transportEmissions = (transportFactors[transport] || 0) * distanceNum;
    const electricityEmissions = electricityNum * 0.5; // 0.5 kg CO2 per kWh
    const foodEmissions = meatMealsNum * 2.5; // 2.5 kg CO2 per meat meal

    const total = transportEmissions + electricityEmissions + foodEmissions;
    setResult(total);

    toast.success(t('calc.toastSuccess'), {
      description: `${t('calc.toastDescPrefix')} ${total.toFixed(2)} kg CO₂`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('calc.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('calc.subtitle')}
          </p>
        </div>

        <Card className="p-6 shadow-medium mb-6">
          <div className="space-y-6">
            {/* Transport */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">{t('calc.transport')}</Label>
              </div>
              <Select value={transport} onValueChange={setTransport}>
                <SelectTrigger>
                  <SelectValue placeholder={t('calc.selectTransport')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk">{t('calc.walking')}</SelectItem>
                  <SelectItem value="bicycle">{t('calc.bicycle')}</SelectItem>
                  <SelectItem value="bus">{t('calc.bus')}</SelectItem>
                  <SelectItem value="taxi">{t('calc.taxi')}</SelectItem>
                  <SelectItem value="car">{t('calc.car')}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t('calc.distancePlaceholder')}
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{t('calc.kmPerDay')}</span>
              </div>
            </div>

            {/* Electricity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-accent" />
                <Label className="text-base font-semibold">{t('calc.electricityUse')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={t('calc.hoursPlaceholder')}
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">{t('calc.kWhPerDay')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('calc.avgHousehold')}
              </p>
            </div>

            {/* Food */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="h-5 w-5 text-secondary" />
                <Label className="text-base font-semibold">{t('calc.foodChoices')}</Label>
              </div>
              <Input
                type="number"
                placeholder={t('calc.meatMealsPlaceholder')}
                value={meatMeals}
                onChange={(e) => setMeatMeals(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('calc.mealsHint')}
              </p>
            </div>

            <Button 
              onClick={calculateEmissions} 
              className="w-full bg-gradient-earth"
              size="lg"
            >
              {t('calc.calculateButton')}
            </Button>
          </div>
        </Card>

        {result !== null && (
          <Card className="p-6 bg-gradient-sky text-accent-foreground shadow-medium animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">{t('calc.result.title')}</h3>
              <div className="text-5xl font-bold mb-4">{result.toFixed(2)} kg</div>
              <p className="mb-4">{t('calc.result.co2PerDay')}</p>
              <div className="bg-accent-foreground/10 rounded-lg p-4">
                <p className="text-sm">
                  💡 <strong>{t('calc.tip.prefix')}</strong> {result < 5 
                    ? t('calc.tip.low') 
                    : result < 10 
                    ? t('calc.tip.mid')
                    : t('calc.tip.high')}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">0-5 kg</div>
              <div className="text-sm text-muted-foreground">{t('calc.range.excellent')}</div>
            </div>
          </Card>
          <Card className="p-4 bg-accent/5 border-accent/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent mb-1">5-10 kg</div>
              <div className="text-sm text-muted-foreground">{t('calc.range.average')}</div>
            </div>
          </Card>
          <Card className="p-4 bg-destructive/5 border-destructive/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive mb-1">10+ kg</div>
              <div className="text-sm text-muted-foreground">{t('calc.range.needsWork')}</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
