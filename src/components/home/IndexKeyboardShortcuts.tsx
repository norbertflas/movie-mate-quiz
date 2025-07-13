
import { useEffect } from 'react';

interface IndexKeyboardShortcutsProps {
  onStartQuiz: () => void;
  onBackToWelcome: () => void;
  onToggleFilters: () => void;
  onToggleWatchlist: () => void;
  showQuiz: boolean;
  showAdvancedFilters: boolean;
  showWatchlist: boolean;
}

export const IndexKeyboardShortcuts = ({
  onStartQuiz,
  onBackToWelcome,
  onToggleFilters,
  onToggleWatchlist,
  showQuiz,
  showAdvancedFilters,
  showWatchlist
}: IndexKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            window.location.href = '/search';
            break;
          case 'q':
            e.preventDefault();
            if (!showQuiz) onStartQuiz();
            break;
          case 'f':
            e.preventDefault();
            onToggleFilters();
            break;
          case 'w':
            e.preventDefault();
            onToggleWatchlist();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        if (showQuiz) onBackToWelcome();
        if (showAdvancedFilters) onToggleFilters();
        if (showWatchlist) onToggleWatchlist();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStartQuiz, onBackToWelcome, onToggleFilters, onToggleWatchlist, showQuiz, showAdvancedFilters, showWatchlist]);

  return null;
};
