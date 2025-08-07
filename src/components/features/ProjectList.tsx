'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectWithData } from '@/types/project';
import { ProjectManager } from '@/utils/projectManager';
import { Trash2, ExternalLink, Calendar, Globe } from 'lucide-react';

interface ProjectListProps {
  onSelectProject?: (project: ProjectWithData) => void;
  currentProjectId?: string;
}

export function ProjectList({ onSelectProject, currentProjectId }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectWithData[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = ProjectManager.getAllProjects();
    setProjects(allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('このプロジェクトを削除しますか？')) {
      ProjectManager.deleteProject(projectId);
      loadProjects();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getProjectStats = (project: ProjectWithData) => {
    const data = project.data;
    const stats = {
      total: 0,
      siteAnalysis: !!data.siteAnalysis,
      seoSuggestions: !!data.seoSuggestions,
      topicCluster: !!data.topicCluster,
      articleGeneration: !!data.articleGeneration
    };
    stats.total = [stats.siteAnalysis, stats.seoSuggestions, stats.topicCluster, stats.articleGeneration].filter(Boolean).length;
    return stats;
  };

  if (projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">プロジェクトがありません</div>
        <div className="text-gray-400 text-sm">URLを入力して最初のプロジェクトを作成しましょう</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">プロジェクト一覧</h2>
        <div className="text-sm text-gray-600">
          {projects.length}個のプロジェクト
        </div>
      </div>
      
      <div className="grid gap-4">
        {projects.map((project) => {
          const stats = getProjectStats(project);
          const isSelected = currentProjectId === project.id;
          
          return (
            <Card 
              key={project.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => onSelectProject?.(project)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div className="font-mono text-sm text-gray-600">
                      {project.id}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-800 mb-3 break-all">
                    <div className="font-medium">URL:</div>
                    <div className="text-blue-600 hover:text-blue-800">
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {project.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      作成: {formatDate(project.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      更新: {formatDate(project.updatedAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">
                      生成済み: {stats.total}/4
                    </div>
                    <div className="flex gap-1">
                      {stats.siteAnalysis && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">分析</span>
                      )}
                      {stats.seoSuggestions && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">SEO</span>
                      )}
                      {stats.topicCluster && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">クラスター</span>
                      )}
                      {stats.articleGeneration && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">記事</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}