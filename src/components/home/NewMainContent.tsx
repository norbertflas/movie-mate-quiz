
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, Star, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedMovieCard, MovieModal, useMovieModal } from "../movie/UnifiedMovieCard";
import type { TMDBMovie } from "@/services/tmdb";
import { Movie } from "@/types/movie";

interface NewMainContentProps {
  trendingMovies?: TMDBMovie[];
  popularMovies?: TMDBMovie[];
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  userPreferences?: any;
  currentView?: string;
}

// Convert TMDB movie to our unified Movie interface
const convertTMDBMovie = (tmdbMovie: TMDBMovie): Movie => ({
  id: tmdbMovie.id,
  title: tmdbMovie.title,
  poster_path: tmdbMovie.poster_path,
  backdrop_path: tmdbMovie.backdrop_path || '',
  overview: tmdbMovie.overview,
  release_date: tmdbMovie.release_date,
  vote_average: tmdbMovie.vote_average,
  runtime: undefined,
  genres: undefined,
  cast: undefined,
  director: undefined,
  trailer_url: undefined
});

// Loading skeleton for movie cards
const MovieCardSkeleton = () => (
  <Card className="w-full max-w-64 h-96 overflow-hidden">
    <div className="w-full h-full bg-muted animate-pulse" />
  </Card>
);

// Error state component
const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <Alert className="max-w-md mx-auto">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Failed to load movies. Please try again.
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRetry();
          }}
          className="ml-3"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

// Individual section component
const MovieSection = ({
  title,
  movies,
  icon,
  badge,
  description,
  isLoading = false,
  hasError = false,
  onRetry,
  limit = 10,
  sectionId
}: {
  title: string;
  movies: Movie[];
  icon: React.ReactNode;
  badge?: string;
  description?: string;
  isLoading?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  limit?: number;
  sectionId: string;
}) => {
  const { selectedMovie, isModalOpen, openModal, closeModal } = useMovieModal();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Section Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {title}
              {badge && (
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {badge}
                </Badge>
              )}
            </h2>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        {hasError ? (
          <ErrorState onRetry={onRetry} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {Array.from({ length: limit }).map((_, index) => (
              <MovieCardSkeleton key={`${sectionId}-skeleton-${index}`} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
          >
            {movies.slice(0, limit).map((movie, index) => (
              <motion.div key={`${sectionId}-movie-${movie.id}-${index}`} variants={itemVariants}>
                <UnifiedMovieCard
                  movie={movie}
                  onExpand={() => openModal(movie)}
                  variant="medium"
                  showExpandButton={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No movies available at the moment.</p>
          </Card>
        )}
      </motion.div>

      {/* Unified Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </motion.section>
  );
};

// Main Content Component
export const NewMainContent = ({
  trendingMovies = [],
  popularMovies = [],
  isLoading = false,
  hasError = false,
  onRetry,
  userPreferences = {},
  currentView = 'welcome'
}: NewMainContentProps) => {
  const [activeTab, setActiveTab] = useState("trending");

  // Convert TMDB movies to our Movie format
  const convertedTrendingMovies = useMemo(() => 
    trendingMovies.map(convertTMDBMovie), [trendingMovies]
  );
  
  const convertedPopularMovies = useMemo(() => 
    popularMovies.map(convertTMDBMovie), [popularMovies]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Welcome back message for returning users */}
      {userPreferences.hasCompletedOnboarding && (
        <motion.div variants={sectionVariants}>
          <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Welcome back!</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your preferences, here are some personalized recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Trending This Week Section - Always show as first section */}
      <motion.div variants={sectionVariants}>
        <MovieSection
          title="Trending This Week"
          movies={convertedTrendingMovies}
          icon={<TrendingUp className="h-6 w-6" />}
          badge="🔥 Hot"
          description="What everyone's watching right now"
          isLoading={isLoading}
          hasError={hasError}
          onRetry={onRetry}
          limit={12}
          sectionId="trending-main"
        />
      </motion.div>

      {/* Tabbed View for Popular and Other Content */}
      <motion.div variants={sectionVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-2 lg:w-fit">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">More Trending</span>
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Popular</span>
              </TabsTrigger>
            </TabsList>

            {/* Global retry button */}
            {hasError && onRetry && (
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry();
                }}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry All
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value="trending" className="mt-0">
              <MovieSection
                title="More Trending Movies"
                movies={convertedTrendingMovies.slice(12)} // Show next batch
                icon={<TrendingUp className="h-6 w-6" />}
                badge="Trending"
                description="More trending movies to discover"
                isLoading={isLoading}
                hasError={hasError}
                onRetry={onRetry}
                limit={12}
                sectionId="trending-more"
              />
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <MovieSection
                title="Popular Movies"
                movies={convertedPopularMovies}
                icon={<Users className="h-6 w-6" />}
                badge="Popular"
                description="Most popular movies this week"
                isLoading={isLoading}
                hasError={hasError}
                onRetry={onRetry}
                limit={12}
                sectionId="popular-main"
              />
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      {/* Additional Sections */}
      {!isLoading && !hasError && (
        <>
          {/* Top Rated Section */}
          <motion.div variants={sectionVariants}>
            <MovieSection
              title="Top Rated Movies"
              movies={[...convertedTrendingMovies, ...convertedPopularMovies]
                .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
                .slice(0, 10)}
              icon={<Star className="h-6 w-6" />}
              badge="⭐ 8.0+"
              description="Highest rated movies of all time"
              isLoading={false}
              hasError={false}
              limit={10}
              sectionId="top-rated"
            />
          </motion.div>

          {/* Recently Added Section */}
          <motion.div variants={sectionVariants}>
            <MovieSection
              title="Recently Added"
              movies={[...convertedPopularMovies].reverse().slice(0, 8)}
              icon={<Calendar className="h-6 w-6" />}
              badge="New"
              description="Latest additions to our collection"
              isLoading={false}
              hasError={false}
              limit={8}
              sectionId="recently-added"
            />
          </motion.div>
        </>
      )}

      {/* Empty state when no data and no loading */}
      {!isLoading && !hasError && trendingMovies.length === 0 && popularMovies.length === 0 && (
        <motion.div variants={sectionVariants}>
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No Movies Available</h3>
                <p className="text-muted-foreground">
                  We're working on bringing you the latest movies. Check back soon!
                </p>
              </div>
              {onRetry && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRetry();
                  }}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};
