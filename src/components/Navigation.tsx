
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { NavLinks } from "./navigation/NavLinks";
import { MobileNav } from "./navigation/MobileNav";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { SearchCommandDialog } from "./navigation/SearchCommandDialog";
import { NotificationCenter } from "./navigation/NotificationCenter";
import { QuickSettings } from "./navigation/QuickSettings";
import { NavigationLogo } from "./navigation/NavigationLogo";
import { NavigationActions } from "./navigation/NavigationActions";
import { NavigationKeyboardShortcuts } from "./navigation/NavigationKeyboardShortcuts";

export const Navigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === "/";
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [notifications, setNotifications] = useLocalStorage('moviefinder_notifications', []);

  // Simplified scroll handling without useRef
  useEffect(() => {
    let lastScrollY = 0;
    
    const handleScroll = () => {
      try {
        const currentScrollY = window.scrollY;
        const isScrolled = currentScrollY > 10;
        const isScrollingDown = currentScrollY > lastScrollY;
        
        setScrolled(isScrolled);
        
        if (currentScrollY > 100) {
          setNavVisible(!isScrollingDown || currentScrollY < 50);
        } else {
          setNavVisible(true);
        }
        
        lastScrollY = currentScrollY;
      } catch (error) {
        console.warn('Scroll handler error:', error);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchClick = useCallback(() => {
    setShowSearchDialog(true);
  }, []);

  const handleSearchSubmit = useCallback((query: string) => {
    setShowSearchDialog(false);
    // Handle search logic here
  }, []);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  const closeAllDialogs = () => {
    setShowSearchDialog(false);
    setShowNotifications(false);
    setShowSettings(false);
  };

  return (
    <>
      <NavigationKeyboardShortcuts
        onOpenSearch={() => setShowSearchDialog(true)}
        onCloseDialogs={closeAllDialogs}
      />

      <motion.nav 
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
          <div className="relative flex h-16 items-center justify-between z-10">
            <NavigationLogo scrolled={scrolled} />
            
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
              <MobileNav 
                notifications={notifications}
                unreadCount={unreadCount}
              />
            </div>

            <NavigationActions
              onSearchClick={handleSearchClick}
              onNotificationsClick={() => setShowNotifications(true)}
              onSettingsClick={() => setShowSettings(true)}
              unreadCount={unreadCount}
            />
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
        </div>
      </motion.nav>

      {/* Search Command Dialog */}
      <SearchCommandDialog 
        open={showSearchDialog}
        onOpenChange={setShowSearchDialog}
        onSubmit={handleSearchSubmit}
        placeholder="Search for movies, actors, directors..."
      />

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

      {/* Quick Settings Panel */}
      <QuickSettings 
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </>
  );
};
