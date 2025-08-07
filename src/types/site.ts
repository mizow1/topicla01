export interface SiteOverview {
  domain: string
  urls: string[]
  title: string
  description: string
  mainTopics: string[]
  contentStructure: ContentStructure
  seoMetrics: SEOMetrics
}

export interface ContentStructure {
  pageCount: number
  categories: string[]
  contentTypes: ContentType[]
  internalLinks: number
  externalLinks: number
}

export interface ContentType {
  type: 'article' | 'product' | 'category' | 'about' | 'contact' | 'other'
  count: number
  examples: string[]
}

export interface SEOMetrics {
  titleTags: SEOTagAnalysis
  metaDescriptions: SEOTagAnalysis
  headingStructure: HeadingAnalysis
  imageOptimization: ImageAnalysis
  pageSpeed: PageSpeedMetrics
}

export interface SEOTagAnalysis {
  total: number
  missing: number
  duplicates: number
  tooShort: number
  tooLong: number
  optimized: number
}

export interface HeadingAnalysis {
  h1Count: number
  h2Count: number
  h3Count: number
  h4Count: number
  missingH1: string[]
  multipleH1: string[]
}

export interface ImageAnalysis {
  total: number
  missingAlt: number
  oversized: number
  unoptimized: number
}

export interface PageSpeedMetrics {
  desktop: number
  mobile: number
  coreWebVitals: {
    lcp: number
    fid: number
    cls: number
  }
}

export interface SiteAnalysis {
  url: string
  title: string
  description: string
  keywords: string[]
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  images: {
    total: number
    withoutAlt: number
    altOptimizationRate: number
  }
  links: {
    internal: number
    external: number
    total: number
  }
  content: {
    wordCount: number
    hasStructuredData: boolean
    hasOpenGraph: boolean
    hasTwitterCard: boolean
  }
  aiAnalysis?: string
  analyzedAt: string
}