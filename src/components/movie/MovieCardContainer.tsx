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
        className="group relative overflow-hidden h-full flex flex-col glass-card
                   hover:shadow-xl dark:hover:shadow-primary/10 transition-all duration-300
                   bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5
                   dark:from-background/80 dark:via-background/50 dark:to-purple-500/10
                   cursor-pointer" 
        onClick={onClick}
      >
        {children}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Card>
    </motion.div>
  );
};