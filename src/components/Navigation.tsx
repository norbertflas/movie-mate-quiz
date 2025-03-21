
import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";
import { Logo } from "./Logo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <motion.nav 
      className={cn(
        "sticky top-0 z-50 w-full border-b glass-panel backdrop-blur-lg",
        isHomePage ? "bg-gradient-to-r from-background/80 to-background/60" : "bg-background/80"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo animated />
          </div>
          
          <motion.div 
            className="hidden md:flex md:flex-1 justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NavLinks />
          </motion.div>
          
          <div className="flex md:hidden">
            <MobileNav />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <ThemeSwitcher />
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
