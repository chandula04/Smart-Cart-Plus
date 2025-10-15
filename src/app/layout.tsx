import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartCart Plus - Intelligent Shopping System',
  description: 'A modern shopping system with advanced algorithms for optimal navigation and smart inventory management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    SmartCart Plus
                  </h1>
                </Link>
                <nav className="flex space-x-8">
                  <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Home
                  </Link>
                  <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Products
                  </Link>
                  <Link href="/navigation" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Navigation
                  </Link>
                  <Link href="/staff" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                    Staff Dashboard
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <p className="text-center text-gray-500 text-sm">
                © 2025 SmartCart Plus - NIBM HDSE
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}