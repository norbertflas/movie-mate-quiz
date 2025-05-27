
import { useEffect, useState, useCallback } from 'react';
import { throttle } from '@/utils/throttle';

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

  const handleScroll = useCallback(
    throttle(() => {
      try {
        const currentScrollY = window.scrollY;
        
        setScrollState(prevState => {
          const direction = currentScrollY > prevState.scrollY ? 'down' : 'up';
          
          return {
            scrollY: currentScrollY,
            scrollDirection: direction,
            isScrolling: true
          };
        });
      } catch (error) {
        console.warn('Scroll handler error:', error);
      }
    }, 16),
    []
  );

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

    try {
      window.addEventListener('scroll', throttledScroll, { passive: true });
    } catch (error) {
      console.warn('Error adding scroll listener:', error);
    }
    
    return () => {
      try {
        window.removeEventListener('scroll', throttledScroll);
        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('Error removing scroll listener:', error);
      }
    };
  }, [handleScroll]);

  return scrollState;
}
