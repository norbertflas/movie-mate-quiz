
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Search, Sparkles, Command, Bell, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Analytics } from "@/lib/analytics";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "./navigation/NotificationCenter";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useLocalStorage('moviefinder_notifications', []);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const navRef = useRef<HTMLElement>(null);

  // Enhanced scroll handling with direction detection
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          try {
            if (typeof window !== 'undefined' && document.body.scrollHeight > window.innerHeight) {
              const currentScrollY = window.scrollY;
              const isScrolled = currentScrollY > 10;
              const isScrollingDown = currentScrollY > lastScrollY;
              const progress = currentScrollY / (document.body.scrollHeight - window.innerHeight);
              
              setScrolled(isScrolled);
              setLastScrollY(currentScrollY);
              setScrollProgress(Math.min(progress, 1));
              
              // Hide nav when scrolling down, show when scrolling up
              if (currentScrollY > 100) {
                setNavVisible(!isScrollingDown || currentScrollY < 50);
              } else {
                setNavVisible(true);
              }
            }
          } catch (error) {
            console.warn('Navigation scroll error:', error);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Search functionality
  const handleSearchClick = useCallback(() => {
    try {
      navigate("/search");
      
      Analytics.track('search_initiated', {
        source: 'navigation',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Navigation search error:', error);
    }
  }, [navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      try {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          navigate("/search");
        }
        
        // Escape to close dialogs
        if (e.key === 'Escape') {
          setShowNotifications(false);
          setShowSettings(false);
        }
      } catch (error) {
        console.warn('Keyboard shortcut error:', error);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
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

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <motion.nav 
        ref={navRef}
        variants={navVariants}
        animate={navVisible ? "visible" : "hidden"}
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
                      {Math.round(scrollProgress * 100)}%
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

            {/* Right side actions: search, notifications, settings, and user actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1 md:gap-2 md:w-1/4 justify-end"
            >
              {/* Search Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSearchClick}
                      className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary flex items-center gap-1 group"
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Search movies {!isMobile && "(⌘K)"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications Button */}
              {!isMobile && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(true)}
                        className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary"
                      >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Badge>
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notifications {unreadCount > 0 && `(${unreadCount})`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Quick Settings */}
              {!isMobile && (
                <DropdownMenu open={showSettings} onOpenChange={setShowSettings}>
                  <DropdownMenuTrigger asChild>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary"
                          >
                            <Settings className="h-4 w-4" />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quick Settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background/90 backdrop-blur-lg border border-primary/10">
                    <DropdownMenuLabel>Quick Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/services')}>
                      Streaming Services
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/preferences')}>
                      Preferences
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-blue-500 transition-all duration-150 ease-out"
              style={{
                width: `${scrollProgress * 100}%`
              }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${scrollProgress * 100}%`
              }}
            />
          )}
        </div>
      </motion.nav>

      {/* Notification Center */}
      <NotificationCenter 
        open={showNotifications}
        onOpenChange={setShowNotifications}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, read: true } : n
          ));
        }}
        onClearAll={() => {
          setNotifications([]);
        }}
      />
    </>
  );
};
