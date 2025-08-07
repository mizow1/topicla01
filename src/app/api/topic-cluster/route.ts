import { NextRequest, NextResponse } from 'next/server';
import { GeneratedTopicCluster } from '@/types/cluster';
import { generateWithGemini } from '@/lib/gemini';

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
  // Geminiを使用した高度なトピッククラスター生成
  const geminiCluster = await generateClusterWithGemini(mainTopic);
  
  // 従来のテンプレートベース生成も併用してフォールバック
  const fallbackCluster = generateFallbackCluster(mainTopic);
  
  // Gemini生成に成功した場合はそれを使用、失敗した場合はフォールバックを使用
  const cluster: GeneratedTopicCluster = {
    ...geminiCluster,
    createdAt: new Date().toISOString()
  };

  return cluster;
}

async function generateClusterWithGemini(mainTopic: string): Promise<Omit<GeneratedTopicCluster, 'createdAt'>> {
  const prompt = `
あなたは専門的なSEOコンテンツ戦略家です。以下のメイントピックに対して、効果的なトピッククラスター戦略を作成してください。

【メイントピック】
${mainTopic}

以下の形式でトピッククラスターを作成してください（JSON形式）：

{
  "mainTopic": "${mainTopic}",
  "pillarContent": {
    "title": "包括的で権威性の高いピラーコンテンツのタイトル",
    "description": "ピラーコンテンツの詳細な説明（SEO価値と読者への価値を含む）",
    "targetKeywords": ["メイン関連キーワード1", "メイン関連キーワード2", "メイン関連キーワード3", "メイン関連キーワード4"],
    "estimatedWordCount": 15000,
    "contentOutline": [
      "セクション1タイトル",
      "セクション2タイトル",
      "セクション3タイトル",
      "セクション4タイトル",
      "セクション5タイトル",
      "セクション6タイトル",
      "セクション7タイトル",
      "セクション8タイトル"
    ]
  },
  "clusterTopics": [
    {
      "title": "関連記事タイトル1",
      "keywords": ["関連キーワード1", "関連キーワード2", "関連キーワード3"],
      "contentType": "記事タイプ（ハウツー、比較、解説等）",
      "estimatedWordCount": 3000,
      "difficulty": "初級|中級|上級",
      "searchVolume": "High|Medium|Low"
    }
  ],
  "keywords": {
    "primary": ["プライマリキーワード1", "プライマリキーワード2", "プライマリキーワード3"],
    "secondary": ["セカンダリキーワード1", "セカンダリキーワード2", "セカンダリキーワード3", "セカンダリキーワード4"],
    "longtail": ["ロングテールキーワード1", "ロングテールキーワード2", "ロングテールキーワード3", "ロングテールキーワード4"],
    "related": ["関連キーワード1", "関連キーワード2", "関連キーワード3", "関連キーワード4"]
  },
  "contentStrategy": {
    "totalArticles": 10,
    "estimatedTimeframe": "実装予定期間",
    "publicationSchedule": {
      "pillarContent": "公開タイミング",
      "clusterArticles": "クラスター記事の公開スケジュール"
    },
    "interlinkingStrategy": [
      "内部リンク戦略1",
      "内部リンク戦略2",
      "内部リンク戦略3"
    ],
    "distributionChannels": [
      "配信チャネル1",
      "配信チャネル2",
      "配信チャネル3"
    ],
    "measurementKPIs": [
      "測定指標1",
      "測定指標2",
      "測定指標3"
    ]
  },
  "seoScore": 95
}

重要な要件：
1. クラスター記事は最低8本、理想的には12-15本作成してください
2. 各記事は具体的で検索意図に合った内容にしてください
3. キーワードは実際に検索されそうな自然な表現を使用してください
4. 難易度とボリュームは現実的な数値にしてください
5. SEOスコアは0-100で、戦略の質を反映してください
6. 各クラスター記事はピラーコンテンツと明確な関連性を持たせてください
7. 検索意図（情報収集、比較検討、購買意図等）を考慮してください

ターゲットオーディエンスを明確にし、彼らの課題解決に焦点を当ててください。
`;

  try {
    const response = await generateWithGemini(prompt);
    const cluster = JSON.parse(response.replace(/```json\n?|```/g, '').trim());
    return cluster;
  } catch (error) {
    console.error('Gemini cluster generation error:', error);
    return generateFallbackCluster(mainTopic);
  }
}

