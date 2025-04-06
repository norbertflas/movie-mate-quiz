
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Home, Search, PlayCircle, Heart, Star } from "lucide-react";
import type { NavLinksProps } from "@/types/movie";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const NavLinks = ({ onNavigate }: NavLinksProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <nav className={cn(
      "flex items-center",
      isMobile ? "flex-col space-y-4" : "space-x-6"
    )}>
      <NavLink 
        to="/" 
        onClick={handleClick}
        className={({ isActive }) => cn(
          "flex items-center gap-2 font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          isMobile ? "text-base justify-start w-full px-2 py-2 rounded-md hover:bg-accent/50" : "text-sm md:text-base"
        )}
      >
        <Home className="h-4 w-4" />
        <span className="whitespace-nowrap">{t("navigation.home")}</span>
      </NavLink>
      <NavLink 
        to="/quiz" 
        onClick={handleClick}
        className={({ isActive }) => cn(
          "flex items-center gap-2 font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          isMobile ? "text-base justify-start w-full px-2 py-2 rounded-md hover:bg-accent/50" : "text-sm md:text-base"
        )}
      >
        <PlayCircle className="h-4 w-4" />
        <span className="whitespace-nowrap">{t("navigation.quiz")}</span>
      </NavLink>
      <NavLink 
        to="/search" 
        onClick={handleClick}
        className={({ isActive }) => cn(
          "flex items-center gap-2 font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          isMobile ? "text-base justify-start w-full px-2 py-2 rounded-md hover:bg-accent/50" : "text-sm md:text-base"
        )}
      >
        <Search className="h-4 w-4" />
        <span className="whitespace-nowrap">{t("navigation.search")}</span>
      </NavLink>
      <NavLink 
        to="/favorites" 
        onClick={handleClick}
        className={({ isActive }) => cn(
          "flex items-center gap-2 font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          isMobile ? "text-base justify-start w-full px-2 py-2 rounded-md hover:bg-accent/50" : "text-sm md:text-base"
        )}
      >
        <Heart className="h-4 w-4" />
        <span className="whitespace-nowrap">{t("navigation.favorites")}</span>
      </NavLink>
      <NavLink 
        to="/ratings" 
        onClick={handleClick}
        className={({ isActive }) => cn(
          "flex items-center gap-2 font-medium transition-colors hover:text-primary",
          isActive ? "text-primary" : "text-muted-foreground",
          isMobile ? "text-base justify-start w-full px-2 py-2 rounded-md hover:bg-accent/50" : "text-sm md:text-base"
        )}
      >
        <Star className="h-4 w-4" />
        <span className="whitespace-nowrap">{t("navigation.ratings")}</span>
      </NavLink>
    </nav>
  );
};
