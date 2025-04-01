
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart, Github } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-auto border-t border-border/40"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Logo size="lg" />
            <p className="text-muted-foreground text-sm max-w-md">
              {t("footer.description")}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {t("navigation.home")}
                </a>
              </li>
              <li>
                <a
                  href="/search"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {t("navigation.search")}
                </a>
              </li>
              <li>
                <a
                  href="/favorites"
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {t("navigation.favorites")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t("footer.language")}</h3>
            <LanguageSwitcher />
            
            <div className="flex items-center space-x-4 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>
            © {currentYear} MovieFinder. {t("footer.allRightsReserved")}
          </p>
          <p className="flex items-center mt-4 md:mt-0">
            {t("footer.madeWith")} <Heart className="h-4 w-4 text-red-500 mx-1" />{" "}
            {t("footer.by")} MovieFinder Team
          </p>
        </div>
      </div>
    </motion.footer>
  );
};
