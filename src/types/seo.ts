export interface SEORecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'technical' | 'content' | 'structure' | 'performance'
  expectedImpact: string
  actionItems: string[]
  estimatedEffort: 'low' | 'medium' | 'high'
  timeframe: 'immediate' | 'short-term' | 'long-term'
}

export interface SEOAnalysisRequest {
  siteData: import('./site').SiteOverview
  competitorUrls?: string[]
  targetKeywords?: string[]
}

export interface SEOAnalysisResponse {
  recommendations: SEORecommendation[]
  overallScore: number
  categoryScores: {
    technical: number
    content: number
    structure: number
    performance: number
  }
  priorityBreakdown: {
    high: number
    medium: number
    low: number
  }
}