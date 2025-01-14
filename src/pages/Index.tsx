import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { SearchSection } from "@/components/sections/SearchSection";
import { PageContainer } from "@/components/home/PageContainer";
import { ServicesSection } from "@/components/home/ServicesSection";
import { QuizContent } from "@/components/home/QuizContent";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { RecentlyViewedSection } from "@/components/sections/RecentlyViewedSection";
import { InfiniteMovieList } from "@/components/movie/InfiniteMovieList";
import { getPersonalizedRecommendations } from "@/utils/recommendationEngine";
import { getMovieDetails } from "@/services/tmdb";

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: recommendations = [], isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: async () => {
      const scores = await getPersonalizedRecommendations();
      const movieDetailsPromises = scores.slice(0, 10).map(async (score) => {
        try {
          const movie = await getMovieDetails(score.movieId);
          return {
            ...movie,
            explanations: score.explanations
          };
        } catch (error) {
          console.error('Error fetching movie details:', error);
          return null;
        }
      });

      const movies = await Promise.all(movieDetailsPromises);
      return movies.filter(Boolean);
    },
    onError: (error) => {
      toast({
        title: t("errors.recommendationError"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    },
  });

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  return (
    <PageContainer>
      <ServicesSection />
      <SearchSection />
      <div className="space-y-8">
        <TrendingMoviesSection />
        <RecentlyViewedSection />
        {!showQuiz ? (
          <div className="space-y-8">
            {recommendations.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6">{t("recommendations.personalized")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((movie: any) => (
                    <MovieCard
                      key={movie.id}
                      title={movie.title}
                      year={movie.release_date ? new Date(movie.release_date).getFullYear().toString() : "N/A"}
                      platform="TMDB"
                      genre={movie.genres?.[0]?.name || t("movie.genre")}
                      imageUrl={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      description={movie.overview}
                      trailerUrl=""
                      rating={movie.vote_average * 10}
                      tmdbId={movie.id}
                      explanations={movie.explanations}
                    />
                  ))}
                </div>
              </section>
            )}
            <h2 className="text-2xl font-bold">{t("discover.popular")}</h2>
            <InfiniteMovieList />
          </div>
        ) : (
          <QuizContent />
        )}
      </div>
    </PageContainer>
  );
};

export default Index;