import { useEffect, useState, useRef } from 'react';

/**
 * Hook para lazy loading de imágenes con Intersection Observer
 */
export function useLazyLoad<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

/**
 * Componente de imagen con lazy loading automático
 */
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  className,
  ...props
}: LazyImageProps) {
  const { ref, isVisible } = useLazyLoad<HTMLImageElement>();
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      ref={ref}
      src={isVisible ? src : placeholder}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className || ''}`}
      onLoad={() => setIsLoaded(true)}
      loading="lazy"
      {...props}
    />
  );
}

/**
 * Hook para prefetch de rutas
 */
export function usePrefetch(urls: string[]) {
  useEffect(() => {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}

/**
 * Hook para detectar conexión lenta
 */
export function useConnectionSpeed() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const checkConnection = () => {
        const effectiveType = connection.effectiveType;
        setIsSlowConnection(effectiveType === 'slow-2g' || effectiveType === '2g');
      };

      checkConnection();
      connection.addEventListener('change', checkConnection);

      return () => {
        connection.removeEventListener('change', checkConnection);
      };
    }
  }, []);

  return isSlowConnection;
}

/**
 * Hook para performance monitoring
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Monitor First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          console.log('FCP:', entry.startTime);
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);
}

/**
 * Service Worker para cache offline
 */
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
}

/**
 * Prefetch de recursos críticos
 */
export function prefetchCriticalResources() {
  // Prefetch fonts
  const fonts = [
    '/fonts/inter-var.woff2',
  ];

  fonts.forEach((font) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = font;
    document.head.appendChild(link);
  });

  // Preconnect to external domains
  const domains = [
    'https://lhjzxwthuqpqsvqpvsxw.supabase.co',
    'https://www.googletagmanager.com',
    'https://connect.facebook.net',
  ];

  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Debounce function
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para detectar si está en viewport
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return { ref, isInView };
}
