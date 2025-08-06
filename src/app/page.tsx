'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSiteAnalysis = async () => {
    if (!url) {
      alert('URLを入力してください');
      return;
    }
    setLoading('site-analysis');
    setResult(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult(`サイト分析結果: ${url} の構造とSEO状況を分析しました。`);
    } catch (error) {
      alert('分析中にエラーが発生しました');
    } finally {
      setLoading('');
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult(`SEO改善提案: ${url} に対する具体的な改善施策を生成しました。`);
    } catch (error) {
      alert('提案生成中にエラーが発生しました');
    } finally {
      setLoading('');
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResult(`トピッククラスター: "${topic}" に関連するコンテンツクラスターを生成しました。`);
    } catch (error) {
      alert('クラスター生成中にエラーが発生しました');
    } finally {
      setLoading('');
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
      await new Promise(resolve => setTimeout(resolve, 3000));
      setResult(`記事生成完了: "${topic}" について2万文字以上の高品質な記事を生成しました。`);
    } catch (error) {
      alert('記事生成中にエラーが発生しました');
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          記事作成支援サービス
        </h1>
        <p className="text-xl text-gray-600">
          SEOトピッククラスター理論に基づいた記事作成を支援します
        </p>
      </header>
      
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
            </div>
          </div>
        </Card>

        {/* 結果表示 */}
        {result && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">実行結果</h2>
            <p className="text-gray-700">{result}</p>
          </Card>
        )}
      </div>
    </div>
  )
}