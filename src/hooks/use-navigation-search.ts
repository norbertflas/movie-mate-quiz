
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Analytics } from '@/lib/analytics';
import { useIsMobile } from '@/hooks/use-mobile';

export const useNavigationSearch = () => {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearchClick = useCallback(() => {
    if (isMobile) {
      navigate("/search");
    } else {
      setShowSearchDialog(true);
    }
    
    Analytics.track('search_initiated', {
      source: 'navigation',
      timestamp: new Date().toISOString()
    });
  }, [isMobile, navigate]);

  const handleSearchSubmit = useCallback((query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSearchDialog(false);
    
    Analytics.track('search_performed', {
      query: query,
      source: 'navigation_dialog',
      timestamp: new Date().toISOString()
    });
  }, [navigate]);

  return {
    showSearchDialog,
    setShowSearchDialog,
    searchQuery,
    handleSearchClick,
    handleSearchSubmit
  };
};
