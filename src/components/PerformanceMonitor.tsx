
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
    this.observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      Analytics.track('web_vital_lcp', {
        value: lastEntry.startTime,
        rating: this.getRating(lastEntry.startTime, [2500, 4000])
      });
    });
    
    try {
      this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support LCP
    }
    
    // FID (First Input Delay)
    this.observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        Analytics.track('web_vital_fid', {
          value: entry.processingStart - entry.startTime,
          rating: this.getRating(entry.processingStart - entry.startTime, [100, 300])
        });
      });
    });
    
    try {
      this.observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Browser doesn't support FID
    }
    
    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    this.observer = new PerformanceObserver((entryList) => {
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
    
    try {
      this.observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Browser doesn't support CLS
    }
  }
  
  private trackCustomMetrics() {
    // Time to Interactive
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        Analytics.track('performance_metrics', {
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load_complete: navigation.loadEventEnd - navigation.loadEventStart,
          total_load_time: navigation.loadEventEnd - navigation.navigationStart
        });
      }, 0);
    });
  }
  
  private trackResourceTiming() {
    // Track slow resources
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
    
    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      // Browser doesn't support resource timing
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
