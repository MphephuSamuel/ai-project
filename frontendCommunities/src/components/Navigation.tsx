import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calculator as CalcIcon, BookOpen, Globe2, BarChart3, Trophy, MessageCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/useI18n";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, setLanguage } = useI18n();

  const links = [
    { to: "/", icon: Home, label: t('nav.home') },
    { to: "/calculator", icon: CalcIcon, label: t('nav.calculator') },
    { to: "/journal", icon: BookOpen, label: t('nav.journal') },
    { to: "/stories", icon: Globe2, label: t('nav.stories') },
    { to: "/dashboard", icon: BarChart3, label: t('nav.dashboard') },
    { to: "/leaderboard", icon: Trophy, label: t('nav.leaderboard') },
  ];

  const loggedIn = typeof window !== 'undefined' && !!localStorage.getItem('community_user_id');

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 md:top-0 md:bottom-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-around md:justify-between items-center py-3 gap-3">
          <div className="flex gap-2 md:gap-4">
          {(!loggedIn ? [{ to: "/auth", icon: MessageCircle, label: t('nav.login') }, ...links] : links).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm font-medium">{link.label}</span>
              </Link>
            );
          })}
          </div>
          {loggedIn && (
            <button
              className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => {
                localStorage.removeItem('community_user_id');
                navigate('/auth', { replace: true });
              }}
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">{t('nav.logout')}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
