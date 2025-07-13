
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  PlayCircle, 
  Heart, 
  Star, 
  Tv, 
  TrendingUp,
  Clock,
  Bookmark
} from "lucide-react";
import type { NavLinksProps } from "@/types/movie";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Analytics } from "@/lib/analytics";
import { useCallback, useMemo } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const NavLinks = ({ onNavigate }: NavLinksProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Get user data for dynamic badges
  const [userPreferences] = useLocalStorage('moviefinder_preferences', {
    favorites: [],
    watchlist: [],
    ratings: {},
    recentlyViewed: []
  });

  const [userStats] = useLocalStorage('moviefinder_stats', {
    quizzesCompleted: 0,
    moviesWatched: 0
  });
  
  const handleClick = useCallback((path: string, label: string) => {
    Analytics.track('navigation_click', {
      from: location.pathname,
      to: path,
      label: label,
      timestamp: new Date().toISOString()
    });
    
    if (onNavigate) {
      onNavigate();
    }
  }, [location.pathname, onNavigate]);

  // Enhanced navigation items with dynamic badges
  const navItems = useMemo(() => [
    { 
      path: "/", 
      icon: Home, 
      label: t("navigation.home", "Home"),
      badge: null,
      shortcut: "⌘H",
      description: "Return to homepage"
    },
    { 
      path: "/quiz", 
      icon: PlayCircle, 
      label: t("quiz.start", "Quiz"),
      badge: userStats.quizzesCompleted === 0 ? "New" : null,
      shortcut: "⌘Q",
      description: "Take movie preference quiz"
    },
    { 
      path: "/search", 
      icon: Search, 
      label: t("search.movies", "Search"),
      badge: null,
      shortcut: "⌘K",
      description: "Search for movies and shows"
    },
    { 
      path: "/favorites", 
      icon: Heart, 
      label: t("common.favorites", "Favorites"),
      badge: userPreferences.favorites?.length > 0 ? userPreferences.favorites.length.toString() : null,
      shortcut: "⌘F",
      description: "Your favorite movies"
    },
    { 
      path: "/ratings", 
      icon: Star, 
      label: t("common.ratings", "Ratings"),
      badge: Object.keys(userPreferences.ratings || {}).length > 0 ? Object.keys(userPreferences.ratings).length.toString() : null,
      shortcut: "⌘R",
      description: "Rate and review movies"
    },
    { 
      path: "/services", 
      icon: Tv, 
      label: t("services.preferences", "Streaming"),
      badge: null,
      shortcut: "⌘S",
      description: "Streaming service preferences"
    }
  ], [t, userPreferences, userStats]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15
      }
    },
    exit: { scale: 0, opacity: 0 }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.nav 
        className={cn(
          "flex w-full",
          isMobile ? "flex-col space-y-1" : "items-center justify-center space-x-1"
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div
              key={item.path}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink 
                    to={item.path}
                    onClick={() => handleClick(item.path, item.label)}
                    className={({ isActive: linkIsActive }) => cn(
                      "group relative flex items-center gap-2 font-medium transition-all duration-200 overflow-hidden",
                      linkIsActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground",
                      isMobile 
                        ? "text-base justify-start w-full px-3 py-3 rounded-lg hover:bg-accent/30" 
                        : "text-sm px-3 py-2.5 rounded-lg hover:bg-accent/20",
                      // Special styling for active state
                      linkIsActive && !isMobile && "bg-primary/10 shadow-sm"
                    )}
                  >
                    {({ isActive: linkIsActive }) => (
                      <>
                        {/* Background glow effect for active items */}
                        {linkIsActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg"
                            layoutId="navBackground"
                            transition={{ type: "spring", duration: 0.6 }}
                          />
                        )}

                        {/* Icon container with enhanced animations */}
                        <div className="relative z-10">
                          <motion.div
                            className={cn(
                              "transition-all duration-200",
                              linkIsActive ? "text-primary" : "group-hover:text-primary/80"
                            )}
                            whileHover={{ rotate: linkIsActive ? 0 : 12 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <item.icon className="h-4 w-4" />
                          </motion.div>

                          {/* Active glow effect */}
                          {linkIsActive && (
                            <motion.div
                              className="absolute -inset-1 bg-primary/30 rounded-full blur-sm -z-10"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </div>

                        {/* Label with enhanced typography */}
                        <span className={cn(
                          "whitespace-nowrap transition-all duration-200 relative z-10",
                          linkIsActive && "font-semibold",
                          !isMobile && "tracking-wide"
                        )}>
                          {item.label}
                        </span>

                        {/* Dynamic badges */}
                        <AnimatePresence>
                          {item.badge && (
                            <motion.div
                              variants={badgeVariants}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="relative z-10"
                            >
                              <Badge 
                                variant={item.badge === "New" ? "default" : "secondary"}
                                className={cn(
                                  "text-xs h-5 px-2",
                                  item.badge === "New" && "bg-green-500/20 text-green-400 border-green-500/30",
                                  !["New"].includes(item.badge) && "bg-primary/20 text-primary border-primary/30"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Active indicator for desktop */}
                        {linkIsActive && !isMobile && (
                          <motion.div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                            layoutId="navDot"
                            transition={{ type: "spring", duration: 0.5 }}
                          />
                        )}

                        {/* Hover effect overlay */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                          initial={false}
                        />
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                
                {/* Enhanced tooltips for desktop */}
                {!isMobile && (
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      {item.shortcut && (
                        <p className="text-xs text-muted-foreground opacity-70">
                          Shortcut: {item.shortcut}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </motion.div>
          );
        })}
      </motion.nav>
    </TooltipProvider>
  );
};