function generateFallbackCluster(mainTopic: string): Omit<GeneratedTopicCluster, 'createdAt'> {
  const pillarContent = {
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

  const clusterTopics = [
    {
      title: `${mainTopic}の基本概念`,
      keywords: [`${mainTopic} 基本`, `${mainTopic} 初心者`, `${mainTopic} 入門`],
      contentType: '解説記事',
      estimatedWordCount: 3000,
      difficulty: '初級',
      searchVolume: 'Medium'
    },
    {
      title: `${mainTopic}のメリット・デメリット`,
      keywords: [`${mainTopic} メリット`, `${mainTopic} デメリット`, `${mainTopic} 利点`],
      contentType: '比較記事',
      estimatedWordCount: 2500,
      difficulty: '初級',
      searchVolume: 'Medium'
    },
    {
      title: `${mainTopic}の始め方ステップバイステップ`,
      keywords: [`${mainTopic} 始め方`, `${mainTopic} やり方`, `${mainTopic} 手順`],
      contentType: 'ハウツー記事',
      estimatedWordCount: 4000,
      difficulty: '中級',
      searchVolume: 'High'
    },
    {
      title: `${mainTopic}でよくある失敗と対策`,
      keywords: [`${mainTopic} 失敗`, `${mainTopic} 間違い`, `${mainTopic} 注意点`],
      contentType: '対策記事',
      estimatedWordCount: 3500,
      difficulty: '中級',
      searchVolume: 'Medium'
    },
    {
      title: `${mainTopic}の上級テクニック`,
      keywords: [`${mainTopic} 上級`, `${mainTopic} テクニック`, `${mainTopic} 応用`],
      contentType: '上級ガイド',
      estimatedWordCount: 5000,
      difficulty: '上級',
      searchVolume: 'Low'
    },
    {
      title: `${mainTopic}の最新トレンド2024`,
      keywords: [`${mainTopic} トレンド`, `${mainTopic} 2024`, `${mainTopic} 最新`],
      contentType: 'トレンド記事',
      estimatedWordCount: 2800,
      difficulty: '中級',
      searchVolume: 'Medium'
    },
    {
      title: `${mainTopic}ツール・サービス比較`,
      keywords: [`${mainTopic} 比較`, `${mainTopic} ツール`, `${mainTopic} おすすめ`],
      contentType: '比較記事',
      estimatedWordCount: 6000,
      difficulty: '中級',
      searchVolume: 'High'
    },
    {
      title: `${mainTopic}でよくある質問30選`,
      keywords: [`${mainTopic} FAQ`, `${mainTopic} 質問`, `${mainTopic} 疑問`],
      contentType: 'FAQ記事',
      estimatedWordCount: 4500,
      difficulty: '初級',
      searchVolume: 'Medium'
    }
  ];

  const keywords = {
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
    related: [
      '効果', '方法', '手順', 'コツ', 'ポイント', 'テクニック',
      '初心者', '上級者', '始め方', 'やり方', '使い方',
      'メリット', 'デメリット', '比較', 'おすすめ',
      '最新', 'トレンド', '2024', '将来性'
    ].map(term => `${mainTopic} ${term}`)
  };

  const contentStrategy = {
    totalArticles: clusterTopics.length + 1,
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

  const seoScore = calculateSEOScore(pillarContent, clusterTopics);

  return {
    mainTopic,
    pillarContent,
    clusterTopics,
    keywords,
    contentStrategy,
    seoScore
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