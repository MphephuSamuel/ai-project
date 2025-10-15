import logo from "@/assets/carbonscope-logo.png";
import { Activity, User, LayoutDashboard, TrendingUp, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Header = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const NavButtons = () => (
    <>
      <Link to="/dashboard" onClick={() => setOpen(false)}>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "w-full sm:w-auto justify-start",
            location.pathname === "/dashboard" && "bg-accent/10 text-accent border-accent/20"
          )}
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </Link>
      <Link to="/predict" onClick={() => setOpen(false)}>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "w-full sm:w-auto justify-start",
            location.pathname === "/predict" && "bg-accent/10 text-accent border-accent/20"
          )}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Predict
        </Button>
      </Link>
      <Link to="/history" onClick={() => setOpen(false)}>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "w-full sm:w-auto justify-start",
            location.pathname === "/history" && "bg-accent/10 text-accent border-accent/20"
          )}
        >
          <Activity className="w-4 h-4 mr-2" />
          History
        </Button>
      </Link>
      <Link to="/profile" onClick={() => setOpen(false)}>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "w-full sm:w-auto justify-start",
            location.pathname === "/profile" && "bg-accent/10 text-accent border-accent/20"
          )}
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Button>
      </Link>
    </>
  );
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src={logo} alt="Green Innovators" className="h-8 sm:h-12 w-auto" />
            <div>
              <h1 className="text-sm sm:text-xl font-bold text-foreground">Green Innovators</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Industrial Carbon Monitoring</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-accent/10 rounded-lg">
              <Activity className="w-3 h-3 lg:w-4 lg:h-4 text-accent animate-pulse" />
              <span className="text-xs lg:text-sm font-medium text-accent">Live</span>
            </div>
            <NavButtons />
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-accent/10 rounded-lg">
              <Activity className="w-3 h-3 text-accent animate-pulse" />
              <span className="text-xs font-medium text-accent">Live</span>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-3 mt-8">
                  <NavButtons />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
