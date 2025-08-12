import Head from 'next/head'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = '/InSightify_Logo-removebg-preview.png',
  url = 'https://insightify-hospitality.vercel.app',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'InSightify Team',
  section,
  tags = [],
}: SEOProps) {
  const siteName = 'InSightify Hospitality'
  const fullTitle = `${title} | ${siteName}`
  
  // Default hospitality keywords
  const defaultKeywords = [
    'hospitality management software',
    'hotel KPIs dashboard',
    'hospitality analytics platform',
    'hotel performance metrics',
    'hospitality business intelligence',
    'hotel operations management',
    'hospitality reporting system',
    'hotel revenue optimization',
    'hospitality data analytics',
    'hotel operational efficiency'
  ]
  
  const allKeywords = [...new Set([...defaultKeywords, ...keywords])]

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${url}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} - ${siteName}`} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@insightify" />
      <meta name="twitter:creator" content="@insightify" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${url}${image}`} />
      <meta name="twitter:image:alt" content={`${title} - ${siteName}`} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1E293B" />
      <meta name="msapplication-TileColor" content="#1E293B" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.length > 0 && (
        tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))
      )}
      
      {/* Structured Data for Hospitality Business */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": description,
            "url": url,
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "InSightify Hospitality",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "description": "Hospitality management software providing real-time KPIs, performance analytics, and operational insights for hotels and hospitality businesses.",
              "url": "https://insightify-hospitality.vercel.app",
              "logo": "https://insightify-hospitality.vercel.app/InSightify_Logo-removebg-preview.png",
              "provider": {
                "@type": "Organization",
                "name": "InSightify",
                "url": "https://insightify-hospitality.vercel.app"
              },
              "featureList": [
                "Real-time KPI Dashboard",
                "Hospitality Performance Metrics",
                "Occupancy Rate Tracking",
                "ADR and RevPAR Analytics",
                "Department-wise Reporting",
                "Data Ingestion and Validation",
                "Role-based Access Control",
                "Export and Reporting Tools"
              ]
            }
          })
        }}
      />
    </Head>
  )
}
