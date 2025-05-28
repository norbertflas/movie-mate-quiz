
import { motion } from "framer-motion";
import { Shuffle, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { discoverMovies } from "@/services/tmdb";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { UnifiedMovieCard, MovieModal, useMovieModal } from "@/components/movie/UnifiedMovieCard";

export const RandomMovieSection = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [randomMovie, setRandomMovie] = useState<any>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  const { refetch: fetchRandomMovie } = useQuery({
    queryKey: ['randomMovie'],
    queryFn: async () => {
      const randomPage = Math.floor(Math.random() * 10) + 1;
      const movies = await discoverMovies({
        page: randomPage,
        sortBy: 'popularity.desc',
        minVoteCount: 100
      });
      const randomIndex = Math.floor(Math.random() * movies.length);
      return movies[randomIndex];
    },
    enabled: false
  });

  const handleGenerateRandomMovie = async () => {
    setIsGenerating(true);
    try {
      const result = await fetchRandomMovie();
      if (result.data) {
        setRandomMovie(result.data);
        toast({
          title: "Losowy film wygenerowany!",
          description: `Znaleźliśmy dla Ciebie: ${result.data.title}`,
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować losowego filmu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMovieClick = (movie: any) => {
    const convertedMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      overview: movie.overview,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      runtime: undefined,
      genres: undefined,
      cast: undefined,
      director: undefined,
      trailer_url: undefined
    };
    openModal(convertedMovie);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="py-8"
      >
        <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
          <CardContent className="p-6 text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-4"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Shuffle className="h-6 w-6 text-orange-500 animate-bounce" />
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                    Losowy film na dziś
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Nie wiesz co obejrzeć? Pozwól nam wybrać coś dla Ciebie!
                </p>
              </div>

              {/* Random Movie Result - Now using UnifiedMovieCard */}
              {randomMovie && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="w-64">
                    <UnifiedMovieCard
                      movie={{
                        id: randomMovie.id,
                        title: randomMovie.title,
                        poster_path: randomMovie.poster_path,
                        backdrop_path: randomMovie.backdrop_path,
                        overview: randomMovie.overview,
                        release_date: randomMovie.release_date,
                        vote_average: randomMovie.vote_average,
                        runtime: undefined,
                        genres: undefined,
                        cast: undefined,
                        director: undefined,
                        trailer_url: undefined
                      }}
                      onExpand={handleMovieClick}
                      variant="medium"
                      showExpandButton={true}
                    />
                  </div>
                </motion.div>
              )}

              {/* CTA Button */}
              <Button 
                size="lg" 
                onClick={handleGenerateRandomMovie}
                disabled={isGenerating}
                className="group relative px-6 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600"
              >
                <span className="flex items-center gap-2">
                  <Shuffle className={`h-5 w-5 transition-transform ${isGenerating ? 'animate-spin' : 'group-hover:scale-110'}`} />
                  <span>{isGenerating ? 'Generuję...' : randomMovie ? 'Wygeneruj ponownie' : 'Wygeneruj losowy film'}</span>
                </span>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Movie Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};
