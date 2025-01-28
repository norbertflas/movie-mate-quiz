import { useEffect, useState } from "react";
import { MovieCard } from "@/components/MovieCard";
import { getSavedMovies } from "@/services/user";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";

const Favorites = () => {
  const [movies, setMovies] = useState([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const loadSavedMovies = async () => {
      try {
        const savedMovies = await getSavedMovies();
        setMovies(savedMovies);
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("favorites.loadError"),
        });
      }
    };

    loadSavedMovies();
  }, [toast, t]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("navigation.favorites")}</h1>
      {movies.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">
            {t("favorites.noFavorites")}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t("favorites.noFavoritesDescription")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie: any) => (
            <MovieCard key={movie.tmdb_id} {...movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;