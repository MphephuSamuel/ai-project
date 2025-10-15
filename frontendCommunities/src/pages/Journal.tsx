import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Recycle, Bike, Lightbulb, Droplet, TreePine } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/useI18n";

interface JournalEntry {
  id: string;
  action: string;
  description: string;
  category: string;
  points: number;
  date: string;
}

const Journal = () => {
  const { t } = useI18n();
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      action: "Cycled to work",
      description: "Used bicycle instead of car for 10km",
      category: "Transport",
      points: 20,
      date: "2025-01-20",
    },
    {
      id: "2",
      action: "Planted trees",
      description: "Planted 3 indigenous trees in community garden",
      category: "Nature",
      points: 50,
      date: "2025-01-19",
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [action, setAction] = useState("");
  const [description, setDescription] = useState("");

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Transport: Bike,
    Energy: Lightbulb,
    Water: Droplet,
    Waste: Recycle,
    Nature: TreePine,
  };

  const addEntry = () => {
    if (!action) {
      toast.error(t('journal.form.actionPlaceholder'));
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      action,
      description,
      category: "Energy", // Default category
      points: 10,
      date: new Date().toISOString().split("T")[0],
    };

    setEntries([newEntry, ...entries]);
    setAction("");
    setDescription("");
    setShowForm(false);
    toast.success(t('journal.logNewAction'), {
      description: "+10 Eco-Points earned! 🌱",
    });
  };

  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('journal.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('journal.subtitle')}
          </p>
        </div>

        {/* Points Summary */}
        <Card className="p-6 bg-gradient-reward text-reward-foreground shadow-medium mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{totalPoints}</div>
            <p className="text-lg">{t('journal.totalPoints')}</p>
          </div>
        </Card>

        {/* Add Entry Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full mb-6 bg-gradient-earth"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('journal.logNewAction')}
          </Button>
        )}

        {/* Add Entry Form */}
        {showForm && (
          <Card className="p-6 mb-6 shadow-medium animate-in fade-in slide-in-from-top-4">
            <h3 className="text-lg font-semibold mb-4">{t('journal.form.title')}</h3>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder={t('journal.form.actionPlaceholder')}
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder={t('journal.form.detailsPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addEntry} className="flex-1 bg-gradient-earth">
                  {t('journal.form.save')}
                </Button>
                <Button 
                  onClick={() => setShowForm(false)} 
                  variant="outline"
                  className="flex-1"
                >
                  {t('journal.form.cancel')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">{t('journal.recentActions')}</h3>
          {entries.map((entry) => {
            const Icon = categoryIcons[entry.category] || TreePine;
            return (
              <Card key={entry.id} className="p-5 hover:shadow-medium transition-shadow">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{entry.action}</h4>
                      <Badge className="bg-reward text-reward-foreground">
                        +{entry.points} pts
                      </Badge>
                    </div>
                    {entry.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {entry.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{entry.category}</Badge>
                      <span>•</span>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Suggested Actions */}
        <Card className="p-6 mt-8 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            💡 {t('journal.suggested.title')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('journal.suggested.item1')}</li>
            <li>• {t('journal.suggested.item2')}</li>
            <li>• {t('journal.suggested.item3')}</li>
            <li>• {t('journal.suggested.item4')}</li>
            <li>• {t('journal.suggested.item5')}</li>
            <li>• {t('journal.suggested.item6')}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Journal;
