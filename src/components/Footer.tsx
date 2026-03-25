
import { Link as RouterLink } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Clapperboard } from "lucide-react";

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
    { name: "Privacy Policy", to: "/privacy" },
    { name: "Terms of Service", to: "/terms" },
    { name: "Cookie Policy", to: "/cookies" },
  ];

  return (
    <footer className="px-8 py-16 border-t border-white/5 mt-20 relative z-10 bg-black/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-2 rounded-lg">
                <Clapperboard className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tighter font-display text-white">
                MOVIE<span className="text-purple-500">FINDER</span>
              </span>
            </div>
            <p className="text-white/30 max-w-sm leading-relaxed">
              The ultimate AI-powered movie recommendation engine. Stop
              searching and start watching your next obsession today.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">
              Quick Links
            </h4>
            <ul className="space-y-4 text-white/30">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <RouterLink
                    to={link.to}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">
              Follow Us
            </h4>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                >
                  <Icon className="w-5 h-5 text-white/40" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <div className="text-xs text-white/20">
            © {currentYear} MovieFinder AI. All rights reserved.
          </div>
          <div className="flex items-center gap-8 text-xs text-white/20">
            {legalLinks.map((link) => (
              <RouterLink
                key={link.name}
                to={link.to}
                className="hover:text-white/40 transition-colors"
              >
                {link.name}
              </RouterLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
