
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
import { useState } from "react";

const languages = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
];

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
}

export const LanguageSwitcher = ({ variant = "default" }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === i18n.language || isChanging) return;
    
    try {
      setIsChanging(true);
      
      // Change language in localStorage first
      localStorage.setItem("language", langCode);
      
      // Then change the language in i18n
      await i18n.changeLanguage(langCode);
      
      // Determine message by language to ensure it's in the new language
      let title, message;
      
      switch (langCode) {
        case 'pl':
          title = 'Język zmieniony';
          message = 'Pomyślnie zmieniono język na Polski';
          break;
        case 'fr':
          title = 'Langue modifiée';
          message = 'La langue a été changée avec succès en Français';
          break;
        case 'de':
          title = 'Sprache geändert';
          message = 'Die Sprache wurde erfolgreich auf Deutsch geändert';
          break;
        case 'es':
          title = 'Idioma cambiado';
          message = 'El idioma se ha cambiado correctamente a Español';
          break;
        case 'it':
          title = 'Lingua cambiata';
          message = 'La lingua è stata cambiata con successo in Italiano';
          break;
        default:
          title = 'Language changed';
          message = 'Language successfully changed to English';
      }
      
      toast({
        title: title,
        description: message,
        className: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
      });
      
      // Force window reload to ensure all components refresh translations
      window.location.reload();
    } catch (error) {
      console.error("Failed to change language:", error);
      toast({
        title: t("errors.loadingServices"),
        description: t("errors.tryAgain", "Failed to change language"),
        variant: "destructive",
      });
      setIsChanging(false);
    }
  };

  // Render different button styles based on variant
  const renderButton = () => {
    if (variant === "minimal") {
      return (
        <Button variant="ghost" size="sm" className="flex items-center gap-2" disabled={isChanging}>
          <Languages className="h-4 w-4" />
          <span>{i18n.language.toUpperCase()}</span>
        </Button>
      );
    }
    
    return (
      <Button variant="ghost" size="icon" disabled={isChanging}>
        <Languages className="h-4 w-4" />
        <span className="sr-only">{t("common.changeLanguage")}</span>
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
            disabled={isChanging || i18n.language === lang.code}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
