
export const Analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    console.log('Analytics Event:', event, properties);
    // Add your analytics implementation here (Google Analytics, Mixpanel, etc.)
  }
};
