import { NextRequest, NextResponse } from 'next/server';
import { SiteAnalysis } from '@/types/site';
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

    // URL形式のバリデーション
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: '有効なURLを入力してください' },
        { status: 400 }
      );
    }

    // サイト分析の実行
    const analysis = await analyzeSite(url);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('サイト分析エラー:', error);
    return NextResponse.json(
      { error: '分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function analyzeSite(url: string): Promise<SiteAnalysis> {
  try {
    // サイトのHTMLを取得
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 基本的なメタデータの抽出
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    const keywordsMatch = html.match(/<meta[^>]*name=["\']keywords["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    
    // 見出しの抽出
    const headings = {
      h1: (html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || []).map(h => h.replace(/<[^>]*>/g, '')),
      h2: (html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || []).map(h => h.replace(/<[^>]*>/g, '')),
      h3: (html.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || []).map(h => h.replace(/<[^>]*>/g, ''))
    };

    // 画像の分析
    const images = (html.match(/<img[^>]*>/gi) || []);
    const imagesWithoutAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""') || img.includes("alt=''"));

    // 内部リンクと外部リンクの分析
    const links = (html.match(/<a[^>]*href=["\']([^"']+)["\'][^>]*>/gi) || []);
    const domain = new URL(url).hostname;
    const internalLinks = links.filter(link => {
      const hrefMatch = link.match(/href=["\']([^"']+)["\']/);
      if (!hrefMatch) return false;
      const href = hrefMatch[1];
      return href.startsWith('/') || href.includes(domain);
    });
    const externalLinks = links.filter(link => {
      const hrefMatch = link.match(/href=["\']([^"']+)["\']/);
      if (!hrefMatch) return false;
      const href = hrefMatch[1];
      return href.startsWith('http') && !href.includes(domain);
    });

    // テキストコンテンツの抽出（AI分析用）
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 5000); // 最初の5000文字に制限

    // Geminiを使用した高度な分析
    const geminiAnalysis = await analyzeWithGemini(url, textContent, headings, {
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descriptionMatch ? descriptionMatch[1].trim() : '',
      domain
    });

    const analysis: SiteAnalysis = {
      url,
      title: titleMatch ? titleMatch[1].trim() : 'タイトルなし',
      description: descriptionMatch ? descriptionMatch[1].trim() : '説明なし',
      keywords: keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [],
      headings,
      images: {
        total: images.length,
        withoutAlt: imagesWithoutAlt.length,
        altOptimizationRate: images.length > 0 ? Math.round(((images.length - imagesWithoutAlt.length) / images.length) * 100) : 0
      },
      links: {
        internal: internalLinks.length,
        external: externalLinks.length,
        total: links.length
      },
      content: {
        wordCount: html.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
        hasStructuredData: html.includes('application/ld+json'),
        hasOpenGraph: html.includes('og:'),
        hasTwitterCard: html.includes('twitter:')
      },
      aiAnalysis: geminiAnalysis,
      analyzedAt: new Date().toISOString()
    };

    return analysis;
  } catch (error) {
    throw new Error(`サイト分析に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function analyzeWithGemini(url: string, textContent: string, headings: any, metadata: any): Promise<any> {
  const prompt = `
あなたは専門的なWebサイト分析者です。以下のWebサイトを包括的に分析してください。

【分析対象サイト】
URL: ${url}
ドメイン: ${metadata.domain}

【基本情報】
タイトル: ${metadata.title}
説明: ${metadata.description}

【見出し構造】
H1: ${headings.h1.join(', ')}
H2: ${headings.h2.slice(0, 10).join(', ')}
H3: ${headings.h3.slice(0, 10).join(', ')}

【コンテンツ（最初の5000文字）】
${textContent}

以下の観点から詳細に分析し、JSON形式で回答してください：

{
  "siteType": "サイトの種類（企業サイト、ブログ、ECサイト等）",
  "mainTopics": ["メイントピック1", "メイントピック2", "メイントピック3"],
  "targetAudience": "想定されるターゲット層の詳細分析",
  "contentQuality": {
    "score": 85,
    "strengths": ["強み1", "強み2"],
    "weaknesses": ["弱み1", "弱み2"]
  },
  "businessModel": "推測されるビジネスモデル",
  "competitiveAdvantage": "競合優位性の分析",
  "contentStrategy": {
    "currentApproach": "現在のコンテンツアプローチ",
    "recommendedTopics": ["推奨トピック1", "推奨トピック2"],
    "contentGaps": ["不足しているコンテンツ領域1", "不足しているコンテンツ領域2"]
  },
  "seoInsights": {
    "keywordDensity": "主要キーワードの使用状況",
    "topicalRelevance": "トピック関連性の評価",
    "contentDepth": "コンテンツの深さ評価"
  },
  "userExperience": {
    "readability": "読みやすさの評価",
    "informationArchitecture": "情報構造の評価",
    "engagement": "エンゲージメント要素の分析"
  },
  "recommendations": [
    "具体的な改善提案1",
    "具体的な改善提案2",
    "具体的な改善提案3"
  ]
}

分析は具体的で実用的な内容にし、改善提案は実装可能で効果的なものを含めてください。
`;

  try {
    const response = await generateWithGemini(prompt);
    return JSON.parse(response.replace(/```json\n?|```/g, '').trim());
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return {
      siteType: '分析不可',
      mainTopics: [],
      targetAudience: 'AI分析に失敗しました',
      contentQuality: { score: 0, strengths: [], weaknesses: [] },
      businessModel: '不明',
      recommendations: ['AI分析サービスに再度アクセスしてください']
    };
  }
}