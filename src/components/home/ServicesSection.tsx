import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { PreferencesSection } from "@/components/sections/PreferencesSection";
import { motion } from "framer-motion";

export const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="p-8 shadow-xl bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5 dark:from-background/80 dark:via-background/50 dark:to-purple-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            {t("services.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("services.description")}
          </p>
        </div>
        <PreferencesSection />
      </Card>
    </motion.div>
  );
};