
import { useEffect, useState, useCallback } from "react";
import { PageContainer } from "@/components/home/PageContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { Analytics } from "@/lib/analytics";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { NotificationPermission } from "@/components/NotificationPermission";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PreloadManager } from "@/components/PreloadManager";
import { motion, AnimatePresence } from "framer-motion";
import { useIndexState } from "@/hooks/use-index-state";
import { useMovieData } from "@/hooks/use-movie-data";
import { IndexKeyboardShortcuts } from "@/components/home/IndexKeyboardShortcuts";
import { IndexMainContent } from "@/components/home/IndexMainContent";

const Index = () => {
  console.log('Index page rendering');
  
  const isMobile = useIsMobile();
  
  const {
    state,
    userPreferences,
    setUserPreferences,
    visitCount,
    setVisitCount,
    handleStartQuiz,
    handleBackToWelcome,
    handleQuizComplete,
    toggleAdvancedFilters,
    toggleWatchlist,
    handleOnboardingComplete
  } = useIndexState();

  const {
    trendingMovies = [],
    popularMovies = [],
    isLoading,
    hasError,
    retryAll
  } = useMovieData();

  console.log('Index data:', {
    trendingMoviesCount: trendingMovies.length,
    popularMoviesCount: popularMovies.length,
    isLoading,
    hasError
  });

  // Track page view
  useEffect(() => {
    try {
      Analytics.track('page_view', {
        page: 'home',
        visit_count: visitCount + 1,
        user_type: userPreferences.hasCompletedOnboarding ? 'returning' : 'new',
        timestamp: new Date().toISOString()
      });
      
      setVisitCount(prev => prev + 1);
      setUserPreferences(prev => ({
        ...prev,
        lastVisit: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (!userPreferences.hasCompletedOnboarding && visitCount <= 1) {
      console.log('Should show onboarding');
    }
  }, [userPreferences.hasCompletedOnboarding, visitCount]);

  const handleQuizCompleteWithToast = useCallback((results: any) => {
    try {
      handleQuizComplete(results);
      toast.success('Quiz completed! Here are your personalized recommendations.', {
        duration: 5000
      });
    } catch (error) {
      console.error('Quiz completion error:', error);
      toast.error('Failed to complete quiz');
    }
  }, [handleQuizComplete]);

  try {
    return (
      <ErrorBoundary>
        <SEOHead 
          title="MovieFinder - Discover Your Perfect Movie Match"
          description="Find movies tailored to your taste with our smart AI-powered recommendation quiz. Discover trending films, personalized suggestions, and build your perfect watchlist."
          keywords="movies, recommendations, film finder, cinema, streaming, AI, personalized, quiz, watchlist"
          structuredData={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "MovieFinder",
            "description": "AI-powered movie recommendation platform",
            "url": "https://moviefinder.io",
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          }}
        />
        
        <PreloadManager />
        <OfflineIndicator />
        <PWAInstallPrompt />
        <NotificationPermission />
        
        <IndexKeyboardShortcuts
          onStartQuiz={handleStartQuiz}
          onBackToWelcome={handleBackToWelcome}
          onToggleFilters={toggleAdvancedFilters}
          onToggleWatchlist={toggleWatchlist}
          showQuiz={state.showQuiz}
          showAdvancedFilters={state.showAdvancedFilters}
          showWatchlist={state.showWatchlist}
        />
        
        <AnimatePresence>
          {state.showOnboarding && (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          )}
        </AnimatePresence>
        
        <PageContainer>
          <IndexMainContent
            state={state}
            userPreferences={userPreferences}
            trendingMovies={trendingMovies}
            popularMovies={popularMovies}
            isLoading={isLoading}
            hasError={hasError}
            onStartQuiz={handleStartQuiz}
            onBackToWelcome={handleBackToWelcome}
            onQuizComplete={handleQuizCompleteWithToast}
            onToggleFilters={toggleAdvancedFilters}
            onToggleWatchlist={toggleWatchlist}
            onRetry={retryAll}
            setUserPreferences={setUserPreferences}
            isMobile={isMobile}
          />
        </PageContainer>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Critical error in Index component:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-red-500">Critical Error</h2>
          <p className="text-muted-foreground">
            Something went wrong. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

export default Index;
