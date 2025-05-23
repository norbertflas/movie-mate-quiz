
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { ReactNode } from "react";

interface MovieCardContainerProps {
  children: ReactNode;
  isExpanded: boolean;
  onClick: () => void;
}

export const MovieCardContainer = ({ children, isExpanded, onClick }: MovieCardContainerProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card 
        className="movie-card h-full flex flex-col overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl bg-background"
        onClick={onClick}
      >
        {children}
      </Card>
    </motion.div>
  );
};
