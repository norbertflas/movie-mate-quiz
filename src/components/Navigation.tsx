
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

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
        isHomePage ? "bg-background/50" : "bg-background/80",
        scrolled ? "shadow-md backdrop-blur-md" : "backdrop-blur-lg"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and animated highlight */}
          <div className="flex items-center relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur-xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.7, 0.5]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <Logo animated />
          </div>
          
          <AnimatePresence>
            <motion.div 
              className="hidden md:flex md:flex-1 justify-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <NavLinks />
            </motion.div>
          </AnimatePresence>
          
          <div className={`flex ${isMobile ? "" : "md:hidden"}`}>
            <MobileNav />
          </div>

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
              className="p-2 rounded-full bg-muted/50 hover:bg-muted/80 transition-colors hover:text-primary"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </motion.button>
            {/* Only show language switcher in desktop mode, mobile version is in MobileNav */}
            {!isMobile && (
              <LanguageSwitcher />
            )}
            <UserActions />
          </motion.div>
        </div>
        
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
