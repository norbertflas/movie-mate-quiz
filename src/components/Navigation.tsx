
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isHomePage ? "bg-background/20" : "bg-background/60",
        scrolled ? 
          "shadow-lg backdrop-blur-xl border-primary/10" : 
          "backdrop-blur-md"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container relative mx-auto px-4 sm:px-6">
        {/* Enhanced animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -inset-[50%] bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl opacity-50"
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </div>
        
        <div className="relative flex h-16 items-center justify-between z-10">
          {/* Logo section with enhanced animation */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Logo animated />
            </motion.div>
          </div>
          
          {/* Main navigation links - desktop only */}
          <AnimatePresence>
            {!isMobile && (
              <motion.div 
                className="hidden md:flex md:flex-1 justify-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem className="relative px-1">
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

          {/* Right side actions: search and user actions (includes language switcher) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearchClick}
              className="p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-colors hover:text-primary flex items-center gap-1.5"
            >
              <Search className="h-4 w-4 text-foreground" />
              <span className="hidden sm:inline text-sm font-medium">Search</span>
              <motion.span 
                className="absolute -right-1 -top-1" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.span>
            </motion.button>
            
            {/* User actions include the language switcher - removing duplicate */}
            <UserActions />
          </motion.div>
        </div>
        
        {/* Breadcrumbs for non-home pages with enhanced animation */}
        {!isHomePage && (
          <motion.div 
            className="py-2 overflow-x-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Breadcrumbs path={location.pathname} />
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
