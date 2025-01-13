import { useTranslation } from "react-i18next";
import { Info, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <motion.footer 
      className="mt-auto py-6 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{t("site.description")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{t("site.author")}</span>
          </div>
          <div className="text-xs">
            {t("site.copyright")}
          </div>
        </div>
      </div>
    </motion.footer>
  );
};