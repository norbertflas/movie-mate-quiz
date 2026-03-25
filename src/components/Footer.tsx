
import { Link as RouterLink } from "react-router-dom";
import { Facebook, Twitter, Instagram } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Search", to: "/search" },
    { name: "Quiz", to: "/quiz" },
    { name: "Favorites", to: "/favorites" },
    { name: "About", to: "/about" },
  ];

  const legalLinks = [
    { name: "Terms", to: "/terms" },
    { name: "Privacy", to: "/privacy" },
    { name: "Cookies", to: "/cookies" },
  ];

  return (
    <footer className="border-t border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Nav links */}
          <div className="flex flex-wrap items-center gap-6">
            {navLinks.map((link) => (
              <RouterLink
                key={link.name}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </RouterLink>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Instagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-border/20">
          <div className="flex flex-wrap items-center gap-4">
            {legalLinks.map((link) => (
              <RouterLink
                key={link.name}
                to={link.to}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </RouterLink>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            © Copyright {currentYear} MovieFinder
          </p>
        </div>
      </div>
    </footer>
  );
};
