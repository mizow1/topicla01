import { NextRequest, NextResponse } from 'next/server';
import { SiteAnalysis } from '@/types/site';

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
      analyzedAt: new Date().toISOString()
    };

    return analysis;
  } catch (error) {
    throw new Error(`サイト分析に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}