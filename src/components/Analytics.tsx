import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

interface AnalyticsProps {
  googleAnalyticsId?: string;
  metaPixelId?: string;
}

export function Analytics({ 
  googleAnalyticsId = 'G-XXXXXXXXXX', // Reemplazar con tu ID real
  metaPixelId = '1234567890' // Reemplazar con tu Pixel ID real
}: AnalyticsProps) {
  const location = useLocation();

  // Track pageviews
  useEffect(() => {
    // Google Analytics pageview
    if (window.gtag) {
      window.gtag('config', googleAnalyticsId, {
        page_path: location.pathname + location.search,
      });
    }

    // Meta Pixel pageview
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location, googleAnalyticsId]);

  return null;
}

// Google Analytics event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Meta Pixel event tracking
export const trackPixelEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// Specific tracking functions
export const trackPurchase = (value: number, currency: string, items: any[]) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: Date.now().toString(),
      value: value,
      currency: currency,
      items: items,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
      contents: items,
      content_type: 'product',
    });
  }
};

export const trackAddToCart = (item: any, value: number) => {
  // Google Analytics
  trackEvent('add_to_cart', 'ecommerce', item.name, value);

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: item.name,
      content_ids: [item.id],
      content_type: 'product',
      value: value,
      currency: 'ARS',
    });
  }
};

export const trackViewContent = (contentName: string, contentId: string) => {
  // Google Analytics
  trackEvent('view_item', 'engagement', contentName);

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
    });
  }
};

export const trackBeginCheckout = (value: number, items: any[]) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      value: value,
      currency: 'ARS',
      items: items,
    });
  }

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: value,
      currency: 'ARS',
      contents: items,
      num_items: items.length,
    });
  }
};

export const trackLead = (email: string) => {
  // Google Analytics
  trackEvent('generate_lead', 'engagement', email);

  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: 'Newsletter Signup',
    });
  }
};

// Initialize Google Analytics
export function initGoogleAnalytics(measurementId: string) {
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_path: window.location.pathname,
    });
  `;
  document.head.appendChild(script2);
}

// Initialize Meta Pixel
export function initMetaPixel(pixelId: string) {
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  noscript.innerHTML = `
    <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
  `;
  document.body.appendChild(noscript);
}
