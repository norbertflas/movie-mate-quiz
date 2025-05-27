
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Search, Sparkles, Command, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback } from "react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Badge } from "@/components/ui/badge";
import { useScrollContext } from "@/hooks/use-scroll-context";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  
  const { scrollY, scrollDirection, scrollProgress } = useScrollContext();

  // Simplified scroll handling without complex animations
  useEffect(() => {
    const isScrolled = scrollY > 10;
    setScrolled(isScrolled);
    
    // Simple show/hide logic
    if (scrollY > 100) {
      setNavVisible(scrollDirection !== 'down' || scrollY < 50);
    } else {
      setNavVisible(true);
    }
  }, [scrollY, scrollDirection]);

  const handleSearchClick = useCallback(() => {
    navigate("/search");
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate("/search");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <nav 
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-300",
        isHomePage ? "bg-background/10" : "bg-background/80",
        scrolled ? 
          "shadow-lg backdrop-blur-xl border-primary/10 bg-background/90" : 
          "backdrop-blur-md bg-background/60",
        !navVisible && "transform -translate-y-full"
      )}
    >
      <div className="container relative mx-auto px-2 sm:px-4 md:px-6 max-w-full">
        <div className="relative flex h-16 items-center justify-between z-10">
          {/* Logo section */}
          <div className="flex items-center md:w-1/4">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <Logo animated />
            </div>
            
            {!isMobile && (
              <div className="ml-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-400">
                  Online
                </Badge>
                {scrolled && (
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                    {Math.round(scrollProgress * 100)}%
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Main navigation links - desktop only */}
          {!isMobile && (
            <div className="hidden md:flex justify-center w-1/2 overflow-x-auto scrollbar-hide">
              <NavigationMenu className="max-w-full">
                <NavigationMenuList className="flex-nowrap">
                  <NavigationMenuItem className="relative">
                    <NavLinks />
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
          
          {/* Mobile navigation toggle */}
          <div className="md:hidden">
            <MobileNav />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 md:gap-2 md:w-1/4 justify-end">
            {/* Search Button */}
            <button
              onClick={handleSearchClick}
              className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary flex items-center gap-1 group"
              title={`Search movies ${!isMobile ? "(⌘K)" : ""}`}
            >
              <Search className="h-4 w-4" />
              {!isMobile && (
                <>
                  <span className="hidden sm:inline text-sm font-medium">Search</span>
                  <div className="hidden lg:flex items-center gap-1 ml-2 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                    <Command className="h-3 w-3" />
                    K
                  </div>
                </>
              )}
              <span className="absolute -right-1 -top-1">
                <Sparkles className="h-3 w-3 text-primary" />
              </span>
            </button>

            {/* Notifications Button */}
            {!isMobile && (
              <button className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary">
                <Bell className="h-4 w-4" />
              </button>
            )}
            
            <UserActions />
          </div>
        </div>
        
        {/* Breadcrumbs for non-home pages */}
        {!isHomePage && (
          <div className="py-2 overflow-x-auto scrollbar-hide">
            <Breadcrumbs path={location.pathname} />
          </div>
        )}

        {/* Simple progress bar */}
        {scrolled && (
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-blue-500 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        )}
      </div>
    </nav>
  );
};
