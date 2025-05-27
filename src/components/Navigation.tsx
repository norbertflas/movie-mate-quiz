
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Search, Sparkles, Command, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback, useRef } from "react";
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

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  
  const navRef = useRef<HTMLElement>(null);
  const scrollY = useMotionValue(0);
  const navOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  // Enhanced scroll handling with direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 10;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setScrolled(isScrolled);
      setLastScrollY(currentScrollY);
      scrollY.set(currentScrollY);
      
      // Hide nav when scrolling down, show when scrolling up
      if (currentScrollY > 100) {
        setNavVisible(!isScrollingDown || currentScrollY < 50);
      } else {
        setNavVisible(true);
      }
    };

    const throttledScroll = throttle(handleScroll, 16); // 60fps
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [lastScrollY, scrollY]);

  // Search functionality
  const handleSearchClick = useCallback(() => {
    navigate("/search");
    console.log('Search initiated from navigation');
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate("/search");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Navigation animation variants
  const navVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hidden: {
      y: -100,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.05, 
      rotate: 2,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.nav 
      ref={navRef}
      variants={navVariants}
      animate={navVisible ? "visible" : "hidden"}
      style={{ opacity: navOpacity }}
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-300",
        isHomePage ? "bg-background/10" : "bg-background/80",
        scrolled ? 
          "shadow-lg backdrop-blur-xl border-primary/10 bg-background/90" : 
          "backdrop-blur-md bg-background/60"
      )}
    >
      <div className="container relative mx-auto px-2 sm:px-4 md:px-6 max-w-full">
        {/* Enhanced animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -inset-[50%] bg-gradient-to-r from-primary/3 via-blue-500/3 to-purple-500/3 rounded-full blur-3xl opacity-60"
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              x: [-20, 20, -20],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "linear"
            }}
          />
        </div>
        
        <div className="relative flex h-16 items-center justify-between z-10">
          {/* Logo section with enhanced animation */}
          <div className="flex items-center md:w-1/4">
            <motion.div
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Logo animated />
            </motion.div>
            
            {/* Quick status indicators */}
            {!isMobile && (
              <motion.div 
                className="ml-4 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-400">
                  Online
                </Badge>
                {scrolled && (
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                    {Math.round(window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1) * 100)}%
                  </Badge>
                )}
              </motion.div>
            )}
          </div>
          
          {/* Main navigation links - desktop only */}
          <AnimatePresence>
            {!isMobile && (
              <motion.div 
                className="hidden md:flex justify-center w-1/2 overflow-x-auto scrollbar-hide"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <NavigationMenu className="max-w-full">
                  <NavigationMenuList className="flex-nowrap">
                    <NavigationMenuItem className="relative">
                      <NavLinks />
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile navigation toggle */}
          <div className="md:hidden">
            <MobileNav />
          </div>

          {/* Right side actions: search, notifications, and user actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-1 md:gap-2 md:w-1/4 justify-end"
          >
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
              <motion.span 
                className="absolute -right-1 -top-1" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.span>
            </motion.button>

            {/* Notifications Button */}
            {!isMobile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* User Actions */}
            <UserActions />
          </motion.div>
        </div>
        
        {/* Breadcrumbs for non-home pages */}
        {!isHomePage && (
          <motion.div 
            className="py-2 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Breadcrumbs path={location.pathname} />
          </motion.div>
        )}

        {/* Progress bar for scroll progress */}
        {scrolled && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-blue-500 origin-left"
            style={{
              scaleX: useTransform(scrollY, [0, Math.max(document.body.scrollHeight - window.innerHeight, 1)], [0, 1])
            }}
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: Math.max(document.body.scrollHeight - window.innerHeight, 1) > 0 
                ? window.scrollY / (document.body.scrollHeight - window.innerHeight) 
                : 0 
            }}
          />
        )}
      </div>
    </motion.nav>
  );
};

// Utility function for throttling
function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}
