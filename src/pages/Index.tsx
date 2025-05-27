
import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { WelcomeSection } from "@/components/WelcomeSection";
import { QuizContent } from "@/components/home/QuizContent";
import { NewMainContent } from "@/components/home/NewMainContent";
import { LoadingState } from "@/components/LoadingState";
import { useMovieData } from "@/hooks/use-movie-data";
import { useIndexState } from "@/hooks/use-index-state";
import { useAuth } from "@/hooks/use-auth";
import { ContentSection } from "@/components/sections/ContentSection";

const Index = () => {
  const { user } = useAuth();
  const { currentView, showQuiz, setCurrentView, setShowQuiz } = useIndexState();
  
  const {
    trendingMovies,
    popularMovies,
    isLoading,
    error,
    refetch
  } = useMovieData();

  const [userPreferences, setUserPreferences] = useState({
    hasCompletedOnboarding: false,
    preferredGenres: [],
    streamingServices: []
  });

  useEffect(() => {
    // Load user preferences from localStorage or API
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, [user]);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentView('quiz');
  };

  const handleExploreMovies = () => {
    setCurrentView('explore');
    setShowQuiz(false);
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
        {currentView === 'welcome' && (
          <div className="space-y-8">
            <WelcomeSection 
              onStartQuiz={handleStartQuiz}
              onExplore={handleExploreMovies}
            />
            <ContentSection />
          </div>
        )}

        {currentView === 'quiz' && showQuiz && (
          <QuizContent />
        )}

        {currentView === 'explore' && (
          <div className="container mx-auto px-4 py-8">
            <NewMainContent
              trendingMovies={trendingMovies || []}
              popularMovies={popularMovies || []}
              isLoading={isLoading}
              hasError={!!error}
              onRetry={refetch}
              userPreferences={userPreferences}
              currentView={currentView}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
