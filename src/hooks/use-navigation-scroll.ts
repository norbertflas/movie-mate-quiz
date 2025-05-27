
import { useState, useEffect, useRef } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

export const useNavigationScroll = () => {
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  
  const navRef = useRef<HTMLElement>(null);
  const scrollY = useMotionValue(0);
  const navOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 10;
      const isScrollingDown = currentScrollY > lastScrollY;
      
      setScrolled(isScrolled);
      setLastScrollY(currentScrollY);
      scrollY.set(currentScrollY);
      
      if (currentScrollY > 100) {
        setNavVisible(!isScrollingDown || currentScrollY < 50);
      } else {
        setNavVisible(true);
      }
    };

    const throttledScroll = throttle(handleScroll, 16);
    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [lastScrollY, scrollY]);

  return {
    scrolled,
    navVisible,
    navRef,
    navOpacity,
    scrollY
  };
};

function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}
