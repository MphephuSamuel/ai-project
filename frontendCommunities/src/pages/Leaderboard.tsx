import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, School, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

interface LeaderboardEntry {
  rank: number;
  name: string;
  location: string;
  points: number;
  co2Saved: number;
  trend: "up" | "down" | "same";
}

const Leaderboard = () => {
  const individuals: LeaderboardEntry[] = [
    { rank: 1, name: "Thandi M.", location: "Soweto", points: 1250, co2Saved: 156, trend: "up" },
    { rank: 2, name: "Sipho K.", location: "Umlazi", points: 1180, co2Saved: 148, trend: "same" },
    { rank: 3, name: "Nomsa R.", location: "Alexandra", points: 1120, co2Saved: 140, trend: "up" },
    { rank: 4, name: "Mandla T.", location: "Soweto", points: 980, co2Saved: 122, trend: "down" },
    { rank: 5, name: "Zanele N.", location: "KwaMashu", points: 875, co2Saved: 109, trend: "up" },
  ];

  const communities: LeaderboardEntry[] = [
    { rank: 1, name: "Soweto Green Initiative", location: "Soweto", points: 8450, co2Saved: 1056, trend: "up" },
    { rank: 2, name: "Umlazi Climate Warriors", location: "Umlazi", points: 7820, co2Saved: 978, trend: "up" },
    { rank: 3, name: "Alexandra Eco-Heroes", location: "Alexandra", points: 6990, co2Saved: 874, trend: "same" },
  ];

  const schools: LeaderboardEntry[] = [
    { rank: 1, name: "Soweto High School", location: "Soweto", points: 5600, co2Saved: 700, trend: "up" },
    { rank: 2, name: "Umlazi Secondary", location: "Umlazi", points: 4890, co2Saved: 611, trend: "up" },
    { rank: 3, name: "Alexandra Academy", location: "Alexandra", points: 4200, co2Saved: 525, trend: "down" },
  ];

  const renderLeaderboard = (entries: LeaderboardEntry[]) => (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card 
          key={entry.rank} 
          className={`p-5 hover:shadow-medium transition-all ${
            entry.rank <= 3 ? "border-2 border-primary/30 bg-primary/5" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
              entry.rank === 1 ? "bg-gradient-reward text-reward-foreground" :
              entry.rank === 2 ? "bg-secondary/20 text-secondary" :
              entry.rank === 3 ? "bg-accent/20 text-accent" :
              "bg-muted text-muted-foreground"
            }`}>
              {entry.rank === 1 ? "🏆" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
            </div>
            
            <Avatar className="h-12 w-12 bg-primary/10">
              <AvatarFallback className="text-primary font-semibold">
                {entry.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{entry.name}</h3>
                {entry.trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{entry.location}</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                {entry.points}
              </div>
              <Badge variant="outline" className="text-xs">
                {entry.co2Saved}kg CO₂
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-reward/10 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-reward" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('leaderboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t("leaderboard.subtitle")}
          </p>
        </div>

        {/* Your Rank Card */}
        <Card className="p-6 mb-8 bg-gradient-sky text-accent-foreground shadow-medium">
          <div className="text-center">
            <div className="text-sm font-medium mb-2">{t('leaderboard.yourRankTitle')}</div>
            <div className="text-5xl font-bold mb-2">#127</div>
            <p className="text-accent-foreground/90">
              {t('leaderboard.yourRankDesc')}
            </p>
          </div>
        </Card>

        <Tabs defaultValue="individuals" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="individuals">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('leaderboard.tabs.individuals')}</span>
            </TabsTrigger>
            <TabsTrigger value="communities">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('leaderboard.tabs.communities')}</span>
            </TabsTrigger>
            <TabsTrigger value="schools">
              <School className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('leaderboard.tabs.schools')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individuals">
            {renderLeaderboard(individuals)}
          </TabsContent>

          <TabsContent value="communities">
            {renderLeaderboard(communities)}
          </TabsContent>

          <TabsContent value="schools">
            {renderLeaderboard(schools)}
          </TabsContent>
        </Tabs>

        <Card className="p-6 mt-8 bg-muted/50">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {t('leaderboard.howItWorks.title')}
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('leaderboard.howItWorks.1')}</li>
            <li>• {t('leaderboard.howItWorks.2')}</li>
            <li>• {t('leaderboard.howItWorks.3')}</li>
            <li>• {t('leaderboard.howItWorks.4')}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
