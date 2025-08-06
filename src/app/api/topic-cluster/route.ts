import { NextRequest, NextResponse } from 'next/server';
import { GeneratedTopicCluster } from '@/types/cluster';

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'トピックが必要です' },
        { status: 400 }
      );
    }

    const cluster = await generateTopicCluster(topic);

    return NextResponse.json({ cluster });
  } catch (error) {
    console.error('トピッククラスター生成エラー:', error);
    return NextResponse.json(
      { error: 'トピッククラスター生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function generateTopicCluster(mainTopic: string): Promise<GeneratedTopicCluster> {
  // トピッククラスター理論に基づいたクラスター生成
  const pillarContent = generatePillarContent(mainTopic);
  const clusterTopics = generateClusterTopics(mainTopic);
  const keywords = generateKeywords(mainTopic);
  const contentStrategy = generateContentStrategy(mainTopic, clusterTopics);

  const cluster: GeneratedTopicCluster = {
    mainTopic,
    pillarContent,
    clusterTopics,
    keywords,
    contentStrategy,
    seoScore: calculateSEOScore(pillarContent, clusterTopics),
    createdAt: new Date().toISOString()
  };

  return cluster;
}

function generatePillarContent(mainTopic: string) {
  return {
    title: `${mainTopic}の完全ガイド`,
    description: `${mainTopic}に関する包括的な情報をまとめた詳細ガイド。初心者から上級者まで対応した完全版コンテンツです。`,
    targetKeywords: [mainTopic, `${mainTopic} とは`, `${mainTopic} 方法`, `${mainTopic} 完全ガイド`],
    estimatedWordCount: 15000,
    contentOutline: [
      `${mainTopic}とは？基本概念の解説`,
      `${mainTopic}の重要性と必要性`,
      `${mainTopic}を始める前に知っておくべきこと`,
      `${mainTopic}の具体的な実践方法`,
      `${mainTopic}でよくある間違いと対処法`,
      `${mainTopic}の最新トレンドと将来性`,
      `${mainTopic}に関するよくある質問`,
      `まとめと次のステップ`
    ]
  };
}

function generateClusterTopics(mainTopic: string) {
  const topicCategories = categorizeMainTopic(mainTopic);
  const clusterTopics = [];

  // 基本カテゴリのクラスター記事
  clusterTopics.push({
    title: `${mainTopic}の基本概念`,
    keywords: [`${mainTopic} 基本`, `${mainTopic} 初心者`, `${mainTopic} 入門`],
    contentType: '解説記事',
    estimatedWordCount: 3000,
    difficulty: '初級',
    searchVolume: 'Medium'
  });

  clusterTopics.push({
    title: `${mainTopic}のメリット・デメリット`,
    keywords: [`${mainTopic} メリット`, `${mainTopic} デメリット`, `${mainTopic} 利点`],
    contentType: '比較記事',
    estimatedWordCount: 2500,
    difficulty: '初級',
    searchVolume: 'Medium'
  });

  // 実践カテゴリのクラスター記事
  clusterTopics.push({
    title: `${mainTopic}の始め方ステップバイステップ`,
    keywords: [`${mainTopic} 始め方`, `${mainTopic} やり方`, `${mainTopic} 手順`],
    contentType: 'ハウツー記事',
    estimatedWordCount: 4000,
    difficulty: '中級',
    searchVolume: 'High'
  });

  clusterTopics.push({
    title: `${mainTopic}でよくある失敗と対策`,
    keywords: [`${mainTopic} 失敗`, `${mainTopic} 間違い`, `${mainTopic} 注意点`],
    contentType: '対策記事',
    estimatedWordCount: 3500,
    difficulty: '中級',
    searchVolume: 'Medium'
  });

  // 応用カテゴリのクラスター記事
  clusterTopics.push({
    title: `${mainTopic}の上級テクニック`,
    keywords: [`${mainTopic} 上級`, `${mainTopic} テクニック`, `${mainTopic} 応用`],
    contentType: '上級ガイド',
    estimatedWordCount: 5000,
    difficulty: '上級',
    searchVolume: 'Low'
  });

  clusterTopics.push({
    title: `${mainTopic}の最新トレンド2024`,
    keywords: [`${mainTopic} トレンド`, `${mainTopic} 2024`, `${mainTopic} 最新`],
    contentType: 'トレンド記事',
    estimatedWordCount: 2800,
    difficulty: '中級',
    searchVolume: 'Medium'
  });

  // 比較カテゴリのクラスター記事
  clusterTopics.push({
    title: `${mainTopic}ツール・サービス比較`,
    keywords: [`${mainTopic} 比較`, `${mainTopic} ツール`, `${mainTopic} おすすめ`],
    contentType: '比較記事',
    estimatedWordCount: 6000,
    difficulty: '中級',
    searchVolume: 'High'
  });

  // FAQ・疑問解決系
  clusterTopics.push({
    title: `${mainTopic}でよくある質問30選`,
    keywords: [`${mainTopic} FAQ`, `${mainTopic} 質問`, `${mainTopic} 疑問`],
    contentType: 'FAQ記事',
    estimatedWordCount: 4500,
    difficulty: '初級',
    searchVolume: 'Medium'
  });

  return clusterTopics;
}

function generateKeywords(mainTopic: string) {
  return {
    primary: [
      mainTopic,
      `${mainTopic} とは`,
      `${mainTopic} 方法`,
      `${mainTopic} 始め方`
    ],
    secondary: [
      `${mainTopic} 初心者`,
      `${mainTopic} 基本`,
      `${mainTopic} 手順`,
      `${mainTopic} やり方`,
      `${mainTopic} コツ`,
      `${mainTopic} ポイント`
    ],
    longtail: [
      `${mainTopic} 初心者 始め方`,
      `${mainTopic} 効果的な方法`,
      `${mainTopic} 失敗しない コツ`,
      `${mainTopic} おすすめ ツール`,
      `${mainTopic} メリット デメリット`,
      `${mainTopic} 2024 最新 トレンド`
    ],
    related: generateRelatedKeywords(mainTopic)
  };
}

function generateRelatedKeywords(mainTopic: string): string[] {
  const commonRelatedTerms = [
    '効果', '方法', '手順', 'コツ', 'ポイント', 'テクニック',
    '初心者', '上級者', '始め方', 'やり方', '使い方',
    'メリット', 'デメリット', '比較', 'おすすめ',
    '最新', 'トレンド', '2024', '将来性'
  ];

  return commonRelatedTerms.map(term => `${mainTopic} ${term}`);
}

function generateContentStrategy(mainTopic: string, clusterTopics: any[]) {
  return {
    totalArticles: clusterTopics.length + 1, // +1 for pillar content
    estimatedTimeframe: '3-6ヶ月',
    publicationSchedule: {
      pillarContent: '1ヶ月目',
      clusterArticles: '2-6ヶ月目（週1-2本ペース）'
    },
    interlinkingStrategy: [
      'ピラーコンテンツから各クラスター記事への内部リンク設置',
      'クラスター記事からピラーコンテンツへの誘導リンク',
      '関連性の高いクラスター記事同士の相互リンク',
      'トピッククラスター専用のランディングページ作成'
    ],
    distributionChannels: [
      'オーガニック検索',
      'ソーシャルメディア',
      'メルマガ配信',
      '他サイトでの言及・被リンク獲得'
    ],
    measurementKPIs: [
      '対象キーワードでの検索順位向上',
      'クラスター全体でのオーガニックトラフィック増加',
      '滞在時間とページ/セッション数の向上',
      'コンバージョン率の改善'
    ]
  };
}

function calculateSEOScore(pillarContent: any, clusterTopics: any[]): number {
  let score = 0;

  // ピラーコンテンツの評価
  score += pillarContent.estimatedWordCount > 10000 ? 20 : 10;
  score += pillarContent.targetKeywords.length >= 4 ? 15 : 10;

  // クラスター記事の評価
  const avgWordCount = clusterTopics.reduce((sum, topic) => sum + topic.estimatedWordCount, 0) / clusterTopics.length;
  score += avgWordCount > 3000 ? 20 : 15;

  // 多様性の評価
  const contentTypes = new Set(clusterTopics.map(topic => topic.contentType));
  score += contentTypes.size >= 4 ? 15 : 10;

  // 難易度バランスの評価
  const difficulties = clusterTopics.map(topic => topic.difficulty);
  const hasAllLevels = difficulties.includes('初級') && difficulties.includes('中級') && difficulties.includes('上級');
  score += hasAllLevels ? 15 : 10;

  // ボリュームの評価
  score += clusterTopics.length >= 8 ? 15 : 10;

  return Math.min(score, 100);
}

function categorizeMainTopic(mainTopic: string): string[] {
  return ['基本', '実践', '応用', '比較', 'トラブルシューティング'];
}