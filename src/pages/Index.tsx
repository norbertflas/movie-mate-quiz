import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { WelcomeSection } from "@/components/WelcomeSection";
import { QuizContent } from "@/components/home/QuizContent";
import { NewMainContent } from "@/components/home/NewMainContent";
import { LoadingState } from "@/components/LoadingState";
import { useMovieData } from "@/hooks/use-movie-data";
import { useIndexState } from "@/hooks/use-index-state";
import { useAuth } from "@/hooks/use-auth";
import { TrendingMoviesSection } from "@/components/sections/TrendingMoviesSection";
import { FindYourPerfectMovie } from "@/components/sections/FindYourPerfectMovie";
import { QuickActions } from "@/components/QuickActions";
import { Footer } from "@/components/Footer";
import { RandomMovieSection } from "@/components/sections/RandomMovieSection";

const Index = () => {
  const { session } = useAuth();
  const { 
    state, 
    setState,
    handleStartQuiz,
    handleBackToWelcome 
  } = useIndexState();
  
  const {
    trendingMovies,
    popularMovies,
    isLoading,
    hasError,
    retryAll
  } = useMovieData();

  const [userPreferences, setUserPreferences] = useState({
    hasCompletedOnboarding: false,
    preferredGenres: [],
    streamingServices: [],
    watchlist: []
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);

  useEffect(() => {
    // Load user preferences from localStorage or API
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, [session]);

  const handleStartQuizClick = () => {
    setState(prev => ({ 
      ...prev, 
      showQuiz: true, 
      currentView: 'quiz' 
    }));
  };

  const handleToggleFilters = () => {
    setShowAdvancedFilters(prev => !prev);
  };

  const handleToggleWatchlist = () => {
    setShowWatchlist(prev => !prev);
  };

  if (isLoading && (!trendingMovies || trendingMovies.length === 0)) {
    return <LoadingState message="Loading movies..." />;
  }

  return (
    <>
      <SEOHead 
        title="CineMatch - Your Perfect Movie Companion"
        description="Discover your next favorite movie with personalized recommendations, quiz-based matching, and comprehensive streaming availability."
      />
      
      <div className="min-h-screen bg-background">
        {state.currentView === 'welcome' && (
          <div className="space-y-8">
            {/* Panel funkcyjny - WelcomeSection */}
            <WelcomeSection 
              onStartQuiz={handleStartQuizClick}
            />
            
            {/* Random Movie Section */}
            <div className="container mx-auto px-4">
              <RandomMovieSection />
            </div>

            {/* Find Your Perfect Movie */}
            <div className="container mx-auto px-4">
              <FindYourPerfectMovie onStartQuiz={handleStartQuizClick} />
            </div>

            {/* Quick Actions */}
            <div className="container mx-auto px-4">
              <QuickActions 
                onToggleFilters={handleToggleFilters}
                onToggleWatchlist={handleToggleWatchlist}
                showAdvancedFilters={showAdvancedFilters}
                showWatchlist={showWatchlist}
                userPreferences={userPreferences}
              />
            </div>

            {/* Trending Movies Section */}
            <div className="container mx-auto px-4">
              <TrendingMoviesSection movies={trendingMovies || []} />
            </div>

            {/* Additional content */}
            <div className="container mx-auto px-4 py-8">
              <NewMainContent
                trendingMovies={trendingMovies || []}
                popularMovies={popularMovies || []}
                isLoading={isLoading}
                hasError={hasError}
                onRetry={retryAll}
                userPreferences={userPreferences}
                currentView={state.currentView}
              />
            </div>

            {/* Footer */}
            <Footer />
          </div>
        )}

        {state.currentView === 'quiz' && state.showQuiz && (
          <div className="space-y-8">
            {/* Quiz Content */}
            <QuizContent 
              onBack={handleBackToWelcome}
              onComplete={(results) => {
                console.log('Quiz completed with results:', results);
                setState(prev => ({ 
                  ...prev, 
                  currentView: 'welcome',
                  showQuiz: false 
                }));
              }}
              userPreferences={userPreferences}
            />
            
            {/* Footer */}
            <Footer />
          </div>
        )}

        {state.currentView === 'explore' && (
          <div className="space-y-8">
            <div className="container mx-auto px-4 py-8">
              <NewMainContent
                trendingMovies={trendingMovies || []}
                popularMovies={popularMovies || []}
                isLoading={isLoading}
                hasError={hasError}
                onRetry={retryAll}
                userPreferences={userPreferences}
                currentView={state.currentView}
              />
            </div>
            
            {/* Footer */}
            <Footer />
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
