import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function generateWithGemini(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API呼び出しに失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeWithGemini(content: string, analysisType: string): Promise<string> {
  const prompt = `
あなたは専門的なWebサイト分析者です。以下の内容を${analysisType}の観点から詳細に分析してください。

分析対象:
${content}

以下の形式でJSON形式で回答してください：
- 分析結果は具体的で実用的な内容にする
- 改善提案は実装可能で効果的なものを含める
- 数値やデータがある場合は具体的に言及する

回答はJSONフォーマットで返してください。`;

  return await generateWithGemini(prompt);
}