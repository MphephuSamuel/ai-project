import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe2, Heart, MessageCircle, Share2, Plus } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

interface Story {
  id: string;
  author: string;
  location: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  date: string;
}

const Stories = () => {
  const stories: Story[] = [
    {
      id: "1",
      author: "Thandi M.",
      location: "Soweto, Johannesburg",
      title: "Our School's Solar Panel Project",
      content: "Our school installed solar panels last month! Now we have reliable electricity for computers and the whole community can charge their phones for free. 45 students worked together on this project.",
      category: "Energy",
      likes: 124,
      comments: 18,
      date: "2 days ago",
    },
    {
      id: "2",
      author: "Sipho K.",
      location: "Umlazi, Durban",
      title: "Community Garden Success",
      content: "We converted an empty lot into a vegetable garden. Now 30 families have fresh vegetables and we've reduced our carbon footprint by growing food locally. Plus, the kids love helping!",
      category: "Food",
      likes: 98,
      comments: 12,
      date: "5 days ago",
    },
    {
      id: "3",
      author: "Nomsa R.",
      location: "Alexandra Township",
      title: "Taxi Association Goes Green",
      content: "Our local taxi association started a carpool initiative. We're saving money on fuel and reducing emissions. Each taxi now carries 2 more passengers than before!",
      category: "Transport",
      likes: 156,
      comments: 24,
      date: "1 week ago",
    },
  ];

  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-secondary/10 rounded-full mb-4">
            <Globe2 className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t('stories.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('stories.subtitle')}
          </p>
        </div>

        <Button className="w-full mb-6 bg-gradient-earth" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {t('stories.shareButton')}
        </Button>

        <div className="space-y-6">
          {stories.map((story) => (
            <Card key={story.id} className="p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-12 w-12 bg-primary/10">
                  <AvatarFallback className="text-primary font-semibold">
                    {story.author.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{story.author}</h3>
                    <Badge variant="outline" className="text-xs">
                      {story.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{story.location}</p>
                </div>
              </div>

              <h4 className="text-xl font-bold text-foreground mb-3">{story.title}</h4>
              <p className="text-muted-foreground mb-4 leading-relaxed">{story.content}</p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-5 w-5" />
                    <span>{story.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span>{story.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">{story.date}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-8 bg-gradient-sky text-accent-foreground">
          <h3 className="text-xl font-bold mb-2">{t('stories.shareCtaTitle')}</h3>
          <p className="mb-4 text-accent-foreground/90">
            {t("stories.shareCtaDesc")}
          </p>
          <Button variant="secondary" size="lg">
            {t('stories.getStarted')}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Stories;
