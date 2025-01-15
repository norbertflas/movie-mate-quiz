import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Search, PlayCircle, Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export const NavLinks = () => {
  const { t } = useTranslation();

  const links = [
    {
      href: "/",
      label: t("navigation.home"),
      icon: Home
    },
    {
      href: "/quiz",
      label: t("navigation.quiz"),
      icon: PlayCircle
    },
    {
      href: "/search",
      label: t("navigation.search"),
      icon: Search
    },
    {
      href: "/favorites",
      label: t("navigation.favorites"),
      icon: Heart
    },
    {
      href: "/ratings",
      label: t("navigation.ratings"),
      icon: Star
    }
  ];

  return (
    <nav className="flex items-center space-x-4">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          to={href}
          className={cn(
            "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
            "text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
};