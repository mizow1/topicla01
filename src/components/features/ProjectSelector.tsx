'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Project } from '@/types/project';
import { ProjectStorage } from '@/utils/projectStorage';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

interface ProjectSelectorProps {
  currentProjectId: string;
  onProjectChange: (projectId: string) => void;
}

export function ProjectSelector({ currentProjectId, onProjectChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const projectList = ProjectStorage.getProjects();
    setProjects(projectList);
  };

  const handleCreateProject = () => {
    if (!newUrl) {
      alert('URLを入力してください');
      return;
    }

    try {
      new URL(newUrl); // URL validation
    } catch {
      alert('有効なURLを入力してください');
      return;
    }

    const project = ProjectStorage.createProjectFromUrl(newUrl);
    if (newName.trim()) {
      project.name = newName.trim();
    }

    ProjectStorage.saveProject(project);
    ProjectStorage.setCurrentProject(project.id);
    onProjectChange(project.id);
    
    setProjects([...projects, project]);
    setShowNewProjectForm(false);
    setNewUrl('');
    setNewName('');
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('このプロジェクトを削除しますか？すべての分析結果も削除されます。')) {
      ProjectStorage.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      
      if (projectId === currentProjectId) {
        onProjectChange('');
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    ProjectStorage.setCurrentProject(projectId);
    onProjectChange(projectId);
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          プロジェクト管理
        </h2>
        <Button
          onClick={() => setShowNewProjectForm(!showNewProjectForm)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新規プロジェクト
        </Button>
      </div>

      {/* 新規プロジェクト作成フォーム */}
      {showNewProjectForm && (
        <div className="p-4 border rounded-lg mb-4 bg-gray-50">
          <h3 className="font-medium mb-3">新規プロジェクト作成</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">URL（必須）</label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">プロジェクト名（任意）</label>
              <Input
                type="text"
                placeholder="自動生成されます"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateProject} size="sm">
                作成
              </Button>
              <Button 
                onClick={() => {
                  setShowNewProjectForm(false);
                  setNewUrl('');
                  setNewName('');
                }}
                variant="outline"
                size="sm"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 現在のプロジェクト表示 */}
      {currentProject && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">{currentProject.name}</h3>
              <p className="text-sm text-blue-600">{currentProject.url}</p>
              <p className="text-xs text-blue-500">
                作成: {new Date(currentProject.createdAt).toLocaleDateString('ja-JP')}
                {currentProject.updatedAt !== currentProject.createdAt && (
                  <> / 更新: {new Date(currentProject.updatedAt).toLocaleDateString('ja-JP')}</>
                )}
              </p>
            </div>
            <Button
              onClick={(e) => handleDeleteProject(currentProject.id, e)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* プロジェクト一覧 */}
      {projects.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">プロジェクト一覧 ({projects.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  project.id === currentProjectId
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectProject(project.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{project.name}</div>
                    <div className="text-xs text-gray-500 truncate">{project.url}</div>
                  </div>
                  <Button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && !showNewProjectForm && (
        <div className="text-center py-8 text-gray-500">
          <p>プロジェクトがありません</p>
          <p className="text-sm">「新規プロジェクト」ボタンからプロジェクトを作成してください</p>
        </div>
      )}
    </Card>
  );
}