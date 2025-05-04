
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
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
        title: t("common.languageChanged"),
        description: t("common.languageChangedTo", { language: selectedLang?.label }),
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      });
      
      // Close dropdown
      setIsOpen(false);
      
      // Force window reload to ensure all components refresh translations
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Failed to change language:", error);
      toast({
        title: t("errors.languageChange"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
      setIsChanging(false);
    }
  };

  // Render different button styles based on variant
  const renderButton = () => {
    if (variant === "minimal") {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2 px-2.5 py-1.5 h-auto" 
          disabled={isChanging}
        >
          <span className="text-base">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
        </Button>
      );
    }
    
    return (
      <Button 
        variant="ghost" 
        size="sm"
        className="flex items-center gap-2 bg-muted/30 hover:bg-primary/20 transition-colors text-foreground hover:text-primary"
        disabled={isChanging}
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only sm:inline text-sm">
          {currentLang.flag} {currentLang.code.toUpperCase()}
        </span>
      </Button>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          {renderButton()}
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <div className="mb-2 px-2 py-1.5">
          <p className="text-xs text-muted-foreground">{t("common.selectLanguage")}</p>
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "flex items-center gap-3 rounded-md px-2.5 py-2 cursor-pointer",
              i18n.language === lang.code ? "bg-accent/50" : ""
            )}
            disabled={isChanging || i18n.language === lang.code}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="flex-1">{lang.label}</span>
            {i18n.language === lang.code && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Helper function for class names
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
