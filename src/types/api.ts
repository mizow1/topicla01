export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AnalyzeSiteRequest {
  url: string
  additionalUrls?: string[]
  deepCrawl?: boolean
  includeSubdomains?: boolean
}

export interface AnalyzeSiteResponse {
  urls: string[]
  siteOverview: import('./site').SiteOverview
  crawlStats: {
    totalPages: number
    successfulPages: number
    failedPages: number
    crawlTime: number
  }
}

export interface ProgressResponse {
  taskId: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  message: string
  result?: any
  error?: ApiError
}