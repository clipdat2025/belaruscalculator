'use client';

import { useEffect, useState } from 'react';
import { supabase, Business, TaxCalculation } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, TrendingUp, TrendingDown, Calculator, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

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
    }
  }, [user]);

  const loadDashboardData = async () => {
    const { data: businessesData } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user?.id)
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
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No businesses yet</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Get started by creating your first business profile
        </p>
        <Button asChild>
          <Link href="/dashboard/businesses">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Overview of your tax calculations and financial data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businesses.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {businesses.map(b => b.name).join(', ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} BYN</div>
            <p className="text-xs text-slate-500 mt-1">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (YTD)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses.toFixed(2)} BYN</div>
            <p className="text-xs text-slate-500 mt-1">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tax Liability</CardTitle>
            <Calculator className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTaxLiability.toFixed(2)} BYN</div>
            <p className="text-xs text-slate-500 mt-1">Latest calculation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/revenues">
                <TrendingUp className="h-4 w-4 mr-2" />
                Add Revenue Entry
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/expenses">
                <TrendingDown className="h-4 w-4 mr-2" />
                Add Expense Entry
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/calculations">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Taxes
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tax Calculations</CardTitle>
            <CardDescription>Latest tax calculation results</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCalculations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(calc.period_start).toLocaleDateString()} -{' '}
                        {new Date(calc.period_end).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status: {calc.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{Number(calc.total_tax_liability).toFixed(2)} BYN</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No calculations yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            This application provides automated tax calculations for informational purposes only.
            Always consult with certified accountants or tax professionals for official filings and complex tax matters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
