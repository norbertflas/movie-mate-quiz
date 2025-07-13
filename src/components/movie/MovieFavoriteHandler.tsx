import { useToast } from "../ui/use-toast";
import { useTranslation } from "react-i18next";

interface MovieFavoriteHandlerProps {
  isFavorite: boolean;
  setIsFavorite: (value: boolean) => void;
  title: string;
}

export const MovieFavoriteHandler = ({ isFavorite, setIsFavorite, title }: MovieFavoriteHandlerProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? t("favorites.added") : t("favorites.removed"),
      description: t(!isFavorite ? "favorites.addedDescription" : "favorites.removedDescription", { title }),
    });
  };

  return { handleToggleFavorite };
};