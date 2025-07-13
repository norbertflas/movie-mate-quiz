
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { throttle } from '@/utils/throttle';

interface ScrollContextType {
  scrollY: number;
  scrollDirection: 'up' | 'down' | null;
  isScrolling: boolean;
  scrollProgress: number;
}

const ScrollContext = createContext<ScrollContextType>({
  scrollY: 0,
  scrollDirection: null,
  isScrolling: false,
  scrollProgress: 0
});

export const useScrollContext = () => useContext(ScrollContext);

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scrollState, setScrollState] = useState<ScrollContextType>({
    scrollY: 0,
    scrollDirection: null,
    isScrolling: false,
    scrollProgress: 0
  });

  const handleScroll = useCallback(
    throttle(() => {
      try {
        const currentScrollY = window.scrollY;
        const documentHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1);
        const scrollProgress = currentScrollY / documentHeight;
        
        setScrollState(prevState => {
          const direction = currentScrollY > prevState.scrollY ? 'down' : 'up';
          
          return {
            scrollY: currentScrollY,
            scrollDirection: direction,
            isScrolling: true,
            scrollProgress: Math.min(scrollProgress, 1)
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
      
      clearTimeout(timeoutId);
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

  return (
    <ScrollContext.Provider value={scrollState}>
      {children}
    </ScrollContext.Provider>
  );
};
