
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

export const UserActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

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

  const handleNavigateToServices = () => {
    navigate("/services");
  };

  return (
    <div className="flex flex-1 items-center justify-end space-x-2">
      <ThemeSwitcher />
      
      {/* Only show language switcher on desktop - mobile version in MobileNav */}
      {!isMobile && (
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <LanguageSwitcher />
        </motion.div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-all">
              <Settings className="h-4 w-4" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-background/80 backdrop-blur-lg border border-primary/10">
          <DropdownMenuItem onSelect={handleNavigateToServices}>
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
