'use client';

import { useEffect, useState } from 'react';
import { supabase, Business, TaxCalculation } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { BelarusTaxEngine } from '@/lib/tax-engine';

export default function CalculationsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [calculations, setCalculations] = useState<(TaxCalculation & { business: Business })[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<TaxCalculation | null>(null);

  const [formData, setFormData] = useState({
    business_id: '',
    period_start: '',
    period_end: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const [businessesResult, calculationsResult] = await Promise.all([
      supabase.from('businesses').select('*').eq('user_id', user?.id).eq('status', 'active'),
      supabase
        .from('tax_calculations')
        .select('*, business:businesses(*)')
        .order('created_at', { ascending: false }),
    ]);

    if (businessesResult.data) setBusinesses(businessesResult.data);
    if (calculationsResult.data) setCalculations(calculationsResult.data as any);
    setLoading(false);
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);

    try {
      const engine = new BelarusTaxEngine();
      const result = await engine.calculateTaxes({
        businessId: formData.business_id,
        periodStart: formData.period_start,
        periodEnd: formData.period_end,
      });

      await engine.saveTaxCalculation(
        formData.business_id,
        formData.period_start,
        formData.period_end,
        result,
        'draft'
      );

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating taxes. Please ensure you have financial data for the selected period.');
    } finally {
      setCalculating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: businesses[0]?.id || '',
      period_start: '',
      period_end: '',
    });
    setDialogOpen(false);
  };

  const viewCalculation = (calc: TaxCalculation) => {
    setSelectedCalculation(calc);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tax Calculations</h1>
          <p className="text-slate-600 dark:text-slate-400">Calculate and review your tax obligations</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} disabled={businesses.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              New Calculation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calculate Taxes</DialogTitle>
              <DialogDescription>Select business and period for tax calculation</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_id">Business</Label>
                <Select
                  value={formData.business_id}
                  onValueChange={(value) => setFormData({ ...formData, business_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_start">Period Start</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period_end">Period End</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={calculating}>
                  {calculating ? 'Calculating...' : 'Calculate Taxes'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {selectedCalculation ? (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedCalculation(null)}>
            Back to List
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Tax Calculation Details</CardTitle>
              <CardDescription>
                Period: {new Date(selectedCalculation.period_start).toLocaleDateString()} -{' '}
                {new Date(selectedCalculation.period_end).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      Total Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{Number(selectedCalculation.total_revenue).toFixed(2)} BYN</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{Number(selectedCalculation.total_expenses).toFixed(2)} BYN</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Taxable Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Number(selectedCalculation.taxable_income).toFixed(2)} BYN
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="font-semibold">Tax Breakdown</h3>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span>Income Tax</span>
                  <span className="font-semibold">{Number(selectedCalculation.income_tax).toFixed(2)} BYN</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span>VAT Payable</span>
                  <span className="font-semibold">{Number(selectedCalculation.vat_payable).toFixed(2)} BYN</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span>Social Contributions</span>
                  <span className="font-semibold">{Number(selectedCalculation.social_contributions).toFixed(2)} BYN</span>
                </div>
              </div>

              <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Total Tax Liability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                    {Number(selectedCalculation.total_tax_liability).toFixed(2)} BYN
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Status: <span className="font-medium capitalize">{selectedCalculation.status}</span>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {calculations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calculator className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No calculations yet</h3>
                <p className="text-slate-600 dark:text-slate-400">Create your first tax calculation</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {calculations.map((calc) => (
                <Card key={calc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => viewCalculation(calc)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{calc.business.name}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(calc.period_start).toLocaleDateString()} -{' '}
                          {new Date(calc.period_end).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Created: {new Date(calc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">
                          {Number(calc.total_tax_liability).toFixed(2)} BYN
                        </p>
                        <p className="text-xs text-slate-500 capitalize mt-1">{calc.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
