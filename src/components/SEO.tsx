import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://reactivar-academy.vercel.app';
const SITE_NAME = 'Reactivar Academy';
const SITE_NAME_FULL = 'Reactivar Academy - Newcom';

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
  title = 'Reactivar Academy - Capacitaciones de Newcom y Formación Deportiva',
  description = 'Plataforma #1 de capacitación para entrenadores y formadores del deporte Newcom en Argentina. Cursos online, ebooks y buscador de reglamento oficial por Diego Machado.',
  image = '/og-image.jpg',
  url,
  type = 'website',
  author = 'Diego Machado',
  publishedTime,
  modifiedTime,
  keywords = [
    'newcom',
    'newcom deporte',
    'capacitacion newcom',
    'entrenador newcom',
    'formador newcom',
    'deportistas newconeros',
    'reactivar academy',
    'diego machado newcom',
    'newcom argentina',
    'cursos newcom',
    'arbitro newcom',
    'planillero newcom',
    'reglamento newcom',
    'formacion deportiva newcom',
  ],
  noindex = false,
}: SEOProps) {
  const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_URL);
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME_FULL,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.svg`,
    },
    description: 'Plataforma #1 de capacitación para entrenadores y formadores del deporte Newcom en Argentina.',
    founder: {
      '@type': 'Person',
      name: 'Diego Machado',
    },
    sport: 'Newcom',
    areaServed: 'Argentina',
    sameAs: [
      'https://www.facebook.com/share/1887vTePKg/',
      'https://www.instagram.com/machado_reactivar_newcom',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'Profedeeducacionfisica22@gmail.com',
      contactType: 'customer support',
      availableLanguage: 'Spanish',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME_FULL,
    url: SITE_URL,
    description: 'Capacitaciones de Newcom, ebooks y buscador de reglamento oficial.',
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/cursos?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'es-AR',
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME_FULL} />
      <meta property="og:locale" content="es_AR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@reactivaracademy" />

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

      {/* Canonical */}
      <link rel="canonical" href={siteUrl} />

      {/* JSON-LD: Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* JSON-LD: WebSite */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>

      {/* JSON-LD: Product (solo en páginas de producto) */}
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
              name: SITE_NAME_FULL,
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
