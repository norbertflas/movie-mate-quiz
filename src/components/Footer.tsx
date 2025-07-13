
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { Heart, Github, Mail, Copyright, Link, Globe, MessageSquare, ShieldCheck, Facebook, Twitter, Instagram } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Company",
      links: [
        { name: "About Us", to: "/about" },
        { name: "Contact", to: "/contact" },
        { name: "Careers", to: "/careers" },
        { name: "Press", to: "/press" },
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", to: "/help" },
        { name: "FAQ", to: "/faq" },
        { name: "Refunds", to: "/refunds" },
        { name: "Streaming Services", to: "/services" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Service", to: "/terms" },
        { name: "Privacy Policy", to: "/privacy" },
        { name: "Copyright", to: "/copyright" },
        { name: "Cookie Policy", to: "/cookies" },
      ]
    }
  ];

  const socialLinks = [
    { icon: <Github className="h-4 w-4" />, name: "GitHub", url: "https://github.com" },
    { icon: <Mail className="h-4 w-4" />, name: "Email", url: "mailto:contact@moviefinder.com" },
    { icon: <Facebook className="h-4 w-4" />, name: "Facebook", url: "https://facebook.com" },
    { icon: <Twitter className="h-4 w-4" />, name: "Twitter", url: "https://twitter.com" },
    { icon: <Instagram className="h-4 w-4" />, name: "Instagram", url: "https://instagram.com" },
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

  const handleContactClick = () => {
    // For now, just scroll to top or show a simple message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mt-auto border-t border-border/40 bg-background/50 backdrop-blur-lg"
    >
      <div className="relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-full blur-3xl opacity-30"
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-16">
          {/* Upper section with columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Logo & Description column */}
            <div className="md:col-span-1 space-y-4">
              <Logo size="lg" />
              <p className="text-muted-foreground text-sm max-w-md">
                MovieFinder helps you discover your next favorite movie across all streaming platforms. Find what to watch next with personalized recommendations.
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-muted/30 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all"
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
                          className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1.5 group"
                        >
                          <div className="relative">
                            <Link className="h-3 w-3" />
                            <motion.span
                              className="absolute -inset-1 bg-primary/10 rounded-full scale-0 opacity-0"
                              animate={{ scale: 0, opacity: 0 }}
                              whileHover={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                          <span className="group-hover:underline decoration-primary/40 underline-offset-2">{link.name}</span>
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
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Copyright className="h-3.5 w-3.5" /> {currentYear} MovieFinder
                </span>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">All Rights Reserved</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:flex items-center">
                <Heart className="h-3.5 w-3.5 text-red-500 mr-1" />{" "}
                Made with love by MovieFinder Team
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={handleContactClick}
              >
                <MessageSquare className="h-3 w-3 mr-1.5" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
