export interface Project {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectData {
  siteAnalysis?: SiteAnalysisResult;
  seoSuggestions?: SEOSuggestionsResult;
  topicCluster?: TopicClusterResult;
  articleGeneration?: ArticleGenerationResult;
}

export interface SiteAnalysisResult {
  result: string;
  generatedAt: string;
}

export interface SEOSuggestionsResult {
  result: string;
  generatedAt: string;
}

export interface TopicClusterResult {
  result: string;
  generatedAt: string;
  topic: string;
}

export interface ArticleGenerationResult {
  result: string;
  generatedAt: string;
  topic: string;
}

export interface ProjectWithData extends Project {
  data: ProjectData;
}

export interface ProjectManager {
  projects: ProjectWithData[];
  currentProject?: ProjectWithData;
}

export type ResultType = 'siteAnalysis' | 'seoSuggestions' | 'topicCluster' | 'articleGeneration';