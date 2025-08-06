import { NextRequest, NextResponse } from 'next/server';
import { SEOSuggestion } from '@/types/seo';

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

    // メタディスクリプション
    const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    if (!descriptionMatch) {
      suggestions.push({
        category: 'メタタグ',
        priority: 'high',
        title: 'メタディスクリプションが設定されていません',
        description: 'ページの内容を要約したメタディスクリプションを追加してください。',
        implementation: '<meta name="description" content="ページの内容を120-160文字で要約">'
      });
    } else {
      const description = descriptionMatch[1];
      if (description.length < 120) {
        suggestions.push({
          category: 'メタタグ',
          priority: 'medium',
          title: 'メタディスクリプションが短すぎます',
          description: `現在の長さ: ${description.length}文字。120-160文字程度が推奨されます。`,
          implementation: 'より詳細な説明を追加してください。'
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

    // 見出し構造の分析
    const headingStructure = analyzeHeadingStructure(html);
    if (!headingStructure.isWellStructured) {
      suggestions.push({
        category: 'コンテンツ構造',
        priority: 'medium',
        title: '見出し構造を改善してください',
        description: '見出しタグ（H1-H6）を階層的に使用してください。',
        implementation: 'H1→H2→H3の順序で見出しを構造化してください。'
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

    // ページ速度の基本チェック
    const performanceIssues = analyzePerformanceIssues(html);
    suggestions.push(...performanceIssues);

    return suggestions;
  } catch (error) {
    throw new Error(`SEO分析に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function analyzeHeadingStructure(html: string): { isWellStructured: boolean } {
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;

  return {
    isWellStructured: h1Count === 1 && (h2Count > 0 || h3Count === 0)
  };
}

function analyzeInternalLinks(html: string, url: string): { count: number } {
  const domain = new URL(url).hostname;
  const links = html.match(/<a[^>]*href=["\']([^"']+)["\'][^>]*>/gi) || [];
  const internalLinks = links.filter(link => {
    const hrefMatch = link.match(/href=["\']([^"']+)["\']/);
    if (!hrefMatch) return false;
    const href = hrefMatch[1];
    return href.startsWith('/') || href.includes(domain);
  });

  return { count: internalLinks.length };
}

function analyzePerformanceIssues(html: string): SEOSuggestion[] {
  const suggestions: SEOSuggestion[] = [];

  // 大きなスクリプトファイルのチェック
  const scriptTags = html.match(/<script[^>]*src=[^>]*>/gi) || [];
  if (scriptTags.length > 10) {
    suggestions.push({
      category: 'パフォーマンス',
      priority: 'medium',
      title: 'JavaScriptファイルが多すぎます',
      description: `${scriptTags.length}個のスクリプトファイルが読み込まれています。`,
      implementation: 'スクリプトファイルを統合または遅延読み込みを検討してください。'
    });
  }

  // CSSファイルのチェック
  const cssLinks = html.match(/<link[^>]*rel=["\']stylesheet["\'][^>]*>/gi) || [];
  if (cssLinks.length > 5) {
    suggestions.push({
      category: 'パフォーマンス',
      priority: 'low',
      title: 'CSSファイルの最適化',
      description: `${cssLinks.length}個のCSSファイルが読み込まれています。`,
      implementation: 'CSSファイルを統合して読み込み時間を短縮してください。'
    });
  }

  return suggestions;
}