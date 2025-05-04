
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLinks } from "./NavLinks";
import { Logo } from "../Logo";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "../ui/separator";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-primary/10 transition-all p-1"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] py-6 border-r border-primary/10">
        <SheetHeader className="mb-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-full"
          >
            <NavLinks onNavigate={() => setIsOpen(false)} />
          </motion.div>
          
          <div className="px-2 space-y-4">
            <Separator className="my-2 opacity-30" />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-muted/20 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{t("footer.language")}</p>
                <LanguageSwitcher variant="minimal" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="mt-4"
            >
              <Button 
                variant="gradient" 
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                {t("common.close")}
              </Button>
            </motion.div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
