'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, FileText, Calendar, Shield, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Belarus Tax Calculator</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Calculate Your LLC Taxes Automatically
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Professional tax calculation platform for Belarus LLC owners. Save time and money by automating your tax calculations during early business stages.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calculator className="h-12 w-12 text-emerald-600 mb-2" />
              <CardTitle>Automated Calculations</CardTitle>
              <CardDescription>
                Calculate taxes for both Simplified and General Tax Systems with precision
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-2" />
              <CardTitle>Financial Tracking</CardTitle>
              <CardDescription>
                Track revenues, expenses, and payroll in one centralized platform
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-12 w-12 text-amber-600 mb-2" />
              <CardTitle>Reports & Exports</CardTitle>
              <CardDescription>
                Generate detailed tax reports and export to PDF or CSV format
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mb-2" />
              <CardTitle>Tax Calendar</CardTitle>
              <CardDescription>
                Never miss a deadline with automatic reminders and tax calendar
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-red-600 mb-2" />
              <CardTitle>Secure & Compliant</CardTitle>
              <CardDescription>
                Bank-level security with Belarus tax law compliance built-in
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Globe className="h-12 w-12 text-teal-600 mb-2" />
              <CardTitle>Multi-Language</CardTitle>
              <CardDescription>
                Available in English, Russian, and Belarusian languages
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              This application provides automated tax calculations for informational purposes and does not replace
              certified accounting or legal advice. Always consult with qualified professionals for official tax matters.
            </p>
          </CardContent>
        </Card>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-2xl font-bold text-emerald-600 mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Business Profile</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Register and set up your LLC with tax regime and basic information
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600 mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Financial Data</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Input your revenues, expenses, and payroll information as they occur
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-2xl font-bold text-purple-600 mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Tax Calculations</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Review automated tax calculations and export reports for your records
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white dark:bg-slate-900 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 Belarus Tax Calculator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
