'use client';

import { Inter } from 'next/font/google'
// @ts-ignore
import './globals.css'
import Link from 'next/link'
import { CartProvider, useCart } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

function CartButton() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  
  return (
    <Link href="/cart" className="relative">
      <div className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
        <span className="text-2xl">🛒</span>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
  <AuthProvider>
  <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link href="/" className="flex items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      SmartCart Plus
                    </h1>
                  </Link>
                  {/* Desktop nav */}
                  <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
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
                    <CartButton />
                  </nav>
                  {/* Mobile hamburger */}
                  <button
                    aria-label="Open menu"
                    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setMobileOpen((v) => !v)}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Mobile menu panel */}
              {mobileOpen && (
                <div className="md:hidden border-t bg-white">
                  <div className="px-4 py-3 space-y-1">
                    <Link onClick={() => setMobileOpen(false)} href="/" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Home</Link>
                    <Link onClick={() => setMobileOpen(false)} href="/products" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Products</Link>
                    <Link onClick={() => setMobileOpen(false)} href="/navigation" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Navigation</Link>
                    <Link onClick={() => setMobileOpen(false)} href="/staff" className="block py-2 text-gray-700 hover:text-blue-600 font-medium">Staff Dashboard</Link>
                    <div className="py-2"><CartButton /></div>
                  </div>
                </div>
              )}
            </header>
          
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
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
  </CartProvider>
  </AuthProvider>
      </body>
    </html>
  )
}