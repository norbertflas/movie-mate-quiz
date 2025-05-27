
import { useEffect, useState, useCallback } from 'react';

interface ScrollState {
  scrollY: number;
  scrollDirection: 'up' | 'down' | null;
  isScrolling: boolean;
}

export function useSafeScroll() {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollDirection: null,
    isScrolling: false
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    setScrollState(prevState => {
      const direction = currentScrollY > prevState.scrollY ? 'down' : 'up';
      
      return {
        scrollY: currentScrollY,
        scrollDirection: direction,
        isScrolling: true
      };
    });
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const throttledScroll = () => {
      handleScroll();
      
      // Clear existing timeout
      clearTimeout(timeoutId);
      
      // Set isScrolling to false after scroll ends
      timeoutId = setTimeout(() => {
        setScrollState(prev => ({
          ...prev,
          isScrolling: false
        }));
      }, 150);
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  return scrollState;
}
