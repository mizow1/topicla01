'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectData } from '@/types/project';
import { ChevronDown, ChevronUp, Clock, RefreshCw } from 'lucide-react';

interface SavedResultsProps {
  projectData: ProjectData;
  onRegenerate: (type: 'site-analysis' | 'seo-suggestions' | 'topic-cluster' | 'article-generation') => void;
}

export function SavedResults({ projectData, onRegenerate }: SavedResultsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const ResultSection = ({ 
    title, 
    result, 
    generatedAt, 
    sectionKey,
    onRegenerate: onRegenerateSection
  }: {
    title: string;
    result: string;
    generatedAt: string;
    sectionKey: string;
    onRegenerate: () => void;
  }) => {
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="border border-gray-200 rounded-lg mb-4">
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {formatDate(generatedAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={onRegenerateSection}
              variant="outline"
              size="sm"
              className="text-xs px-2 py-1 h-7"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              再生成
            </Button>
            <Button
              onClick={() => toggleSection(sectionKey)}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div className="p-4 border-t">
            <div className="text-gray-700 whitespace-pre-line bg-white p-4 rounded border max-h-80 overflow-y-auto text-sm">
              {result}
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasResults = projectData.siteAnalysis || projectData.seoSuggestions || 
                    projectData.topicCluster || projectData.articleGeneration;

  if (!hasResults) {
    return null;
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">保存されている結果</h2>
      
      {projectData.siteAnalysis && (
        <ResultSection
          title="サイト分析結果"
          result={projectData.siteAnalysis.result}
          generatedAt={projectData.siteAnalysis.generatedAt}
          sectionKey="site-analysis"
          onRegenerate={() => onRegenerate('site-analysis')}
        />
      )}

      {projectData.seoSuggestions && (
        <ResultSection
          title="SEO改善提案"
          result={projectData.seoSuggestions.result}
          generatedAt={projectData.seoSuggestions.generatedAt}
          sectionKey="seo-suggestions"
          onRegenerate={() => onRegenerate('seo-suggestions')}
        />
      )}

      {projectData.topicCluster && (
        <ResultSection
          title={`トピッククラスター: "${projectData.topicCluster.topic}"`}
          result={projectData.topicCluster.result}
          generatedAt={projectData.topicCluster.generatedAt}
          sectionKey="topic-cluster"
          onRegenerate={() => onRegenerate('topic-cluster')}
        />
      )}

      {projectData.articleGeneration && (
        <ResultSection
          title={`記事生成結果: "${projectData.articleGeneration.topic}"`}
          result={projectData.articleGeneration.result}
          generatedAt={projectData.articleGeneration.generatedAt}
          sectionKey="article-generation"
          onRegenerate={() => onRegenerate('article-generation')}
        />
      )}
    </Card>
  );
}