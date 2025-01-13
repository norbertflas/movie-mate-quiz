import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher";

export const UserActions = () => {
  const navigate = useNavigate();
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

  return (
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
  );
};