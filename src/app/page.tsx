'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Progress } from '@/components/ui/progress';
import { ProjectManager } from '@/utils/projectManager';
import { ProjectWithData, ResultType } from '@/types/project';
import { ProjectList } from '@/components/features/ProjectList';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectWithData | null>(null);
  const [showProjectList, setShowProjectList] = useState(false);

  // URLが変更されたときにプロジェクトを読み込む
  useEffect(() => {
    if (url) {
      const existingProject = ProjectManager.getProjectByUrl(url);
      setCurrentProject(existingProject || null);
    } else {
      setCurrentProject(null);
    }
  }, [url]);

  const handleSiteAnalysis = async () => {
    if (!url) {
      alert('URLを入力してください');
      return;
    }
    setLoading('site-analysis');
    setResult(null);
    setProgress(0);
    
    try {
      setProgress(20);
      const response = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      setProgress(60);
      const data = await response.json();
      setProgress(80);

      if (!response.ok) {
        throw new Error(data.error || 'API エラーが発生しました');
      }

      const analysis = data.analysis;
      const resultText = `
📊 **サイト分析結果**

**基本情報:**
- タイトル: ${analysis.title}
- 説明: ${analysis.description}
- キーワード: ${analysis.keywords.join(', ') || 'なし'}

**コンテンツ構造:**
- H1タグ: ${analysis.headings.h1.length}個
- H2タグ: ${analysis.headings.h2.length}個  
- H3タグ: ${analysis.headings.h3.length}個

**画像最適化:**
- 総画像数: ${analysis.images.total}個
- Alt属性未設定: ${analysis.images.withoutAlt}個
- 最適化率: ${analysis.images.altOptimizationRate}%

**リンク構造:**
- 内部リンク: ${analysis.links.internal}個
- 外部リンク: ${analysis.links.external}個

**コンテンツ:**
- 文字数: 約${analysis.content.wordCount.toLocaleString()}語
- 構造化データ: ${analysis.content.hasStructuredData ? 'あり' : 'なし'}
- Open Graph: ${analysis.content.hasOpenGraph ? 'あり' : 'なし'}
      `;
      
      setProgress(100);
      setResult(resultText);
      
      // プロジェクトに結果を保存
      const project = currentProject || ProjectManager.createProject(url);
      const updatedProject = ProjectManager.updateProjectData(project.id, 'siteAnalysis', resultText);
      if (updatedProject && !currentProject) {
        setCurrentProject(updatedProject);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '分析中にエラーが発生しました');
    } finally {
      setLoading('');
      setProgress(0);
    }
  };

  const handleSEOSuggestions = async () => {
    if (!url) {
      alert('URLを入力してください');
      return;
    }
    setLoading('seo-suggestions');
    setResult(null);
    
    try {
      const response = await fetch('/api/seo-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API エラーが発生しました');
      }

      const suggestions = data.suggestions;
      const resultText = `
🎯 **SEO改善提案**

${suggestions.map((suggestion: any, index: number) => `
**${index + 1}. ${suggestion.title}** ${suggestion.priority === 'high' ? '🔴' : suggestion.priority === 'medium' ? '🟡' : '🟢'}
カテゴリ: ${suggestion.category}
問題: ${suggestion.description}
対応策: ${suggestion.implementation}
`).join('\n')}

**改善の優先順位:**
- 🔴 高優先度: 最初に対応すべき重要な問題
- 🟡 中優先度: 次に対応すべき改善項目  
- 🟢 低優先度: 余裕があるときに対応
      `;
      
      setResult(resultText);
      
      // プロジェクトに結果を保存
      if (currentProject) {
        ProjectManager.updateProjectData(currentProject.id, 'seoSuggestions', resultText);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'SEO提案生成中にエラーが発生しました');
    } finally {
      setLoading('');
      setProgress(0);
    }
  };

  const handleTopicCluster = async () => {
    if (!topic) {
      alert('トピックを入力してください');
      return;
    }
    setLoading('topic-cluster');
    setResult(null);
    
    try {
      const response = await fetch('/api/topic-cluster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API エラーが発生しました');
      }

      const cluster = data.cluster;
      const resultText = `
🎯 **トピッククラスター: "${topic}"**

## ピラーコンテンツ
**タイトル:** ${cluster.pillarContent.title}
**説明:** ${cluster.pillarContent.description}
**目標文字数:** ${cluster.pillarContent.estimatedWordCount.toLocaleString()}文字
**対象キーワード:** ${cluster.pillarContent.targetKeywords.join(', ')}

## クラスター記事 (${cluster.clusterTopics.length}記事)
${cluster.clusterTopics.map((article: any, index: number) => `
**${index + 1}. ${article.title}**
- 種類: ${article.contentType}
- キーワード: ${article.keywords.join(', ')}
- 文字数: ${article.estimatedWordCount.toLocaleString()}文字
- 難易度: ${article.difficulty}
- 検索ボリューム: ${article.searchVolume}
`).join('')}

## キーワード戦略
**メインキーワード:** ${cluster.keywords.primary.join(', ')}
**セカンダリキーワード:** ${cluster.keywords.secondary.join(', ')}
**ロングテールキーワード:** ${cluster.keywords.longtail.slice(0, 3).join(', ')}...

## コンテンツ戦略
- **総記事数:** ${cluster.contentStrategy.totalArticles}記事
- **実装期間:** ${cluster.contentStrategy.estimatedTimeframe}
- **SEOスコア:** ${cluster.seoScore}/100点
      `;
      
      setResult(resultText);
      
      // プロジェクトに結果を保存（トピック関連）
      let project = currentProject;
      if (!project && url) {
        project = ProjectManager.createProject(url);
      }
      if (project) {
        const updatedProject = ProjectManager.updateProjectData(project.id, 'topicCluster', resultText, { topic });
        if (updatedProject && !currentProject) {
          setCurrentProject(updatedProject);
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'トピッククラスター生成中にエラーが発生しました');
    } finally {
      setLoading('');
      setProgress(0);
    }
  };

  const handleArticleGeneration = async () => {
    if (!topic) {
      alert('トピックを入力してください');
      return;
    }
    setLoading('article-generation');
    setResult(null);
    
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API エラーが発生しました');
      }

      const article = data.article;
      const resultText = `
📝 **記事生成完了: "${topic}"**

**記事情報:**
- タイトル: ${article.title}
- 文字数: ${article.wordCount.toLocaleString()}文字
- 読了時間: 約${article.readingTime}分
- セクション数: ${article.structure.sections.length}個

**SEO情報:**
- メタタイトル: ${article.seoData.metaTitle}
- メタディスクリプション: ${article.seoData.metaDescription}
- 対象キーワード: ${article.seoData.targetKeywords.join(', ')}

**記事構成:**
${article.structure.sections.map((section: any, index: number) => `
${index + 1}. ${section.title}
   - 目標文字数: ${section.targetWordCount.toLocaleString()}文字
   - キーワード: ${section.targetKeywords.join(', ')}
