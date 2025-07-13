
import { useState, useCallback } from 'react';
import { Analytics } from '@/lib/analytics';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface IndexState {
  showQuiz: boolean;
  isTransitioning: boolean;
  showOnboarding: boolean;
  showAdvancedFilters: boolean;
  showWatchlist: boolean;
  currentView: 'welcome' | 'quiz' | 'explore';
}

export const useIndexState = () => {
  const [state, setState] = useState<IndexState>({
    showQuiz: false,
    isTransitioning: false,
    showOnboarding: false,
    showAdvancedFilters: false,
    showWatchlist: false,
    currentView: 'welcome'
  });

  const [userPreferences, setUserPreferences] = useLocalStorage('moviefinder_preferences', {
    hasCompletedOnboarding: false,
    preferredGenres: [],
    viewingHistory: [],
    favoriteActors: [],
    streamingServices: [],
    lastVisit: null,
    theme: 'dark'
  });

  const [visitCount, setVisitCount] = useLocalStorage('moviefinder_visits', 0);

  const handleStartQuiz = useCallback(() => {
    Analytics.track('quiz_started', {
      source: 'welcome_section',
      user_type: userPreferences.hasCompletedOnboarding ? 'returning' : 'new',
      timestamp: new Date().toISOString()
    });

    setState(prev => ({ ...prev, isTransitioning: true }));
    
    requestAnimationFrame(() => {
      setState(prev => ({ 
        ...prev, 
        showQuiz: true, 
        currentView: 'quiz',
        isTransitioning: false 
      }));
    });
  }, [userPreferences.hasCompletedOnboarding]);

  const handleBackToWelcome = useCallback(() => {
    Analytics.track('quiz_exited', {
      timestamp: new Date().toISOString()
    });

    setState(prev => ({ 
      ...prev, 
      showQuiz: false, 
      currentView: 'welcome' 
    }));
  }, []);

  const handleQuizComplete = useCallback((results: any) => {
    Analytics.track('quiz_completed', {
      results: results,
      timestamp: new Date().toISOString()
    });

    setUserPreferences(prev => ({
      ...prev,
      hasCompletedOnboarding: true,
      preferredGenres: results.genres || [],
      streamingServices: results.services || []
    }));

    setState(prev => ({ 
      ...prev, 
      showQuiz: false, 
      currentView: 'explore' 
    }));
  }, [setUserPreferences]);

  const toggleAdvancedFilters = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showAdvancedFilters: !prev.showAdvancedFilters 
    }));
    
    Analytics.track('advanced_filters_toggled', {
      shown: !state.showAdvancedFilters,
      timestamp: new Date().toISOString()
    });
  }, [state.showAdvancedFilters]);

  const toggleWatchlist = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showWatchlist: !prev.showWatchlist 
    }));
    
    Analytics.track('watchlist_toggled', {
      shown: !state.showWatchlist,
      timestamp: new Date().toISOString()
    });
  }, [state.showWatchlist]);

  const handleOnboardingComplete = useCallback(() => {
    setUserPreferences(prev => ({
      ...prev,
      hasCompletedOnboarding: true
    }));
    
    setState(prev => ({ 
      ...prev, 
      showOnboarding: false 
    }));
    
    Analytics.track('onboarding_completed', {
      timestamp: new Date().toISOString()
    });
  }, [setUserPreferences]);

  return {
    state,
    setState,
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
  };
};
