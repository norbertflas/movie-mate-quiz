import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MovieCardWrapperProps {
  children: ReactNode;
  onClick?: () => void;
}

export const MovieCardWrapper = ({ children, onClick }: MovieCardWrapperProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full relative"
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};