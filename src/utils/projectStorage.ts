import { Project, ProjectWithData, ProjectData } from '@/types/project';

const STORAGE_KEYS = {
  PROJECTS: 'article-projects',
  PROJECT_DATA: (id: string) => `project-data-${id}`,
  CURRENT_PROJECT: 'current-project-id'
} as const;

export class ProjectStorage {
  static getProjects(): Project[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  }

  static saveProject(project: Project): void {
    if (typeof window === 'undefined') return;
    const projects = this.getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  static deleteProject(projectId: string): void {
    if (typeof window === 'undefined') return;
    const projects = this.getProjects().filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.removeItem(STORAGE_KEYS.PROJECT_DATA(projectId));
    
    if (this.getCurrentProjectId() === projectId) {
      this.setCurrentProject('');
    }
  }

  static getProjectData(projectId: string): ProjectData {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_DATA(projectId));
    return stored ? JSON.parse(stored) : {};
  }

  static saveProjectData(projectId: string, data: ProjectData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PROJECT_DATA(projectId), JSON.stringify(data));
    
    // Update project's updatedAt timestamp
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex >= 0) {
      projects[projectIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    }
  }

  static getProjectWithData(projectId: string): ProjectWithData | null {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const data = this.getProjectData(projectId);
    return { ...project, data };
  }

  static getCurrentProjectId(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT) || '';
  }

  static setCurrentProject(projectId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, projectId);
  }

  static generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createProjectFromUrl(url: string): Project {
    const hostname = new URL(url).hostname;
    const name = hostname.replace('www.', '');
    
    return {
      id: this.generateProjectId(),
      name: `${name}のプロジェクト`,
      url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}