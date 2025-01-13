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
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex md:flex-1">
          <NavLinks />
        </div>
        
        <div className="flex md:hidden">
          <MobileNav />
        </div>

        <UserActions />
      </div>
      
      <div className="container py-2">
        <Breadcrumbs path={location.pathname} />
      </div>
    </motion.nav>
  );
};