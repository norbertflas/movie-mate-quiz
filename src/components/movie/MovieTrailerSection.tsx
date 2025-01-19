import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { getMovieTrailer } from "@/services/youtube";

interface MovieTrailerSectionProps {
  showTrailer: boolean;
  title: string;
  year: string;
  trailerUrl: string;
  setTrailerUrl: (url: string) => void;
}

export const MovieTrailerSection = ({
  showTrailer,
  title,
  year,
  trailerUrl,
  setTrailerUrl,
}: MovieTrailerSectionProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTrailer = async () => {
      if (showTrailer && !trailerUrl) {
        try {
          const url = await getMovieTrailer(title, year);
          setTrailerUrl(url);
          if (!url) {
            toast({
              title: t("errors.trailerNotFound"),
              description: t("errors.tryAgain"),
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Error fetching trailer:', error);
          toast({
            title: t("errors.trailerError"),
            description: t("errors.tryAgain"),
            variant: "destructive",
          });
        }
      }
    };

    fetchTrailer();
  }, [showTrailer, title, year, trailerUrl, setTrailerUrl, toast, t]);

  return null;
};