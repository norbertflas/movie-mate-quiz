import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Search, Heart, Star, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Błąd wylogowania",
        description: error.message,
      });
    } else {
      navigate("/auth");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center overflow-x-auto">
        <div className="mr-4 flex-shrink-0">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Home className="h-4 w-4" />
            <span>{t("navigation.home")}</span>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant={isActive("/search") ? "default" : "ghost"}
              onClick={() => navigate("/search")}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="h-4 w-4" />
              <span>{t("navigation.search")}</span>
            </Button>
            <Button
              variant={isActive("/favorites") ? "default" : "ghost"}
              onClick={() => navigate("/favorites")}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Heart className="h-4 w-4" />
              <span>{t("navigation.favorites")}</span>
            </Button>
            <Button
              variant={isActive("/ratings") ? "default" : "ghost"}
              onClick={() => navigate("/ratings")}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Star className="h-4 w-4" />
              <span>{t("navigation.ratings")}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("navigation.logout")}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};