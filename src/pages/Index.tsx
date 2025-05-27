
import { useEffect } from "react";
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
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { motion, AnimatePresence } from "framer-motion";
import { useIndexState } from "@/hooks/use-index-state";
import { useMovieData } from "@/hooks/use-movie-data";
import { IndexKeyboardShortcuts } from "@/components/home/IndexKeyboardShortcuts";
import { IndexMainContent } from "@/components/home/IndexMainContent";

const Index = () => {
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

  // Performance monitoring
  useEffect(() => {
    const monitor = new PerformanceMonitor();
    monitor.startTracking();
    
    return () => monitor.stopTracking();
  }, []);

  // Track page view
  useEffect(() => {
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
  }, []);

  // Show onboarding for new users
  useEffect(() => {
    if (!userPreferences.hasCompletedOnboarding && visitCount <= 1) {
      // setState for onboarding would be handled in the hook
    }
  }, [userPreferences.hasCompletedOnboarding, visitCount]);

  const handleQuizCompleteWithToast = (results: any) => {
    handleQuizComplete(results);
    toast.success('Quiz completed! Here are your personalized recommendations.', {
      duration: 5000
    });
  };

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
};

export default Index;
