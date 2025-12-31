import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Belarus Tax Calculator - Calculate LLC Taxes Automatically',
  description: 'Professional tax calculation platform for Belarus LLC owners',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

// --- Placeholder Components for Structure ---
// In a real application, these would be in their own files (e.g., components/Navbar.tsx)

const Navbar = () => (
  <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800 shadow-md shadow-black/10">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <a href="/" className="text-white font-bold text-xl transition-colors hover:text-cyan-400">
            TaxCalc<span className="text-cyan-400">.by</span>
          </a>
        </div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-4">
            <a href="/dashboard" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all">Dashboard</a>
            <a href="/reports" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all">Reports</a>
            <a href="/settings" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all">Settings</a>
          </div>
        </div>
      </div>
    </nav>
  </header>
);

const Footer = () => (
  <footer className="bg-transparent mt-auto">
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-500">
      <p>&copy; {new Date().getFullYear()} Belarus Tax Calculator. All rights reserved.</p>
    </div>
  </footer>
);

// --- Root Layout ---

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-100 antialiased selection:bg-cyan-500 selection:text-cyan-900`}>
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-black">
          <AuthProvider>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
