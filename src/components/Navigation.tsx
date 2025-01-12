import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Search, Heart, Star, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Strona główna</span>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-2">
            <Button
              variant={isActive("/search") ? "default" : "ghost"}
              onClick={() => navigate("/search")}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>Wyszukaj</span>
            </Button>
            <Button
              variant={isActive("/favorites") ? "default" : "ghost"}
              onClick={() => navigate("/favorites")}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              <span>Ulubione</span>
            </Button>
            <Button
              variant={isActive("/ratings") ? "default" : "ghost"}
              onClick={() => navigate("/ratings")}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              <span>Oceny</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Wyloguj</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};