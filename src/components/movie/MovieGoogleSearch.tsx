import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface MovieGoogleSearchProps {
  title: string;
}

export const MovieGoogleSearch = ({ title }: MovieGoogleSearchProps) => {
  const { t } = useTranslation();

  const handleGoogleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = encodeURIComponent(`${title} movie information reviews cast`);
    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full flex items-center justify-center gap-2"
      onClick={handleGoogleSearch}
    >
      <Search className="h-4 w-4" />
      {t("movie.searchGoogle")}
    </Button>
  );
};