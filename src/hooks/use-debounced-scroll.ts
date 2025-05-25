
import { useEffect, useRef, useCallback } from 'react';

interface UseDeboucedScrollOptions {
  delay?: number;
  threshold?: number;
}

export function useDebouncedScroll(
  callback: (scrollData: { scrollY: number; direction: 'up' | 'down' }) => void,
  options: UseDeboucedScrollOptions = {}
) {
  const { delay = 100, threshold = 10 } = options;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const debouncedCallback = useCallback((scrollY: number, direction: 'up' | 'down') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback({ scrollY, direction });
      ticking.current = false;
    }, delay);
  }, [callback, delay]);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const difference = Math.abs(currentScrollY - lastScrollY.current);

        if (difference > threshold) {
          const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
          debouncedCallback(currentScrollY, direction);
          lastScrollY.current = currentScrollY;
        }

        ticking.current = false;
      });

      ticking.current = true;
    }
  }, [debouncedCallback, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll]);

  return { lastScrollY: lastScrollY.current };
}
