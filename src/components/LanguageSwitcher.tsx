
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
];

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
}

export const LanguageSwitcher = ({ variant = "default" }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const handleLanguageChange = async (langCode: string) => {
    try {
      await i18n.changeLanguage(langCode);
      localStorage.setItem("language", langCode);
      
      const message = langCode === 'pl' ? 
        'Pomyślnie zmieniono język na Polski' : 
        'Language successfully changed to English';
      
      toast({
        title: t("languageChanged"),
        description: message,
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      });
      
      // Force reload to ensure all components update their translations
      window.location.reload();
    } catch (error) {
      console.error("Failed to change language:", error);
      toast({
        title: t("error"),
        description: t("languageChangeError"),
        variant: "destructive",
      });
    }
  };

  // Render different button styles based on variant
  const renderButton = () => {
    if (variant === "minimal") {
      return (
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span>{i18n.language.toUpperCase()}</span>
        </Button>
      );
    }
    
    return (
      <Button variant="ghost" size="icon">
        <Languages className="h-4 w-4" />
        <span className="sr-only">{t("changeLanguage")}</span>
      </Button>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {renderButton()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={i18n.language === lang.code ? "bg-accent" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
