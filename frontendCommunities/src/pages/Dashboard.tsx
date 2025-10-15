import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Sparkles, Target, TrendingDown, Award } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

const Dashboard = () => {
  const userStats = {
    totalPoints: 350,
    co2Saved: 45.2,
    actionsLogged: 28,
    weeklyGoal: 50,
    weeklyProgress: 35,
    rank: 127,
  };

  const achievements = [
    { name: "First Steps", icon: "🌱", unlocked: true, description: "Log your first action" },
    { name: "Week Warrior", icon: "⚡", unlocked: true, description: "Complete 7 days in a row" },
    { name: "Tree Hugger", icon: "🌳", unlocked: true, description: "Plant 5 trees" },
    { name: "Carbon Crusher", icon: "💪", unlocked: false, description: "Save 100kg CO₂" },
    { name: "Community Leader", icon: "👑", unlocked: false, description: "Get 1000 points" },
  ];

  const recentActivity = [
    { action: "Cycled to work", points: 20, date: "Today" },
    { action: "Used reusable bags", points: 10, date: "Today" },
    { action: "Planted trees", points: 50, date: "Yesterday" },
  ];

  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-reward text-reward-foreground shadow-medium">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6" />
              <div className="text-sm font-medium">{t('dashboard.stats.ecoPoints')}</div>
            </div>
            <div className="text-4xl font-bold">{userStats.totalPoints}</div>
            <p className="text-sm mt-1 text-reward-foreground/80">
              {t('dashboard.rankInCommunity', { rank: String(userStats.rank) })}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-earth text-primary-foreground shadow-medium">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-6 w-6" />
              <div className="text-sm font-medium">{t('dashboard.stats.co2Saved')}</div>
            </div>
            <div className="text-4xl font-bold">{userStats.co2Saved} kg</div>
            <p className="text-sm mt-1 text-primary-foreground/80">
              {t('dashboard.thisMonth')}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-sky text-accent-foreground shadow-medium">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-6 w-6" />
              <div className="text-sm font-medium">{t('dashboard.stats.actionsLogged')}</div>
            </div>
            <div className="text-4xl font-bold">{userStats.actionsLogged}</div>
            <p className="text-sm mt-1 text-accent-foreground/80">
              {t('dashboard.keepItUp')}
            </p>
          </Card>
        </div>

        {/* Weekly Goal */}
        <Card className="p-6 mb-8 shadow-medium">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{t('dashboard.weeklyGoal')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.ofPoints', { progress: String(userStats.weeklyProgress), goal: String(userStats.weeklyGoal) })}
              </p>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              {Math.round((userStats.weeklyProgress / userStats.weeklyGoal) * 100)}%
            </Badge>
          </div>
          <Progress value={(userStats.weeklyProgress / userStats.weeklyGoal) * 100} className="h-3" />
        </Card>

        {/* Achievements */}
        <Card className="p-6 mb-8 shadow-medium">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{t('dashboard.achievements')}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.name}
                className={`text-center p-4 rounded-lg border-2 transition-all ${
                  achievement.unlocked
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-muted/20 opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  {achievement.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 shadow-medium">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.recentActivity')}</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <div className="font-medium text-foreground">{activity.action}</div>
                  <div className="text-sm text-muted-foreground">{activity.date}</div>
                </div>
                <Badge className="bg-reward text-reward-foreground">
                  +{activity.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Rewards Info */}
        <Card className="p-6 mt-8 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-bold text-foreground mb-2">
            🎁 {t('dashboard.rewards.redeemTitle')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {t('dashboard.rewards.redeemDesc')}
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-background rounded-lg">
              <div className="text-sm font-medium text-foreground">50 points</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.rewards.option50')}</div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="text-sm font-medium text-foreground">100 points</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.rewards.option100')}</div>
            </div>
            <div className="p-3 bg-background rounded-lg">
              <div className="text-sm font-medium text-foreground">200 points</div>
              <div className="text-xs text-muted-foreground">{t('dashboard.rewards.option200')}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
