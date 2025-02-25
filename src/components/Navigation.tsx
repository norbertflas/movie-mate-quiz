import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./navigation/Breadcrumbs";

export const Navigation = () => {
  const location = useLocation();

  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b glass-panel"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div 
            className="hidden md:flex md:flex-1"
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
            className="flex items-center"
          >
            <UserActions />
          </motion.div>
        </div>
        
        <motion.div 
          className="py-2 overflow-x-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Breadcrumbs path={location.pathname} />
        </motion.div>
      </div>
    </motion.nav>
  );
};