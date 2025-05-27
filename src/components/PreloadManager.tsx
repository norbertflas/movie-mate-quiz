
import { useEffect } from 'react';

export const PreloadManager = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      '/icons/icon-192x192.png',
      '/og-image.jpg'
    ];

    preloadResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.png') || resource.endsWith('.jpg') ? 'image' : 'fetch';
      document.head.appendChild(link);
    });

    // Prefetch likely next pages
    const prefetchPages = ['/search', '/quiz', '/trending'];
    
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }, []);

  return null;
};
