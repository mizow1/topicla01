export interface ArticleGenerationRequest {
  selectedClusters: import('./cluster').TopicCluster[]
  tone?: 'professional' | 'casual' | 'academic' | 'conversational'
  targetAudience?: string
  includeImages?: boolean
  includeCTA?: boolean
  customInstructions?: string
}

export interface ArticleMetadata {
  title: string
  metaDescription: string
  keywords: string[]
  tags: string[]
  readingTime: number
  wordCount: number
  headingStructure: HeadingStructureAnalysis
  internalLinks: string[]
  externalLinks: string[]
  lastModified: string
}

export interface HeadingStructureAnalysis {
  h1: string[]
  h2: string[]
  h3: string[]
  h4: string[]
  h5: string[]
}

export interface GeneratedArticle {
  content: string
  metadata: ArticleMetadata
  seoScore: number
  readabilityScore: number
  suggestions: string[]
}

export interface ArticleGenerationProgress {
  stage: 'analyzing' | 'outlining' | 'writing' | 'optimizing' | 'completed' | 'error'
  progress: number
  currentTask: string
  estimatedTimeRemaining?: number
}

export interface Article {
  title: string
  topic: string
  content: string
  wordCount: number
  structure: {
    totalWordCount: number
    sections: {
      id: string
      title: string
      level: number
      targetWordCount: number
      targetKeywords: string[]
      subsections: string[]
    }[]
  }
  seoData: {
    metaTitle: string
    metaDescription: string
    targetKeywords: string[]
    headings: {
      level: number
      text: string
      keywords: string[]
    }[]
  }
  readingTime: number
  publishedAt: string
  lastUpdated: string
}