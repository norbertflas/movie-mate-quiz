
import { useState } from "react";
import { Menu, X, User, Clapperboard } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Search", href: "/search" },
    { name: "Quiz", href: "/quiz" },
    { name: "Favorites", href: "/favorites" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <div className="bg-gradient-to-br from-purple-600 to-blue-500 p-2.5 rounded-xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <Clapperboard className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter font-display text-white">
              MovieFinder
            </span>
          </button>

          {/* Desktop Navigation - pill style */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center bg-white/5 backdrop-blur-2xl px-2 py-1.5 rounded-full border border-white/10 shadow-2xl">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                    location.pathname === item.href
                      ? "bg-white/10 text-white shadow-inner border border-white/5"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* User avatar + mobile menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 shadow-xl"
            >
              <User className="w-5 h-5 text-white/60" />
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white/70 hover:text-white"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#02020a]/95 backdrop-blur-2xl border-t border-white/5"
        >
          <div className="px-4 py-3 space-y-1">
            {[{ name: "Home", href: "/" }, ...navItems].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.href);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};
