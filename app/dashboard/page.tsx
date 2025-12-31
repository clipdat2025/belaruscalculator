'use client';

import { useEffect, useState } from 'react';
import { supabase, Business, TaxCalculation } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, TrendingDown, Calculator, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Dashboard() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalTaxLiability: 0,
    recentCalculations: [] as TaxCalculation[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
        setLoading(false);
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    const { data: businessesData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (businessesData && businessesData.length > 0) {
      setBusinesses(businessesData);

      const businessIds = businessesData.map((b) => b.id);

      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;

      const [revenuesResult, expensesResult, calculationsResult] = await Promise.all([
        supabase
          .from('revenues')
          .select('amount')
          .in('business_id', businessIds)
          .gte('period_start', yearStart)
          .lte('period_end', yearEnd),

        supabase
          .from('expenses')
          .select('amount')
          .in('business_id', businessIds)
          .gte('expense_date', yearStart)
          .lte('expense_date', yearEnd),

        supabase
          .from('tax_calculations')
          .select('*')
          .in('business_id', businessIds)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const totalRevenue = revenuesResult.data?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      const totalExpenses = expensesResult.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const totalTaxLiability = calculationsResult.data?.[0]?.total_tax_liability || 0;

      setStats({
        totalRevenue,
        totalExpenses,
        totalTaxLiability,
        recentCalculations: calculationsResult.data || [],
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500 animate-pulse"></div>
                <div className="w-5 h-5 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-5 h-5 rounded-full bg-indigo-500 animate-pulse [animation-delay:0.4s]"></div>
                <span className="text-lg text-slate-600 dark:text-slate-400">Loading Dashboard...</span>
            </div>
        </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <Building2 className="h-16 w-16 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">Welcome! Let's Get Started.</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            You haven't added any businesses yet. Create your first business profile to begin tracking finances and calculating taxes.
        </p>
        <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:scale-105">
            <Link href="/dashboard/businesses">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Business
            </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          A complete overview of your business finances for {new Date().getFullYear()}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Businesses</CardTitle>
                <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{businesses.length}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {businesses.map(b => b.name).join(', ')}
                </p>
            </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue (YTD)</CardTitle>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalRevenue)} BYN</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Year to date</p>
            </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses (YTD)</CardTitle>
                <TrendingDown className="h-5 w-5 text-rose-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalExpenses)} BYN</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Year to date</p>
            </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Tax Liability</CardTitle>
                <Calculator className="h-5 w-5 text-sky-500" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalTaxLiability)} BYN</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Latest calculation</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            <CardDescription>Your most common tasks, just a click away.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
             <Button className="w-full justify-start text-base py-6 group transition-colors duration-200" variant="ghost" asChild>
              <Link href="/dashboard/revenues">
                <TrendingUp className="h-5 w-5 mr-4 text-emerald-500" />
                Add Revenue Entry
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button className="w-full justify-start text-base py-6 group transition-colors duration-200" variant="ghost" asChild>
              <Link href="/dashboard/expenses">
                <TrendingDown className="h-5 w-5 mr-4 text-rose-500" />
                Add Expense Entry
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button className="w-full justify-start text-base py-6 group transition-colors duration-200" variant="ghost" asChild>
              <Link href="/dashboard/calculations">
                <Calculator className="h-5 w-5 mr-4 text-sky-500" />
                Calculate Taxes
                <ArrowRight className="h-4 w-4 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Tax Calculations</CardTitle>
            <CardDescription>A summary of your latest calculations.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCalculations.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCalculations.map((calc) => (
                  <div key={calc.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(calc.period_start).toLocaleDateString('en-CA')} to{' '}
                        {new Date(calc.period_end).toLocaleDateString('en-CA')}
                      </p>
                      <p className={`text-xs mt-1 capitalize font-medium ${calc.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Status: {calc.status}
                      </p>
                    </div>
                    <div className="text-left sm:text-right mt-2 sm:mt-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">{formatCurrency(Number(calc.total_tax_liability))} BYN</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    <div className="p-4 inline-block bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <Calculator className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="font-semibold">No calculations found</p>
                    <p className="text-sm">Run your first tax calculation to see it here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-500/50">
        <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <CardTitle className="text-amber-900 dark:text-amber-300 text-lg">
                Important Reminder
            </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            This application provides automated tax calculations for informational purposes only.
            Always consult with a certified accountant or tax professional for official filings and complex tax matters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
