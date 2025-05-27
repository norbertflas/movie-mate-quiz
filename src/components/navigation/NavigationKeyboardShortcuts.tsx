
import { useEffect } from 'react';

interface NavigationKeyboardShortcutsProps {
  onOpenSearch: () => void;
  onCloseDialogs: () => void;
}

export const NavigationKeyboardShortcuts = ({
  onOpenSearch,
  onCloseDialogs
}: NavigationKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
      
      if (e.key === 'Escape') {
        onCloseDialogs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch, onCloseDialogs]);

  return null;
};
