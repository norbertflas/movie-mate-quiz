
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Heart, Github, Mail, Copyright, Link } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link as RouterLink } from "react-router-dom";
import { Separator } from "./ui/separator";

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: t("footer.companyInfo"),
      links: [
        { name: t("footer.about"), to: "/about" },
        { name: t("footer.contact"), to: "/contact" },
        { name: t("footer.careers"), to: "/careers" },
        { name: t("footer.press"), to: "/press" },
      ]
    },
    {
      title: t("footer.support"),
      links: [
        { name: t("footer.help"), to: "/help" },
        { name: t("footer.faq"), to: "/faq" },
        { name: t("footer.refunds"), to: "/refunds" },
        { name: t("navigation.streamingServices"), to: "/services" },
      ]
    },
    {
      title: t("footer.legal"),
      links: [
        { name: t("footer.terms"), to: "/terms" },
        { name: t("footer.privacy"), to: "/privacy" },
        { name: t("footer.copyright"), to: "/copyright" },
        { name: t("footer.cookies"), to: "/cookies" },
      ]
    }
  ];

  const socialLinks = [
    { icon: <Github className="h-5 w-5" />, name: "GitHub", url: "https://github.com" },
    { icon: <Mail className="h-5 w-5" />, name: "Email", url: "mailto:contact@moviefinder.com" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 py-12">
        {/* Upper section with columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Logo & Description column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-muted-foreground text-sm max-w-md">
              {t("footer.description")}
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-muted/50 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={link.name}
                >
                  {link.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer links columns */}
          <motion.div 
            className="col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {footerLinks.map((column) => (
              <motion.div key={column.title} className="space-y-4" variants={itemVariants}>
                <h3 className="text-lg font-semibold">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <RouterLink
                        to={link.to}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
                      >
                        <Link className="h-3 w-3" />
                        <span>{link.name}</span>
                      </RouterLink>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <Separator className="my-6 opacity-20" />

        {/* Language selector and copyright section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Copyright className="h-4 w-4" /> {currentYear} MovieFinder
            </span>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">{t("footer.allRightsReserved")}</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:flex items-center">
              <Heart className="h-4 w-4 text-red-500 mr-1" />{" "}
              {t("footer.madeWith")} {t("footer.by")} MovieFinder Team
            </span>
            <LanguageSwitcher variant="minimal" />
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
