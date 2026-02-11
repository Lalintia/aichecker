import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI Search Checker',
  description:
    'Check if your website is ready for AI search engines. Analyze 10 key factors including Schema.org, robots.txt, llms.txt, sitemap, Open Graph, and more.',
  keywords: ['AI Search', 'SEO', 'Schema.org', 'Open Graph', 'Website Analysis', 'AI Readiness'],
  authors: [{ name: 'AI Search Checker Team' }],
  creator: 'AI Search Checker',
  publisher: 'AI Search Checker',
  robots: 'index, follow',
  metadataBase: new URL('https://aicheck.ohmai.me'),
  openGraph: {
    type: 'website',
    title: 'AI Search Checker',
    description:
      'Check if your website is ready for AI search engines. Analyze 10 key factors for better AI discoverability.',
    siteName: 'AI Search Checker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Search Checker',
    description:
      'Check if your website is ready for AI search engines. Analyze 10 key factors for better AI discoverability.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8f9fa',
};

// Schema.org JSON-LD structured data
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Search Checker',
  url: 'https://aicheck.ohmai.me',
  description:
    'Check if your website is ready for AI search engines. Analyze 10 key factors for better AI discoverability.',
  publisher: {
    '@type': 'Organization',
    name: 'AI Search Checker',
    url: 'https://aicheck.ohmai.me',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      'urlTemplate': 'https://aicheck.ohmai.me/?url={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Search Checker',
  url: 'https://aicheck.ohmai.me',
  description: 'AI Search Checker helps websites optimize for AI search engines.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Support',
    email: 'support@aicheck.ohmai.me',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AI Search Checker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI Search Checker is a free tool that analyzes your website\'s readiness for AI search engines. It checks 10 key factors including Schema.org markup, robots.txt, llms.txt, sitemap, Open Graph tags, semantic HTML, heading hierarchy, FAQ blocks, page speed, and author authority.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is Schema.org important for AI search?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Schema.org structured data helps AI search engines understand your website\'s content better. It provides context about your organization, articles, products, and FAQs.',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#f8f9fa] font-sans">{children}</body>
    </html>
  );
}
