import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: t("errors.logout"),
          description: error.message,
        });
      } else {
        navigate("/auth");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("errors.logout"),
        description: t("errors.generic"),
      });
    }
  };

  return (
    <div className="flex flex-1 items-center justify-end space-x-2">
      <ThemeSwitcher />
      <LanguageSwitcher />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => navigate("/services")}>
            {t("navigation.streamingServices")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleLogout} className="text-red-500">
            <LogOut className="h-4 w-4 mr-2" />
            {t("auth.logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};