import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { PreferencesSection } from "@/components/sections/PreferencesSection";

export const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <Card className="p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-blue-200/20 dark:border-blue-800/20 hover:shadow-2xl transition-all duration-300">
      <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 mb-6">
        {t("services.title")}
      </h1>
      <p className="text-center text-muted-foreground mb-8 text-lg">
        {t("services.description")}
      </p>
      <PreferencesSection />
    </Card>
  );
};