import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, Heart, Star, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onNavigate) onNavigate();
  };

  return (
    <>
      <Button
        variant={isActive("/") ? "default" : "ghost"}
        onClick={() => handleNavigation("/")}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Home className="h-4 w-4" />
        <span>{t("navigation.home")}</span>
      </Button>
      <Button
        variant={isActive("/search") ? "default" : "ghost"}
        onClick={() => handleNavigation("/search")}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Search className="h-4 w-4" />
        <span>{t("navigation.search")}</span>
      </Button>
      <Button
        variant={isActive("/recommendations") ? "default" : "ghost"}
        onClick={() => handleNavigation("/recommendations")}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Sparkles className="h-4 w-4" />
        <span>{t("navigation.recommendations")}</span>
      </Button>
      <Button
        variant={isActive("/favorites") ? "default" : "ghost"}
        onClick={() => handleNavigation("/favorites")}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Heart className="h-4 w-4" />
        <span>{t("navigation.favorites")}</span>
      </Button>
      <Button
        variant={isActive("/ratings") ? "default" : "ghost"}
        onClick={() => handleNavigation("/ratings")}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Star className="h-4 w-4" />
        <span>{t("navigation.ratings")}</span>
      </Button>
    </>
  );
};