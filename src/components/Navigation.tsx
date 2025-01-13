import { NavLinks } from "./navigation/NavLinks";
import { UserActions } from "./navigation/UserActions";
import { MobileNav } from "./navigation/MobileNav";
import { motion } from "framer-motion";

export const Navigation = () => {
  return (
    <motion.nav 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavLinks />
        </div>
        
        <div className="flex md:hidden">
          <MobileNav />
        </div>

        <UserActions />
      </div>
    </motion.nav>
  );
};