`).join('')}

**生成された記事の冒頭:**
${article.content.substring(0, 300)}...

記事の全文は${article.wordCount.toLocaleString()}文字で生成されました。
      `;
      
      setResult(resultText);
      
      // プロジェクトに結果を保存（トピック関連）
      let project = currentProject;
      if (!project && url) {
        project = ProjectManager.createProject(url);
      }
      if (project) {
        const updatedProject = ProjectManager.updateProjectData(project.id, 'articleGeneration', resultText, { topic });
        if (updatedProject && !currentProject) {
          setCurrentProject(updatedProject);
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '記事生成中にエラーが発生しました');
    } finally {
      setLoading('');
      setProgress(0);
    }
  };

  const handleSelectProject = (project: ProjectWithData) => {
    setCurrentProject(project);
    setUrl(project.url);
    setShowProjectList(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <h1 className="text-4xl font-bold text-gray-900">
            記事作成支援サービス
          </h1>
          <Button
            onClick={() => setShowProjectList(!showProjectList)}
            variant="outline"
            className="text-sm"
          >
            {showProjectList ? '作業画面に戻る' : 'プロジェクト一覧'}
          </Button>
        </div>
        <p className="text-xl text-gray-600">
          SEOトピッククラスター理論に基づいた記事作成を支援します
        </p>
      </header>
      
      {showProjectList ? (
        <ProjectList 
          onSelectProject={handleSelectProject}
          currentProjectId={currentProject?.id}
        />
      ) : (
        <div className="space-y-8">
        {/* 入力フォーム */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">入力項目</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                URL（サイト分析・SEO改善提案用）
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                トピック（クラスター生成・記事生成用）
              </label>
              <Input
                type="text"
                placeholder="例: プログラミング学習"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* プロジェクト情報 */}
        {currentProject && (
          <Card className="p-6 bg-blue-50">
            <h2 className="text-2xl font-semibold mb-4">現在のプロジェクト</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">プロジェクトID</div>
                <div className="font-mono text-sm">{currentProject.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">URL</div>
                <div className="text-sm break-all">{currentProject.url}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">作成日時</div>
                <div className="text-sm">{new Date(currentProject.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">最終更新</div>
                <div className="text-sm">{new Date(currentProject.updatedAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">保存済みコンテンツ</div>
              <div className="flex gap-2 mt-2">
                {currentProject.data.siteAnalysis && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">サイト分析</span>}
                {currentProject.data.seoSuggestions && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">SEO提案</span>}
                {currentProject.data.topicCluster && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">クラスター</span>}
                {currentProject.data.articleGeneration && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">記事生成</span>}
              </div>
            </div>
          </Card>
        )}

        {/* 機能ボタン */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">機能一覧</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">サイト分析</h3>
              <p className="text-gray-600 mb-4">
                URLを入力してWebサイト全体の構造とコンテンツを分析
              </p>
              <Button 
                onClick={handleSiteAnalysis}
                disabled={loading !== ''}
                className="w-full"
              >
                {loading === 'site-analysis' ? <Loading /> : '分析開始'}
              </Button>
              {currentProject?.data.siteAnalysis && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      保存済み ({new Date(currentProject.data.siteAnalysis.generatedAt).toLocaleString()})
                    </div>
                    <Button 
                      onClick={handleSiteAnalysis}
                      disabled={loading !== ''}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      再生成
                    </Button>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-line bg-white p-3 rounded border max-h-60 overflow-y-auto">
                    {currentProject.data.siteAnalysis.result}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">SEO改善提案</h3>
              <p className="text-gray-600 mb-4">
                分析結果に基づいてSEO改善施策を提案
              </p>
              <Button 
                onClick={handleSEOSuggestions}
                disabled={loading !== ''}
                className="w-full"
              >
                {loading === 'seo-suggestions' ? <Loading /> : '提案生成'}
              </Button>
              {currentProject?.data.seoSuggestions && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      保存済み ({new Date(currentProject.data.seoSuggestions.generatedAt).toLocaleString()})
                    </div>
                    <Button 
                      onClick={handleSEOSuggestions}
                      disabled={loading !== ''}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      再生成
                    </Button>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-line bg-white p-3 rounded border max-h-60 overflow-y-auto">
                    {currentProject.data.seoSuggestions.result}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">トピッククラスター生成</h3>
              <p className="text-gray-600 mb-4">
                コンテンツ戦略に最適なトピッククラスターを自動生成
              </p>
              <Button 
                onClick={handleTopicCluster}
                disabled={loading !== ''}
                className="w-full"
              >
                {loading === 'topic-cluster' ? <Loading /> : 'クラスター生成'}
              </Button>
              {currentProject?.data.topicCluster && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      保存済み ({new Date(currentProject.data.topicCluster.generatedAt).toLocaleString()})
                      <br />トピック: {currentProject.data.topicCluster.topic}
                    </div>
                    <Button 
                      onClick={handleTopicCluster}
                      disabled={loading !== ''}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      再生成
                    </Button>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-line bg-white p-3 rounded border max-h-60 overflow-y-auto">
                    {currentProject.data.topicCluster.result}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">記事自動生成</h3>
              <p className="text-gray-600 mb-4">
                2万文字以上の高品質な記事を自動生成
              </p>
              <Button 
                onClick={handleArticleGeneration}
                disabled={loading !== ''}
                className="w-full"
              >
                {loading === 'article-generation' ? <Loading /> : '記事生成'}
              </Button>
              {currentProject?.data.articleGeneration && (
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      保存済み ({new Date(currentProject.data.articleGeneration.generatedAt).toLocaleString()})
                      <br />トピック: {currentProject.data.articleGeneration.topic}
                    </div>
                    <Button 
                      onClick={handleArticleGeneration}
                      disabled={loading !== ''}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      再生成
                    </Button>
                  </div>
                  <div className="text-sm text-gray-800 whitespace-pre-line bg-white p-3 rounded border max-h-60 overflow-y-auto">
                    {currentProject.data.articleGeneration.result}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* プログレスバー */}
        {loading && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">処理中...</h2>
            <Progress value={progress} className="mb-4" />
            <div className="text-center text-gray-600">
              {loading === 'site-analysis' && 'サイトを分析しています...'}
              {loading === 'seo-suggestions' && 'SEO改善提案を生成しています...'}
              {loading === 'topic-cluster' && 'トピッククラスターを生成しています...'}
              {loading === 'article-generation' && '記事を生成しています...'}
            </div>
          </Card>
        )}

        {/* 結果表示 */}
        {result && !loading && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">実行結果</h2>
            <div className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {result}
            </div>
          </Card>
        )}
        </div>
      )}
    </div>
  )
}