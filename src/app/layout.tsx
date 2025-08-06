import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '記事作成支援サービス',
  description: 'SEOトピッククラスター理論に基づいた記事作成を支援するWebアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}