// Analytics utility for tracking user behavior
// This is a placeholder implementation that can be replaced with actual Google Analytics or other analytics services

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface PageView {
  path: string;
  title?: string;
}

class Analytics {
  private isInitialized: boolean = false;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  // Initialize analytics
  public init(): void {
    if (this.isInitialized) return;
    
    if (this.isDevelopment) {
      console.log('Analytics initialized in development mode');
      this.isInitialized = true;
      return;
    }

    // In a real implementation, you would initialize Google Analytics or another service here
    // Example for Google Analytics:
    // if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    //   this.isInitialized = true;
    // }
    
    this.isInitialized = true;
    console.log('Analytics initialized');
  }

  // Track page views
  public trackPageView({ path, title }: PageView): void {
    if (!this.isInitialized) this.init();
    
    if (this.isDevelopment) {
      console.log(`Page view: ${path}${title ? ` (${title})` : ''}`);
      return;
    }

    // In a real implementation, you would track page views with Google Analytics or another service
    // Example for Google Analytics:
    // if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    //   window.gtag('config', 'YOUR_GA_MEASUREMENT_ID', {
    //     page_path: path,
    //     page_title: title
    //   });
    // }
    
    console.log(`Analytics: Page view - ${path}`);
  }

  // Track events
  public trackEvent({ category, action, label, value }: AnalyticsEvent): void {
    if (!this.isInitialized) this.init();
    
    if (this.isDevelopment) {
      console.log(`Event: ${category} - ${action}${label ? ` - ${label}` : ''}${value !== undefined ? ` - ${value}` : ''}`);
      return;
    }

    // In a real implementation, you would track events with Google Analytics or another service
    // Example for Google Analytics:
    // if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    //   window.gtag('event', action, {
    //     event_category: category,
    //     event_label: label,
    //     value: value
    //   });
    // }
    
    console.log(`Analytics: Event - ${category} - ${action}`);
  }

  // Track conversion
  public trackConversion(fromCurrency: string, toCurrency: string, amount: number): void {
    this.trackEvent({
      category: 'Conversion',
      action: 'Convert',
      label: `${fromCurrency} to ${toCurrency}`,
      value: amount
    });
  }

  // Track feature usage
  public trackFeatureUsage(feature: string): void {
    this.trackEvent({
      category: 'Feature',
      action: 'Use',
      label: feature
    });
  }

  // Track errors
  public trackError(error: Error, context?: string): void {
    this.trackEvent({
      category: 'Error',
      action: error.name,
      label: `${context ? `${context}: ` : ''}${error.message}`
    });
  }
}

// Export a singleton instance
export const analytics = new Analytics();

// Initialize analytics on import
analytics.init(); 