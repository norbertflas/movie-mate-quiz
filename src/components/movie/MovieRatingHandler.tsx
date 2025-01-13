import { useToast } from "../ui/use-toast";
import { useTranslation } from "react-i18next";

interface MovieRatingHandlerProps {
  setUserRating: (rating: "like" | "dislike" | null) => void;
  title: string;
}

export const MovieRatingHandler = ({ setUserRating, title }: MovieRatingHandlerProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleRating = (rating: "like" | "dislike") => {
    setUserRating(rating);
    toast({
      title: t("ratings.saved"),
      description: t("ratings.savedDescription", { title }),
    });
  };

  return { handleRating };
};