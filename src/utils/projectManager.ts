import { ProjectWithData, ProjectData, ResultType } from '@/types/project';

const STORAGE_KEY = 'article-assistant-projects';

export class ProjectManager {
  static generateProjectId(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  static saveProject(project: ProjectWithData): void {
    const projects = this.getAllProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  static getAllProjects(): ProjectWithData[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load projects:', error);
      return [];
    }
  }

  static getProject(id: string): ProjectWithData | undefined {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id);
  }

  static getProjectByUrl(url: string): ProjectWithData | undefined {
    const id = this.generateProjectId(url);
    return this.getProject(id);
  }

  static createProject(url: string, name?: string): ProjectWithData {
    const id = this.generateProjectId(url);
    const now = new Date().toISOString();
    
    return {
      id,
      name: name || `Project ${id}`,
      url,
      createdAt: now,
      updatedAt: now,
      data: {}
    };
  }

  static updateProjectData(
    projectId: string, 
    resultType: ResultType, 
    result: string, 
    additionalData?: { topic?: string }
  ): ProjectWithData | null {
    const project = this.getProject(projectId);
    if (!project) return null;

    const now = new Date().toISOString();
    project.updatedAt = now;

    switch (resultType) {
      case 'siteAnalysis':
        project.data.siteAnalysis = { result, generatedAt: now };
        break;
      case 'seoSuggestions':
        project.data.seoSuggestions = { result, generatedAt: now };
        break;
      case 'topicCluster':
        project.data.topicCluster = { 
          result, 
          generatedAt: now, 
          topic: additionalData?.topic || '' 
        };
        break;
      case 'articleGeneration':
        project.data.articleGeneration = { 
          result, 
          generatedAt: now, 
          topic: additionalData?.topic || '' 
        };
        break;
    }

    this.saveProject(project);
    return project;
  }

  static deleteProject(id: string): boolean {
    const projects = this.getAllProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    
    if (filteredProjects.length === projects.length) {
      return false; // Project not found
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
    return true;
  }
}