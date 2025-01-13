import { useTranslation } from "react-i18next";
import { Info, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <motion.footer 
      className="mt-auto py-8 border-t bg-gradient-to-b from-background/50 to-background backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center space-y-6">
          <motion.div 
            className="flex items-center gap-2 text-lg font-medium bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Info className="h-5 w-5" />
            <span>{t("site.description")}</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-2 text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Globe className="h-4 w-4" />
            <span>{t("site.author")}</span>
          </motion.div>
          
          <motion.div 
            className="text-sm text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span>{t("site.copyright")}</span>
            <Heart className="h-4 w-4 text-red-500 animate-pulse" />
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
};