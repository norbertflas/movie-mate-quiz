
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
];

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
}

export const LanguageSwitcher = ({ variant = "default" }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === i18n.language || isChanging) return;
    
    try {
      setIsChanging(true);
      
      // Change language in localStorage first
      localStorage.setItem("language", langCode);
      
      // Then change the language in i18n
      await i18n.changeLanguage(langCode);
      
      const selectedLang = languages.find(lang => lang.code === langCode);
      
      toast({
        title: "Language changed",
        description: `Language changed to ${selectedLang?.label}`,
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      });
      
      // Close dropdown
      setIsOpen(false);
      
    } catch (error) {
      console.error("Failed to change language:", error);
      toast({
        title: "Error",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  // Since we only have English now, just show a simple indicator
  if (variant === "minimal") {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2 px-2.5 py-1.5 h-auto" 
        disabled
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
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
          {currentLang.flag} {currentLang.code.toUpperCase()}
        </span>
      </Button>
    </motion.div>
  );
};
