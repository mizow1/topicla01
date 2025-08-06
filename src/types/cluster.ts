export interface TopicCluster {
  id: string
  title: string
  description: string
  keywords: string[]
  pillarPage?: PillarPage
  clusterPages: ClusterPage[]
  level: number
  parentId?: string
  children: TopicCluster[]
}

export interface PillarPage {
  title: string
  metaDescription: string
  targetKeywords: string[]
  contentOutline: string[]
  wordCount: number
  internalLinks: string[]
}

export interface ClusterPage {
  title: string
  metaDescription: string
  tags: string[]
  targetKeywords: string[]
  contentOutline: string[]
  wordCount: number
  relatedTopics: string[]
}

export interface ClusterGenerationRequest {
  siteData: import('./site').SiteOverview
  focusAreas?: string[]
  competitorUrls?: string[]
  targetAudience?: string
}

export interface ClusterExpansionRequest {
  existingClusters: TopicCluster[]
  count: number
  focusAreas?: string[]
  targetKeywords?: string[]
}

export interface GeneratedTopicCluster {
  mainTopic: string
  pillarContent: {
    title: string
    description: string
    targetKeywords: string[]
    estimatedWordCount: number
    contentOutline: string[]
  }
  clusterTopics: {
    title: string
    keywords: string[]
    contentType: string
    estimatedWordCount: number
    difficulty: string
    searchVolume: string
  }[]
  keywords: {
    primary: string[]
    secondary: string[]
    longtail: string[]
    related: string[]
  }
  contentStrategy: {
    totalArticles: number
    estimatedTimeframe: string
    publicationSchedule: {
      pillarContent: string
      clusterArticles: string
    }
    interlinkingStrategy: string[]
    distributionChannels: string[]
    measurementKPIs: string[]
  }
  seoScore: number
  createdAt: string
}