
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Home, Search, PlayCircle, Heart, Star, Tv } from "lucide-react";
import type { NavLinksProps } from "@/types/movie";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export const NavLinks = ({ onNavigate }: NavLinksProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const navItems = [
    { path: "/", icon: Home, label: t("navigation.home", "Home") },
    { path: "/quiz", icon: PlayCircle, label: t("quiz.start", "Quiz") },
    { path: "/search", icon: Search, label: t("search.movies", "Search") },
    { path: "/favorites", icon: Heart, label: t("common.favorites", "Favorites") },
    { path: "/ratings", icon: Star, label: t("common.ratings", "Ratings") },
    { path: "/services", icon: Tv, label: t("services.preferences", "Streaming") }
  ];

  return (
    <nav className={cn(
      "flex w-full",
      isMobile ? "flex-col space-y-2" : "items-center justify-center space-x-1"
    )}>
      {navItems.map((item, index) => (
        <NavLink 
          key={item.path}
          to={item.path} 
          onClick={handleClick}
          className={({ isActive }) => cn(
            "group flex items-center gap-2 font-medium transition-all duration-200",
            isActive 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground",
            isMobile 
              ? "text-base justify-start w-full px-3 py-2.5 rounded-md hover:bg-accent/30" 
              : "text-sm px-3 py-2 rounded-md hover:bg-accent/10"
          )}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <item.icon className={cn(
                  "h-4 w-4 transition-all",
                  isActive ? "text-primary" : "group-hover:text-primary/80"
                )} />
                {isActive && (
                  <motion.div
                    className="absolute -inset-1 bg-primary/20 rounded-full blur-sm -z-10"
                    layoutId="navIndicator"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </div>
              <span className={cn(
                "whitespace-nowrap transition-all",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              
              {/* Fixed dot positioning for desktop */}
              {isActive && !isMobile && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  layoutId="navDot"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
