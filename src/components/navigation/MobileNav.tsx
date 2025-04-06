
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLinks } from "./NavLinks";
import { Logo } from "../Logo";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../LanguageSwitcher";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[300px] py-6">
        <SheetHeader className="mb-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-8">
          <NavLinks onNavigate={() => setIsOpen(false)} />
          <div className="px-2">
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-medium text-muted-foreground">{t("footer.language")}</p>
              <LanguageSwitcher variant="minimal" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
