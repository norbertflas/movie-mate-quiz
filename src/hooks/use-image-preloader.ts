
import { useEffect, useRef, useCallback } from 'react';

interface PreloadOptions {
  priority?: boolean;
  delay?: number;
}

export function useImagePreloader() {
  const preloadedImages = useRef<Set<string>>(new Set());
  const preloadQueue = useRef<Array<{ url: string; options: PreloadOptions }>([]);
  const isProcessing = useRef(false);

  const preloadImage = useCallback((url: string, options: PreloadOptions = {}) => {
    if (!url || preloadedImages.current.has(url)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        preloadedImages.current.add(url);
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`));
      };

      // Add loading attributes for optimization
      img.loading = options.priority ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.src = url;
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessing.current || preloadQueue.current.length === 0) return;

    isProcessing.current = true;

    // Process high priority images first
    const sortedQueue = [...preloadQueue.current].sort((a, b) => 
      (b.options.priority ? 1 : 0) - (a.options.priority ? 1 : 0)
    );

    for (const { url, options } of sortedQueue) {
      try {
        if (options.delay) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
        await preloadImage(url, options);
      } catch (error) {
        console.warn('Image preload failed:', error);
      }
    }

    preloadQueue.current = [];
    isProcessing.current = false;
  }, [preloadImage]);

  const queuePreload = useCallback((url: string, options: PreloadOptions = {}) => {
    if (!url || preloadedImages.current.has(url)) return;

    preloadQueue.current.push({ url, options });
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processQueue);
    } else {
      setTimeout(processQueue, 0);
    }
  }, [processQueue]);

  const preloadBatch = useCallback((urls: string[], options: PreloadOptions = {}) => {
    urls.forEach((url, index) => {
      queuePreload(url, {
        ...options,
        delay: options.delay ? options.delay + (index * 50) : undefined
      });
    });
  }, [queuePreload]);

  return {
    preloadImage,
    queuePreload,
    preloadBatch,
    isPreloaded: (url: string) => preloadedImages.current.has(url)
  };
}
