import { Metadata } from "next";
import Link from "next/link";
import { 
  BookOpen, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Info,
  ArrowLeft
} from "lucide-react";

export const metadata: Metadata = {
  title: "Validation Criteria | AI Search Checker",
  description: "Reference documentation for AI Search Checker validation standards - based on Google Search Central, W3C, Schema.org",
};

// Validation criteria data
const criteriaData = [
  {
    id: "schema",
    title: "Schema.org Structured Data",
    weight: "25%",
    importance: "Critical",
    color: "red",
    description: "Check Structured Data according to Schema.org standards",
    why: "Helps Search Engines and AI understand website content better, leading to Rich Snippets in search results, AI Overviews that display information from the website, and Knowledge Graph connections",
    checks: [
      { item: "Organization (@type, name, url, logo, sameAs)", weight: "30%" },
      { item: "WebSite (@type, name, url, potentialAction)", weight: "20%" },
      { item: "Article (@type, headline, author, datePublished, publisher, image)", weight: "15%" },
      { item: "BreadcrumbList (@type, itemListElement, position, name, item)", weight: "15%" },
      { item: "WebPage (@type, name, description, url)", weight: "10%" },
      { item: "LocalBusiness (@type, name, address, telephone, geo)", weight: "10%" },
    ],
    standards: [
      { name: "Schema.org Official", url: "https://schema.org/", source: "Schema.org" },
      { name: "Structured Data Guidelines", url: "https://developers.google.com/search/docs/appearance/structured-data", source: "Google" },
      { name: "Article Schema", url: "https://developers.google.com/search/docs/appearance/structured-data/article", source: "Google" },
      { name: "Organization Schema", url: "https://developers.google.com/search/docs/appearance/structured-data/organization", source: "Google" },
      { name: "Local Business", url: "https://developers.google.com/search/docs/appearance/structured-data/local-business", source: "Google" },
    ],
  },
  {
    id: "robots",
    title: "robots.txt",
    weight: "20%",
    importance: "Critical",
    color: "red",
    description: "Check robots.txt file",
    why: "robots.txt tells Search Engine Crawlers which parts of the website should or should not be accessed. Helps prevent indexing unwanted content, saves crawl budget, and prevents duplicate content",
    checks: [
      { item: "File exists at /robots.txt", required: true },
      { item: "Has User-agent directive", required: true },
      { item: "Has Sitemap directive", required: false },
      { item: "No syntax error", required: true },
      { item: "Does not block important pages", required: true },
    ],
    standards: [
      { name: "robots.txt Specification", url: "https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt", source: "Google" },
      { name: "RFC 9309 - Robots Exclusion Protocol", url: "https://www.rfc-editor.org/rfc/rfc9309.html", source: "IETF" },
    ],
  },
  {
    id: "sitemap",
    title: "XML Sitemap",
    weight: "15%",
    importance: "High",
    color: "orange",
    description: "Check XML Sitemap",
    why: "XML Sitemap helps Search Engines discover and crawl important pages of the website faster. Notifies all URLs that need to be indexed, indicates importance and update frequency, and helps after redesign or domain migration",
    checks: [
      { item: "File exists at /sitemap.xml", required: true },
      { item: "Valid XML format", required: true },
      { item: "Has <urlset> or <sitemapindex>", required: true },
      { item: "URLs not exceeding 50,000 URLs", required: false },
      { item: "File size not exceeding 50MB", required: false },
    ],
    standards: [
      { name: "Sitemaps Overview", url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview", source: "Google" },
      { name: "Sitemap Protocol", url: "https://www.sitemaps.org/protocol.html", source: "Sitemaps.org" },
    ],
  },
  {
    id: "pageSpeed",
    title: "Page Speed & Core Web Vitals",
    weight: "10%",
    importance: "High",
    color: "orange",
    description: "Check page speed and Core Web Vitals",
    why: "Core Web Vitals are Google ranking factors that measure user experience: LCP (loading speed), INP (responsiveness), CLS (layout stability)",
    checks: [
      { item: "LCP (Largest Contentful Paint) ≤ 2.5s", threshold: "Good", bad: "> 4.0s" },
      { item: "INP (Interaction to Next Paint) ≤ 200ms", threshold: "Good", bad: "> 500ms" },
      { item: "CLS (Cumulative Layout Shift) ≤ 0.1", threshold: "Good", bad: "> 0.25" },
    ],
    standards: [
      { name: "Core Web Vitals", url: "https://web.dev/articles/vitals", source: "web.dev" },
      { name: "PageSpeed Insights", url: "https://pagespeed.web.dev/", source: "Google" },
      { name: "Web Vitals Thresholds", url: "https://web.dev/articles/defining-core-web-vitals-thresholds", source: "web.dev" },
    ],
  },
  {
    id: "semanticHTML",
    title: "Semantic HTML",
    weight: "10%",
    importance: "Medium",
    color: "yellow",
    description: "Check Semantic HTML Elements",
    why: "Semantic HTML helps Screen readers understand structure (Accessibility), Search Engines understand content context, and AI distinguish different parts of the webpage",
    checks: [
      { item: "Has <main> element", required: true },
      { item: "Has <header> element", required: false },
      { item: "Has <nav> element", required: false },
      { item: "Has <article> or <section>", required: false },
      { item: "Has <aside> element", required: false },
      { item: "Has <footer> element", required: false },
    ],
    standards: [
      { name: "HTML Semantic Elements", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics", source: "MDN" },
      { name: "HTML5 Specification", url: "https://html.spec.whatwg.org/multipage/", source: "W3C" },
      { name: "Semantic Structure", url: "https://webaim.org/techniques/semanticstructure/", source: "WebAIM" },
    ],
  },
  {
    id: "headingHierarchy",
    title: "Heading Hierarchy",
    weight: "10%",
    importance: "Medium",
    color: "yellow",
    description: "Check Heading order (H1-H6)",
    why: "Heading Hierarchy helps screen reader users navigate content, Search Engines understand content importance, and AI summarize article structure",
    checks: [
      { item: "Has 1 <h1> per page", required: true },
      { item: "Does not skip levels (h1 → h3)", required: true },
      { item: "h1 must come before h2, h3...", required: true },
      { item: "Use headings in order", required: false },
    ],
    standards: [
      { name: "Headings and Titles", url: "https://developers.google.com/search/docs/appearance/title-link", source: "Google" },
      { name: "Heading Rank", url: "https://www.w3.org/WAI/tutorials/page-structure/headings/", source: "W3C" },
      { name: "Headings", url: "https://webaim.org/techniques/semanticstructure/#headings", source: "WebAIM" },
    ],
  },
  {
    id: "llms",
    title: "llms.txt",
    weight: "5%",
    importance: "Low",
    color: "green",
    description: "Check llms.txt file",
    why: "llms.txt is a new standard that helps AI (ChatGPT, Claude, Gemini) understand websites. Tells AI what content the website has, helps AI reference information correctly, and increases chances of being cited in AI responses",
    checks: [
      { item: "File exists at /llms.txt", required: true },
      { item: "Has H1 Title", required: true },
      { item: "Has Bullet list of important pages", required: true },
      { item: "Has Optional sections", required: false },
    ],
    standards: [
      { name: "llms.txt Specification", url: "https://llmstxt.org/", source: "llmstxt.org" },
      { name: "llms.txt GitHub", url: "https://github.com/AnswerDotAI/llms-txt", source: "GitHub" },
    ],
  },
  {
    id: "openGraph",
    title: "Open Graph Protocol",
    weight: "0%",
    importance: "Not scored",
    color: "gray",
    description: "Check Open Graph Tags",
    why: "Open Graph defines how link previews display on Social Media: Facebook, LinkedIn, Twitter/X, Messaging apps (LINE, WhatsApp, iMessage), and sharing on Social Platforms",
    checks: [
      { item: "Has og:title", required: true },
      { item: "Has og:description", required: true },
      { item: "Has og:image", required: true },
      { item: "Has og:url", required: true },
      { item: "Has og:type", required: false },
      { item: "Has og:site_name", required: false },
    ],
    standards: [
      { name: "Open Graph Protocol", url: "https://ogp.me/", source: "Open Graph" },
      { name: "Sharing Debugger", url: "https://developers.facebook.com/tools/debug/", source: "Facebook" },
      { name: "Twitter Cards", url: "https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards", source: "Twitter" },
    ],
  },
  {
    id: "canonical",
    title: "Canonical URLs",
    weight: "0%",
    importance: "Not scored",
    color: "gray",
    description: "Check Canonical URL",
    why: "Canonical URL solves duplicate content issues by telling Search Engines which URL is the original, consolidates link signals to one URL, and prevents separate indexing of duplicate content",
    checks: [
      { item: "Has <link rel=\"canonical\">", required: true },
      { item: "URL is absolute URL", required: true },
      { item: "No self-referencing loop", required: true },
      { item: "No multiple canonical tags", required: true },
    ],
    standards: [
      { name: "Consolidate Duplicate URLs", url: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls", source: "Google" },
      { name: "RFC 6596 - Canonical Link Relation", url: "https://datatracker.ietf.org/doc/html/rfc6596", source: "IETF" },
    ],
  },
  {
    id: "mobile",
    title: "Mobile Responsiveness",
    weight: "0%",
    importance: "Not scored",
    color: "gray",
    description: "Check Mobile support",
    why: "Google uses Mobile-First Indexing, 70%+ of searches come from mobile, Google ranks based on mobile version primarily, and affects Core Web Vitals",
    checks: [
      { item: "Has <meta name=\"viewport\">", required: true },
      { item: "Content not wider than screen", required: true },
      { item: "Text readable without zoom", required: true },
      { item: "Touch targets have appropriate size", required: true },
    ],
    standards: [
      { name: "Mobile-First Indexing", url: "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-first-indexing", source: "Google" },
      { name: "Responsive Design Basics", url: "https://web.dev/articles/responsive-web-design-basics", source: "web.dev" },
      { name: "Viewport Meta Tag", url: "https://www.w3.org/TR/css-device-adapt-1/#viewport-meta", source: "W3C" },
    ],
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  red: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
  orange: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200" },
  green: { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
  gray: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
};

export default function ValidationCriteriaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Validation Criteria
                </h1>
                <p className="text-sm text-gray-500">
                  Reference documentation for AI Search Checker validation standards
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex px-3 py-1 text-xs border border-gray-300 rounded-full text-gray-600">
              Last updated: February 2026
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar - Navigation */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Navigation Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h2 className="font-medium text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Table of Contents
                  </h2>
                </div>
                <nav className="p-2 max-h-[400px] overflow-y-auto">
                  {criteriaData.map((criteria) => (
                    <a
                      key={criteria.id}
                      href={`#${criteria.id}`}
                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <span className="truncate">{criteria.title}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {criteria.weight}
                      </span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="font-medium text-gray-900 mb-3">Weight Summary</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Critical
                    </span>
                    <span className="font-medium text-gray-900">45%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      High
                    </span>
                    <span className="font-medium text-gray-900">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      Medium
                    </span>
                    <span className="font-medium text-gray-900">20%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Low
                    </span>
                    <span className="font-medium text-gray-900">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8">
            {/* Introduction */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    About this document
                  </h3>
                  <p className="text-sm text-blue-800">
                    This document compiles all 10 validation criteria topics that AI Search Checker uses to evaluate websites. 
                    Based on standards from Google Search Central, W3C, Schema.org, and trusted reference sources.
                  </p>
                </div>
              </div>
            </div>

            {/* Criteria Sections */}
            {criteriaData.map((criteria) => {
              const colors = colorClasses[criteria.color];
              return (
                <section 
                  key={criteria.id} 
                  id={criteria.id}
                  className="scroll-mt-24"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-semibold text-gray-900">{criteria.title}</h2>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {criteria.importance}
                            </span>
                          </div>
                          <p className="text-gray-500">{criteria.description}</p>
                        </div>
                        <span className="px-3 py-1 text-lg font-semibold bg-gray-100 text-gray-700 rounded-lg shrink-0">
                          {criteria.weight}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="px-6 py-5 space-y-6">
                      {/* Why Section */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          Why check this?
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {criteria.why}
                        </p>
                      </div>

                      {/* Checks Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Checklist
                        </h4>
                        <div className="space-y-2">
                          {criteria.checks.map((check, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="text-sm text-gray-700">{check.item}</span>
                              {'weight' in check && (
                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded shrink-0 ml-2">
                                  {check.weight}
                                </span>
                              )}
                              {'required' in check && check.required && (
                                <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded shrink-0 ml-2">
                                  Required
                                </span>
                              )}
                              {'required' in check && !check.required && (
                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded shrink-0 ml-2">
                                  Recommended
                                </span>
                              )}
                              {'threshold' in check && (
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded">
                                    {check.threshold}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    vs {check.bad}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Standards Section */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          Standards
                        </h4>
                        <div className="space-y-2">
                          {criteria.standards.map((standard, index) => (
                            <a
                              key={index}
                              href={standard.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 text-xs border border-gray-300 rounded shrink-0">
                                  {standard.source}
                                </span>
                                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {standard.name}
                                </span>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Footer Note */}
            <div className="text-center text-sm text-gray-500 pt-8 pb-4">
              <p>
                Validation criteria will be updated according to announcements from Google Search Central, new W3C standards, and industry best practices.
              </p>
              <p className="mt-2">
                Document prepared by AI Search Checker Team · For inquiries: support@ohmai.me
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
