import { NextRequest, NextResponse } from 'next/server';
import { SEOSuggestion } from '@/types/seo';
import { generateWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URLが必要です' },
        { status: 400 }
      );
    }

    const suggestions = await generateSEOSuggestions(url);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('SEO提案生成エラー:', error);
    return NextResponse.json(
      { error: 'SEO提案生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function generateSEOSuggestions(url: string): Promise<SEOSuggestion[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = await response.text();
    
    // 基本的なSEO要素の抽出
    const basicAnalysis = extractBasicSEOElements(html);
    
    // Geminiを使用した高度なSEO分析
    const geminiSuggestions = await generateSEOSuggestionsWithGemini(url, html, basicAnalysis);
    
    // 従来のルールベース分析も併用
    const ruleBased = generateRuleBasedSuggestions(html, url);
    
    // 両方の結果を統合
    const suggestions: SEOSuggestion[] = [...geminiSuggestions, ...ruleBased];

    return suggestions;
  } catch (error) {
    throw new Error(`SEO分析に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractBasicSEOElements(html: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const h1Tags = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  const h2Tags = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
  const images = html.match(/<img[^>]*>/gi) || [];
  const links = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
  
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descriptionMatch ? descriptionMatch[1].trim() : null,
    keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
    h1Count: h1Tags.length,
    h2Count: h2Tags.length,
    imageCount: images.length,
    linkCount: links.length,
    textContent: html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000)
  };
}

async function generateSEOSuggestionsWithGemini(url: string, html: string, basicAnalysis: any): Promise<SEOSuggestion[]> {
  const prompt = `
あなたは専門的なSEOアナリストです。以下のWebサイトを分析して、具体的で実装可能なSEO改善提案を作成してください。

【分析対象サイト】
URL: ${url}

【現在のSEO状況】
タイトル: ${basicAnalysis.title || '設定なし'}
メタディスクリプション: ${basicAnalysis.description || '設定なし'}
キーワード: ${basicAnalysis.keywords.join(', ') || '設定なし'}
H1タグ数: ${basicAnalysis.h1Count}
H2タグ数: ${basicAnalysis.h2Count}
画像数: ${basicAnalysis.imageCount}
リンク数: ${basicAnalysis.linkCount}

【コンテンツ（最初の3000文字）】
${basicAnalysis.textContent}

以下の形式でSEO改善提案を作成してください（JSON配列形式）：

[
  {
    "category": "メタタグ",
    "priority": "high",
    "title": "具体的な改善項目",
    "description": "問題の詳細説明と改善による効果",
    "implementation": "具体的な実装方法や推奨コード"
  }
]

以下の観点から分析してください：
1. タイトルタグの最適化
2. メタディスクリプションの改善
3. 見出し構造の最適化
4. キーワード戦略
5. コンテンツの質と関連性
6. 内部リンク構造
7. 画像最適化
8. ページ読み込み速度
9. モバイル対応
10. 構造化データ

優先度は "high", "medium", "low" で設定してください。
改善提案は具体的で実装可能なものにしてください。
`;

  try {
    const response = await generateWithGemini(prompt);
    const suggestions = JSON.parse(response.replace(/```json\n?|```/g, '').trim());
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error('Gemini SEO analysis error:', error);
    return [{
      category: 'AI分析',
      priority: 'high' as const,
      title: 'AI分析に一時的に失敗',
      description: 'AI分析サービスに問題が発生しました。基本的なSEOチェックは実行されています。',
      implementation: '少し時間をおいてから再度分析を実行してください。'
    }];
  }
}

function generateRuleBasedSuggestions(html: string, url: string): SEOSuggestion[] {
  const suggestions: SEOSuggestion[] = [];

  // タイトルタグの分析
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!titleMatch) {
    suggestions.push({
      category: 'メタタグ',
      priority: 'high',
      title: 'タイトルタグが見つかりません',
      description: 'ページにtitleタグを追加してください。SEOにとって最も重要な要素の一つです。',
      implementation: '<title>適切なページタイトル（50-60文字程度）</title>'
    });
  } else {
    const title = titleMatch[1];
    if (title.length < 30) {
      suggestions.push({
        category: 'メタタグ',
        priority: 'medium',
        title: 'タイトルが短すぎます',
        description: `現在のタイトル長: ${title.length}文字。30-60文字程度が推奨されます。`,
        implementation: 'より詳細で魅力的なタイトルに変更してください。'
      });
    } else if (title.length > 60) {
      suggestions.push({
        category: 'メタタグ',
        priority: 'medium',
        title: 'タイトルが長すぎます',
        description: `現在のタイトル長: ${title.length}文字。検索結果で切り詰められる可能性があります。`,
        implementation: '60文字以内に収めるようタイトルを短縮してください。'
      });
    }
  }

  // H1タグの分析
  const h1Tags = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
  if (h1Tags.length === 0) {
    suggestions.push({
      category: 'コンテンツ構造',
      priority: 'high',
      title: 'H1タグが見つかりません',
      description: 'ページの主題を表すH1タグを追加してください。',
      implementation: '<h1>ページのメイントピック</h1>'
    });
  } else if (h1Tags.length > 1) {
    suggestions.push({
      category: 'コンテンツ構造',
      priority: 'medium',
      title: 'H1タグが複数あります',
      description: `${h1Tags.length}個のH1タグが見つかりました。1ページにつき1つのH1タグが推奨されます。`,
      implementation: '追加のH1タグをH2またはH3に変更してください。'
    });
  }

  // 画像のalt属性チェック
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithoutAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""'));
  if (imagesWithoutAlt.length > 0) {
    suggestions.push({
      category: 'アクセシビリティ',
      priority: 'medium',
      title: 'alt属性が設定されていない画像があります',
      description: `${imagesWithoutAlt.length}個の画像にalt属性が設定されていません。`,
      implementation: '<img src="image.jpg" alt="画像の説明文">'
    });
  }

  // 内部リンクの分析
  const internalLinks = analyzeInternalLinks(html, url);
  if (internalLinks.count < 5) {
    suggestions.push({
      category: 'リンク構造',
      priority: 'low',
      title: '内部リンクを増やしてください',
      description: `現在の内部リンク数: ${internalLinks.count}個。関連ページへの内部リンクを追加してください。`,
      implementation: '関連するページへのリンクを追加して、サイト内の回遊性を向上させてください。'
    });
  }

  return suggestions;
}

function analyzeInternalLinks(html: string, url: string): { count: number } {
  try {
    const domain = new URL(url).hostname;
    const links = html.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/gi) || [];
    const internalLinks = links.filter(link => {
      const hrefMatch = link.match(/href=["']([^"']+)["']/);
      if (!hrefMatch) return false;
      const href = hrefMatch[1];
      return href.startsWith('/') || href.includes(domain);
    });
    return { count: internalLinks.length };
  } catch {
    return { count: 0 };
  }
}