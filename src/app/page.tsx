export default function HomePage() {
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">機能一覧</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">サイト分析</h3>
              <p className="text-gray-600">
                URLを入力してWebサイト全体の構造とコンテンツを分析
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">SEO改善提案</h3>
              <p className="text-gray-600">
                分析結果に基づいてSEO改善施策を提案
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">トピッククラスター生成</h3>
              <p className="text-gray-600">
                コンテンツ戦略に最適なトピッククラスターを自動生成
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">記事自動生成</h3>
              <p className="text-gray-600">
                2万文字以上の高品質な記事を自動生成
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}