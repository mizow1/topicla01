import { NextRequest, NextResponse } from 'next/server';
import { Article } from '@/types/article';

export async function POST(request: NextRequest) {
  try {
    const { topic, targetWordCount = 20000 } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'トピックが必要です' },
        { status: 400 }
      );
    }

    const article = await generateArticle(topic, targetWordCount);

    return NextResponse.json({ article });
  } catch (error) {
    console.error('記事生成エラー:', error);
    return NextResponse.json(
      { error: '記事生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function generateArticle(topic: string, targetWordCount: number): Promise<Article> {
  // 記事の構造を設計
  const articleStructure = designArticleStructure(topic, targetWordCount);
  
  // 実際のコンテンツ生成
  const content = await generateArticleContent(topic, articleStructure);
  
  const article: Article = {
    title: `${topic}の完全ガイド：初心者から上級者まで対応した徹底解説`,
    topic,
    content,
    wordCount: content.split(/\s+/).length,
    structure: articleStructure,
    seoData: {
      metaTitle: `${topic}の完全ガイド | 初心者から上級者まで`,
      metaDescription: `${topic}について知りたいすべてがここに。基本概念から実践的な活用方法まで、専門家が徹底解説します。初心者でも安心して学べる完全ガイドです。`,
      targetKeywords: [
        topic,
        `${topic} とは`,
        `${topic} 方法`,
        `${topic} 始め方`,
        `${topic} 完全ガイド`
      ],
      headings: articleStructure.sections.map(section => ({
        level: section.level,
        text: section.title,
        keywords: section.targetKeywords
      }))
    },
    readingTime: Math.ceil(content.split(/\s+/).length / 200),
    publishedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  return article;
}

function designArticleStructure(topic: string, targetWordCount: number) {
  const baseWordCountPerSection = Math.floor(targetWordCount / 12);
  
  return {
    totalWordCount: targetWordCount,
    sections: [
      {
        id: 'introduction',
        title: `${topic}とは？基本概念から理解する`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 1.2,
        targetKeywords: [`${topic} とは`, `${topic} 基本`, `${topic} 概念`],
        subsections: [
          `${topic}の定義と重要性`,
          `${topic}が注目される理由`,
          `${topic}の基本的な仕組み`
        ]
      },
      {
        id: 'benefits-importance',
        title: `${topic}のメリットと重要性`,
        level: 2,
        targetWordCount: baseWordCountPerSection,
        targetKeywords: [`${topic} メリット`, `${topic} 効果`, `${topic} 重要性`],
        subsections: [
          `${topic}による具体的なメリット`,
          `ビジネスへの影響`,
          `個人レベルでの恩恵`
        ]
      },
      {
        id: 'getting-started',
        title: `${topic}を始める前に知っておくべき基礎知識`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 1.3,
        targetKeywords: [`${topic} 基礎`, `${topic} 準備`, `${topic} 始める前`],
        subsections: [
          '必要な知識・スキル',
          '準備すべきツールや環境',
          '初心者が陥りがちな誤解'
        ]
      },
      {
        id: 'step-by-step-guide',
        title: `${topic}の始め方：ステップバイステップガイド`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 1.5,
        targetKeywords: [`${topic} 始め方`, `${topic} やり方`, `${topic} 手順`],
        subsections: [
          'ステップ1: 基本設定と準備',
          'ステップ2: 初期設定と基本操作',
          'ステップ3: 実践的な活用方法',
          'ステップ4: 効果測定と改善'
        ]
      },
      {
        id: 'best-practices',
        title: `${topic}のベストプラクティス`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 1.2,
        targetKeywords: [`${topic} コツ`, `${topic} ポイント`, `${topic} 成功`],
        subsections: [
          '効果を最大化するコツ',
          '時間を節約する方法',
          '品質を向上させるテクニック'
        ]
      },
      {
        id: 'common-mistakes',
        title: `${topic}でよくある間違いと対処法`,
        level: 2,
        targetWordCount: baseWordCountPerSection,
        targetKeywords: [`${topic} 失敗`, `${topic} 間違い`, `${topic} 対処法`],
        subsections: [
          '初心者がよく犯す間違い',
          '中級者が陥りがちな罠',
          '問題が発生した時の対処法'
        ]
      },
      {
        id: 'tools-resources',
        title: `${topic}に役立つツールとリソース`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 1.1,
        targetKeywords: [`${topic} ツール`, `${topic} おすすめ`, `${topic} リソース`],
        subsections: [
          '必須ツールの紹介',
          '無料で使えるリソース',
          '有料ツールの比較検討'
        ]
      },
      {
        id: 'advanced-techniques',
        title: `${topic}の上級テクニック`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 1.3,
        targetKeywords: [`${topic} 上級`, `${topic} テクニック`, `${topic} 応用`],
        subsections: [
          '上級者向けの活用方法',
          '応用テクニックの実践',
          'プロが使う秘訣'
        ]
      },
      {
        id: 'case-studies',
        title: `${topic}の成功事例と実践例`,
        level: 2,
        targetWordCount: baseWordCountPerSection,
        targetKeywords: [`${topic} 事例`, `${topic} 成功`, `${topic} 実例`],
        subsections: [
          '企業での成功事例',
          '個人レベルでの活用例',
          '業界別の実践事例'
        ]
      },
      {
        id: 'trends-future',
        title: `${topic}の最新トレンドと将来性`,
        level: 2,
        targetWordCount: baseWordCountPerSection,
        targetKeywords: [`${topic} トレンド`, `${topic} 将来性`, `${topic} 最新`],
        subsections: [
          '2024年の最新動向',
          '将来の発展予測',
          '業界への影響と変化'
        ]
      },
      {
        id: 'faq',
        title: `${topic}に関するよくある質問`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 0.8,
        targetKeywords: [`${topic} FAQ`, `${topic} 質問`, `${topic} 疑問`],
        subsections: [
          '基本的な質問と回答',
          '技術的な質問と解決策',
          'トラブルシューティング'
        ]
      },
      {
        id: 'conclusion',
        title: `まとめ：${topic}を効果的に活用するために`,
        level: 2,
        targetWordCount: baseWordCountPerSection * 0.7,
        targetKeywords: [`${topic} まとめ`, `${topic} 活用`, `${topic} 効果的`],
        subsections: [
          '重要ポイントの振り返り',
          '次のアクションステップ',
          '継続的な改善のための提案'
        ]
      }
    ]
  };
}

async function generateArticleContent(topic: string, structure: any): Promise<string> {
  let content = `# ${topic}の完全ガイド：初心者から上級者まで対応した徹底解説\n\n`;
  
  // 導入部分
  content += `${topic}について包括的に学びたい方のための完全ガイドです。基本概念から実践的な活用方法まで、段階的に詳しく解説していきます。\n\n`;
  
  content += `この記事では、${topic}の基本的な理解から始まり、実際の活用方法、よくある間違いとその対処法、さらには上級者向けのテクニックまで幅広くカバーしています。\n\n`;

  content += `## 目次\n\n`;
  structure.sections.forEach((section: any, index: number) => {
    content += `${index + 1}. [${section.title}](#${section.id})\n`;
    section.subsections.forEach((subsection: string) => {
      content += `   - ${subsection}\n`;
    });
  });
  content += `\n---\n\n`;

  // 各セクションのコンテンツ生成
  for (const section of structure.sections) {
    content += `## ${section.title}\n\n`;
    
    // セクション別のコンテンツ生成
    content += generateSectionContent(topic, section);
    
    content += `\n---\n\n`;
  }

  return content;
}

function generateSectionContent(topic: string, section: any): string {
  const sectionContent = [];

  switch (section.id) {
    case 'introduction':
      sectionContent.push(
        `${topic}は、現代のビジネス環境において重要な概念として注目を集めています。`,
        `\n### ${topic}の定義と重要性\n`,
        `${topic}とは、簡単に説明すると...（ここで具体的な定義を展開）`,
        `具体的には以下のような特徴があります：`,
        `- 特徴1: 詳細な説明`,
        `- 特徴2: 詳細な説明`,
        `- 特徴3: 詳細な説明`,
        `\n### ${topic}が注目される理由\n`,
        `近年、${topic}が注目される背景には複数の要因があります。`,
        `第一に、技術の進歩により...`,
        `第二に、市場環境の変化により...`,
        `\n### ${topic}の基本的な仕組み\n`,
        `${topic}の基本的な仕組みを理解するために、以下の要素を考えてみましょう。`
      );
      break;

    case 'benefits-importance':
      sectionContent.push(
        `${topic}を導入することで得られるメリットは多岐にわたります。`,
        `\n### ${topic}による具体的なメリット\n`,
        `**1. 効率性の向上**`,
        `${topic}を活用することで、従来の作業時間を大幅に短縮できます。`,
        `**2. 品質の向上**`,
        `一貫性のある高品質な結果を得ることができます。`,
        `**3. コスト削減**`,
        `長期的な視点で見ると、大幅なコスト削減効果が期待できます。`,
        `\n### ビジネスへの影響\n`,
        `企業レベルでの${topic}導入は、競争優位性の確保に直結します。`,
        `\n### 個人レベルでの恩恵\n`,
        `個人が${topic}を習得することで得られる利益について説明します。`
      );
      break;

    case 'getting-started':
      sectionContent.push(
        `${topic}を始める前に、基礎となる知識を身につけることが重要です。`,
        `\n### 必要な知識・スキル\n`,
        `${topic}を効果的に活用するためには、以下の基礎知識が必要です：`,
        `- 基礎知識1: 詳細説明`,
        `- 基礎知識2: 詳細説明`,
        `- 基礎知識3: 詳細説明`,
        `\n### 準備すべきツールや環境\n`,
        `実際に${topic}を始めるために必要なツールや環境設定について説明します。`,
        `\n### 初心者が陥りがちな誤解\n`,
        `${topic}について初心者がよく持つ誤解を解説し、正しい理解を促進します。`
      );
      break;

    case 'step-by-step-guide':
      sectionContent.push(
        `ここでは、${topic}を実際に始めるための具体的なステップを詳しく解説します。`,
        `\n### ステップ1: 基本設定と準備\n`,
        `最初に行うべき基本的な設定について説明します。`,
        `1. 初期設定の手順`,
        `2. 環境構築の方法`,
        `3. 必要なアカウントの作成`,
        `\n### ステップ2: 初期設定と基本操作\n`,
        `基本的な操作方法を習得しましょう。`,
        `\n### ステップ3: 実践的な活用方法\n`,
        `実際の業務やプロジェクトでの活用方法を学びます。`,
        `\n### ステップ4: 効果測定と改善\n`,
        `実施した結果の測定方法と継続的改善のアプローチを説明します。`
      );
      break;

    case 'best-practices':
      sectionContent.push(
        `${topic}を最大限に活用するためのベストプラクティスをご紹介します。`,
        `\n### 効果を最大化するコツ\n`,
        `以下のコツを実践することで、${topic}の効果を最大化できます：`,
        `- コツ1: 具体的な実践方法`,
        `- コツ2: 具体的な実践方法`,
        `- コツ3: 具体的な実践方法`,
        `\n### 時間を節約する方法\n`,
        `効率的に作業を進めるための時間節約テクニックを紹介します。`,
        `\n### 品質を向上させるテクニック\n`,
        `一貫して高品質な結果を出すためのテクニックを解説します。`
      );
      break;

    case 'common-mistakes':
      sectionContent.push(
        `${topic}を実践する際によくある間違いと、その対処法について説明します。`,
        `\n### 初心者がよく犯す間違い\n`,
        `**間違い1: 説明**`,
        `対処法: 具体的な解決策`,
        `**間違い2: 説明**`,
        `対処法: 具体的な解決策`,
        `\n### 中級者が陥りがちな罠\n`,
        `ある程度経験を積んだ人でも陥りがちな問題について解説します。`,
        `\n### 問題が発生した時の対処法\n`,
        `トラブルが発生した際の系統的な対処アプローチを説明します。`
      );
      break;

    case 'tools-resources':
      sectionContent.push(
        `${topic}を効果的に実践するために役立つツールやリソースを紹介します。`,
        `\n### 必須ツールの紹介\n`,
        `**ツール1**`,
        `- 特徴: 主な機能と特徴`,
        `- 利用方法: 基本的な使い方`,
        `- 価格: 料金体系`,
        `\n### 無料で使えるリソース\n`,
        `コストをかけずに活用できるリソースを紹介します。`,
        `\n### 有料ツールの比較検討\n`,
        `投資する価値のある有料ツールの比較と選択基準を説明します。`
      );
      break;

    case 'advanced-techniques':
      sectionContent.push(
        `${topic}をマスターするための上級テクニックを解説します。`,
        `\n### 上級者向けの活用方法\n`,
        `基本をマスターした方向けの高度な活用方法を紹介します。`,
        `\n### 応用テクニックの実践\n`,
        `実際のプロジェクトで使える応用テクニックを詳しく説明します。`,
        `\n### プロが使う秘訣\n`,
        `プロフェッショナルが実践している秘訣やノウハウを公開します。`
      );
      break;

    case 'case-studies':
      sectionContent.push(
        `${topic}の実際の成功事例を通じて、具体的な活用方法を学びましょう。`,
        `\n### 企業での成功事例\n`,
        `**事例1: 企業A**`,
        `- 課題: 抱えていた問題`,
        `- 解決策: ${topic}を使った解決アプローチ`,
        `- 結果: 得られた成果`,
        `\n### 個人レベルでの活用例\n`,
        `個人が${topic}を活用して成果を上げた事例を紹介します。`,
        `\n### 業界別の実践事例\n`,
        `異なる業界での${topic}活用例を比較分析します。`
      );
      break;

    case 'trends-future':
      sectionContent.push(
        `${topic}の最新トレンドと将来の展望について解説します。`,
        `\n### 2024年の最新動向\n`,
        `現在注目されている${topic}の最新動向を詳しく分析します。`,
        `\n### 将来の発展予測\n`,
        `専門家の見解と市場分析に基づく将来予測を説明します。`,
        `\n### 業界への影響と変化\n`,
        `${topic}が各業界に与える影響と変化の方向性を考察します。`
      );
      break;

    case 'faq':
      sectionContent.push(
        `${topic}に関してよく寄せられる質問とその回答をまとめました。`,
        `\n### 基本的な質問と回答\n`,
        `**Q1: ${topic}を始めるのに特別なスキルは必要ですか？**`,
        `A1: 基本的な知識があれば始められますが、以下のスキルがあると有利です...`,
        `**Q2: どのくらいの期間で成果が出ますか？**`,
        `A2: 個人差はありますが、一般的には...`,
        `\n### 技術的な質問と解決策\n`,
        `より技術的な質問に対する詳細な回答を提供します。`,
        `\n### トラブルシューティング\n`,
        `よくある問題と、その解決方法をまとめています。`
      );
      break;

    case 'conclusion':
      sectionContent.push(
        `この記事では、${topic}について包括的に解説してきました。`,
        `\n### 重要ポイントの振り返り\n`,
        `記事全体で説明した重要なポイントを振り返ります：`,
        `1. ${topic}の基本概念と重要性`,
        `2. 実践的な始め方とステップ`,
        `3. ベストプラクティスと避けるべき間違い`,
        `4. 上級テクニックと応用方法`,
        `\n### 次のアクションステップ\n`,
        `この記事を読み終えた後に取るべき具体的なアクションを提案します。`,
        `\n### 継続的な改善のための提案\n`,
        `${topic}のスキルを継続的に向上させるためのアドバイスを提供します。`
      );
      break;

    default:
      sectionContent.push(`${section.title}に関する詳細な内容をここに展開します。`);
  }

  // 目標文字数に応じてコンテンツを調整
  let generatedContent = sectionContent.join('\n\n');
  const currentWordCount = generatedContent.split(/\s+/).length;
  
  if (currentWordCount < section.targetWordCount * 0.8) {
    // 文字数が不足している場合、追加のコンテンツを生成
    generatedContent += `\n\n### 詳細解説\n\n`;
    generatedContent += `${topic}の${section.title.toLowerCase()}について、さらに詳しく解説します。実際の活用シーンを想定した具体例を交えながら、理解を深めていきましょう。\n\n`;
    generatedContent += `この分野における最新の研究結果や業界動向も含めて、包括的な情報を提供いたします。`;
  }

  return generatedContent;
}