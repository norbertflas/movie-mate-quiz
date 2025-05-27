
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export class Analytics {
  private static isEnabled = true;
  
  static init() {
    // Initialize analytics services
    if (typeof window !== 'undefined') {
      // Google Analytics 4 - using Vite environment variables
      if (import.meta.env.VITE_GA_ID) {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
        script.async = true;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', import.meta.env.VITE_GA_ID, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    }
  }
  
  static track(eventName: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) return;
    
    try {
      // Console logging for development
      console.log('Analytics Event:', eventName, properties);
      
      // Google Analytics 4
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, {
          ...properties,
          timestamp: new Date().toISOString()
        });
      }
      
      // Additional analytics services can be added here
      
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
  
  static page(pageName: string, properties: Record<string, any> = {}) {
    this.track('page_view', {
      page_name: pageName,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof document !== 'undefined' ? document.title : '',
      ...properties
    });
  }
  
  static identify(userId: string, traits: Record<string, any> = {}) {
    if (!this.isEnabled) return;
    
    try {
      if (typeof window !== 'undefined' && window.gtag && import.meta.env.VITE_GA_ID) {
        window.gtag('config', import.meta.env.VITE_GA_ID, {
          user_id: userId,
          custom_map: traits
        });
      }
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }
  
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }
}
