import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import AppShell from '../components/layout/AppShell'
import Providers from '../components/auth/Providers'

export const metadata: Metadata = {
  title: {
    default: 'InSightify – Hospitality Management Software & KPI Dashboard',
    template: '%s | InSightify Hospitality'
  },
  description: 'Transform your hospitality operations with InSightify. Real-time KPIs, performance analytics, and operational insights for hotels, restaurants, and hospitality businesses. Track occupancy rates, ADR, RevPAR, and 50+ metrics across all departments.',
  keywords: [
    'hospitality management software',
    'hotel KPIs dashboard',
    'hospitality analytics platform',
    'hotel performance metrics',
    'hospitality business intelligence',
    'hotel operations management',
    'hospitality reporting system',
    'hotel revenue optimization',
    'hospitality data analytics',
    'hotel operational efficiency',
    'occupancy rate tracking',
    'ADR management',
    'RevPAR optimization',
    'hospitality performance metrics',
    'hotel operational KPIs',
    'hospitality data insights',
    'hotel business analytics',
    'hospitality operational reporting',
    'hotel efficiency metrics',
    'hospitality performance dashboard'
  ],
  authors: [{ name: 'InSightify Team' }],
  creator: 'InSightify',
  publisher: 'InSightify',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://insightify-hospitality.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://insightify-hospitality.vercel.app',
    siteName: 'InSightify Hospitality',
    title: 'InSightify – Hospitality Management Software & KPI Dashboard',
    description: 'Transform your hospitality operations with real-time KPIs, performance analytics, and operational insights. Track occupancy rates, ADR, RevPAR, and 50+ metrics across all departments.',
    images: [
      {
        url: '/InSightify_Logo-removebg-preview.png',
        width: 1200,
        height: 630,
        alt: 'InSightify Hospitality - Operational KPIs and Analytics Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InSightify – Hospitality Management Software & KPI Dashboard',
    description: 'Transform your hospitality operations with real-time KPIs, performance analytics, and operational insights.',
    images: ['/InSightify_Logo-removebg-preview.png'],
    creator: '@insightify',
    site: '@insightify',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
    yandex: 'your-yandex-verification-code', // Add if targeting Russian market
    yahoo: 'your-yahoo-verification-code', // Add if targeting Yahoo
  },
  category: 'technology',
  classification: 'Hospitality Management Software',
  other: {
    'application-name': 'InSightify Hospitality',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'InSightify',
    'format-detection': 'telephone=no',
    'mobile-web-app-capable': 'yes',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileColor': '#1E293B',
    'msapplication-tap-highlight': 'no',
    'theme-color': '#1E293B',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data for Hospitality Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "InSightify Hospitality",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "description": "Hospitality management software providing real-time KPIs, performance analytics, and operational insights for hotels and hospitality businesses.",
              "url": "https://insightify-hospitality.vercel.app",
              "logo": "https://insightify-hospitality.vercel.app/InSightify_Logo-removebg-preview.png",
              "screenshot": "https://insightify-hospitality.vercel.app/InSightify_Logo-removebg-preview.png",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
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
              ],
              "audience": {
                "@type": "Audience",
                "audienceType": "Hospitality Professionals, Hotel Managers, Hospitality Consultants"
              }
            })
          }}
        />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
