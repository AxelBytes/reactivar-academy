import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noindex?: boolean;
}

export function SEO({
  title = 'Reactivar Academy - Cursos de Fitness y Entrenamiento Online',
  description = 'Academia de fitness y entrenamiento profesional. Cursos online de alta calidad, productos especializados y programas personalizados. Aprende con los mejores entrenadores.',
  image = '/og-image.jpg',
  url,
  type = 'website',
  author = 'Diego Machado',
  publishedTime,
  modifiedTime,
  keywords = [
    'cursos de fitness',
    'entrenamiento online',
    'academia fitness',
    'programas de entrenamiento',
    'cursos deportivos',
    'fitness profesional',
    'entrenador personal',
    'capacitación fitness',
  ],
  noindex = false,
}: SEOProps) {
  const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://reactivar-academy.vercel.app');
  const fullImageUrl = image.startsWith('http') ? image : `https://reactivar-academy.vercel.app${image}`;
  const siteName = 'Reactivar Academy';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@reactivaracademy" />

      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}

      {/* Product specific */}
      {type === 'product' && (
        <>
          <meta property="product:price:currency" content="ARS" />
          <meta property="og:availability" content="instock" />
        </>
      )}

      {/* Additional SEO */}
      <link rel="canonical" href={siteUrl} />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: siteName,
          url: 'https://reactivar-academy.vercel.app',
          logo: 'https://reactivar-academy.vercel.app/logo.png',
          description: description,
          sameAs: [
            'https://www.facebook.com/reactivaracademy',
            'https://www.instagram.com/reactivaracademy',
            'https://twitter.com/reactivaracademy',
          ],
        })}
      </script>

      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description: description,
            image: fullImageUrl,
            brand: {
              '@type': 'Brand',
              name: siteName,
            },
            offers: {
              '@type': 'Offer',
              url: siteUrl,
              priceCurrency: 'ARS',
              availability: 'https://schema.org/InStock',
            },
          })}
        </script>
      )}
    </Helmet>
  );
}
