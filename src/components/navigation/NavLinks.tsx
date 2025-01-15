import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import type { NavLinksProps } from "@/types/movie";

export const NavLinks = ({ onNavigate }: NavLinksProps) => {
  const { t } = useTranslation();
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <nav className="flex flex-col gap-4">
      <NavLink 
        to="/" 
        onClick={handleClick}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t("navigation.home")}
      </NavLink>
      <NavLink 
        to="/search" 
        onClick={handleClick}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t("navigation.search")}
      </NavLink>
      <NavLink 
        to="/quiz" 
        onClick={handleClick}
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t("navigation.quiz")}
      </NavLink>
    </nav>
  );
};