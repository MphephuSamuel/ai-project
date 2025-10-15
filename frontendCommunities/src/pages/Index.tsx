import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Leaf, Calculator, BookOpen, Users, Trophy, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import heroImage from "@/assets/hero-community.jpg";

const Index = () => {
  const { t } = useI18n();
  const features = [
    {
      icon: Calculator,
      title: t('index.feature.calculator.title'),
      description: t('index.feature.calculator.desc'),
      link: "/calculator",
      color: "primary",
    },
    {
      icon: BookOpen,
      title: t('index.feature.journal.title'),
      description: t('index.feature.journal.desc'),
      link: "/journal",
      color: "accent",
    },
    {
      icon: Users,
      title: t('index.feature.stories.title'),
      description: t('index.feature.stories.desc'),
      link: "/stories",
      color: "secondary",
    },
    {
      icon: Trophy,
      title: t('index.feature.rewards.title'),
      description: t('index.feature.rewards.desc'),
      link: "/dashboard",
      color: "reward",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-earth">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Community climate action" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-foreground/20 backdrop-blur-sm p-4 rounded-full">
                <Leaf className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {t('index.heroTitle')}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
              {t('index.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Button asChild size="lg" variant="secondary" className="shadow-medium">
                <Link to="/calculator">{t('index.startCalculating')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
                <Link to="/stories">{t('index.exploreStories')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('index.featuresTitle')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('index.featuresSubtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className={cn(
                  "p-6 hover:shadow-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
                  `delay-${index * 100}`
                )}
              >
                <Link to={feature.link} className="block group">
                  <div className={cn(
                    "inline-flex p-3 rounded-lg mb-4 transition-transform group-hover:scale-110",
                    feature.color === "primary" && "bg-primary/10 text-primary",
                    feature.color === "accent" && "bg-accent/10 text-accent",
                    feature.color === "secondary" && "bg-secondary/10 text-secondary",
                    feature.color === "reward" && "bg-reward/10 text-reward"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1,247</div>
              <div className="text-sm text-muted-foreground">{t('index.stats.communityMembers')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">15.4k</div>
              <div className="text-sm text-muted-foreground">{t('index.stats.ecoActionsLogged')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">892</div>
              <div className="text-sm text-muted-foreground">{t('index.stats.climateStories')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-reward mb-2">23.5T</div>
              <div className="text-sm text-muted-foreground">{t('index.stats.co2Reduced')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-sky p-8 md:p-12 text-center shadow-medium">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-accent-foreground" />
          <h2 className="text-3xl font-bold text-accent-foreground mb-4">
            {t('index.cta.title')}
          </h2>
          <p className="text-accent-foreground/90 mb-6 max-w-2xl mx-auto">
            {t('index.cta.subtitle')}
          </p>
          <Button asChild size="lg" variant="secondary" className="shadow-medium">
            <Link to="/dashboard">{t('index.cta.button')}</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
};

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

export default Index;
