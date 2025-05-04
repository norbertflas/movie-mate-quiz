
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const isHomePage = location.pathname === "/";

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-lg",
        isHomePage ? "bg-background/50" : "bg-background/80"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo animated />
          </div>
          
          <motion.div 
            className="hidden md:flex md:flex-1 justify-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NavLinks />
          </motion.div>
          
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
              className="p-2 rounded-full bg-muted/50 hover:bg-muted/80 transition-colors"
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
