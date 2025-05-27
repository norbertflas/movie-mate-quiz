
import { useEffect } from 'react';
import { Analytics } from '@/lib/analytics';

export class PerformanceMonitor {
  private observer?: PerformanceObserver;
  private metrics: Record<string, number> = {};
  
  startTracking() {
    if (typeof window === 'undefined') return;
    
    // Core Web Vitals
    this.trackWebVitals();
    
    // Custom performance metrics
    this.trackCustomMetrics();
    
    // Resource timing
    this.trackResourceTiming();
  }
  
  private trackWebVitals() {
    // LCP (Largest Contentful Paint)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        Analytics.track('web_vital_lcp', {
          value: lastEntry.startTime,
          rating: this.getRating(lastEntry.startTime, [2500, 4000])
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }
    
    // FID (First Input Delay)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          Analytics.track('web_vital_fid', {
            value: entry.processingStart - entry.startTime,
            rating: this.getRating(entry.processingStart - entry.startTime, [100, 300])
          });
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }
    
    // CLS (Cumulative Layout Shift)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        Analytics.track('web_vital_cls', {
          value: clsValue,
          rating: this.getRating(clsValue, [0.1, 0.25])
        });
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }
  
  private trackCustomMetrics() {
    // Time to Interactive
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          Analytics.track('performance_metrics', {
            dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            load_complete: navigation.loadEventEnd - navigation.loadEventStart,
            total_load_time: navigation.loadEventEnd - navigation.fetchStart
          });
        } catch (e) {
          console.warn('Navigation timing not available');
        }
      }, 0);
    });
  }
  
  private trackResourceTiming() {
    // Track slow resources
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 1000) { // Resources taking more than 1 second
            Analytics.track('slow_resource', {
              name: entry.name,
              duration: entry.duration,
              size: (entry as any).transferSize || 0
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource timing observer not supported');
    }
  }
  
  private getRating(value: number, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds[0]) return 'good';
    if (value <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  }
  
  stopTracking() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// React component to initialize performance monitoring
export const PerformanceMonitorComponent = () => {
  useEffect(() => {
    const monitor = new PerformanceMonitor();
    monitor.startTracking();
    
    return () => {
      monitor.stopTracking();
    };
  }, []);

  return null;
};
