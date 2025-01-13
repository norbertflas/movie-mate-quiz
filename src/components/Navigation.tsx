import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Search, Heart, Star, LogOut, Menu, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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

  const NavLinks = () => (
    <>
      <Button
        variant={isActive("/") ? "default" : "ghost"}
        onClick={() => {
          navigate("/");
          setIsOpen(false);
        }}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Home className="h-4 w-4" />
        <span>{t("navigation.home")}</span>
      </Button>
      <Button
        variant={isActive("/search") ? "default" : "ghost"}
        onClick={() => {
          navigate("/search");
          setIsOpen(false);
        }}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Search className="h-4 w-4" />
        <span>{t("navigation.search")}</span>
      </Button>
      <Button
        variant={isActive("/recommendations") ? "default" : "ghost"}
        onClick={() => {
          navigate("/recommendations");
          setIsOpen(false);
        }}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Sparkles className="h-4 w-4" />
        <span>{t("navigation.recommendations")}</span>
      </Button>
      <Button
        variant={isActive("/favorites") ? "default" : "ghost"}
        onClick={() => {
          navigate("/favorites");
          setIsOpen(false);
        }}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Heart className="h-4 w-4" />
        <span>{t("navigation.favorites")}</span>
      </Button>
      <Button
        variant={isActive("/ratings") ? "default" : "ghost"}
        onClick={() => {
          navigate("/ratings");
          setIsOpen(false);
        }}
        className="flex items-center gap-2 whitespace-nowrap"
      >
        <Star className="h-4 w-4" />
        <span>{t("navigation.ratings")}</span>
      </Button>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavLinks />
        </div>
        
        <div className="flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("navigation.logout")}</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};