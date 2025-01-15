import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Home, Search, PlayCircle, Heart, Star } from "lucide-react";
import type { NavLinksProps } from "@/types/movie";

export const NavLinks = ({ onNavigate }: NavLinksProps) => {
  const { t } = useTranslation();
  
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <nav className="flex items-center space-x-6">
      <NavLink 
        to="/" 
        onClick={handleClick}
        className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Home className="h-4 w-4" />
        <span>Home</span>
      </NavLink>
      <NavLink 
        to="/quiz" 
        onClick={handleClick}
        className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <PlayCircle className="h-4 w-4" />
        <span>Quiz</span>
      </NavLink>
      <NavLink 
        to="/search" 
        onClick={handleClick}
        className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
      </NavLink>
      <NavLink 
        to="/favorites" 
        onClick={handleClick}
        className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Heart className="h-4 w-4" />
        <span>Favorites</span>
      </NavLink>
      <NavLink 
        to="/ratings" 
        onClick={handleClick}
        className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Star className="h-4 w-4" />
        <span>Ratings</span>
      </NavLink>
    </nav>
  );
};