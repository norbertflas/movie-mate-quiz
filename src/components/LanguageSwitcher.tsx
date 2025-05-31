
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
}

export const LanguageSwitcher = ({ variant = "default" }: LanguageSwitcherProps) => {
  // Temporarily disabled - only showing English
  if (variant === "minimal") {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2 px-2.5 py-1.5 h-auto" 
        disabled
      >
        <span className="text-base">🇺🇸</span>
        <span className="text-sm font-medium">EN</span>
      </Button>
    );
  }
  
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button 
        variant="ghost" 
        size="sm"
        className="flex items-center gap-2 hover:bg-primary/10 transition-colors text-foreground hover:text-primary"
        disabled
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:inline text-sm">
          🇺🇸 EN
        </span>
      </Button>
    </motion.div>
  );
};
