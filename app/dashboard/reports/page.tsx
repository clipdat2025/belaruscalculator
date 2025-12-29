'use client';

import { useEffect, useState } from 'react';
import { supabase, Business } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';

export default function ReportsPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    business_id: '',
    report_type: 'tax_summary' as 'tax_summary' | 'revenue_expense',
    period_start: '',
    period_end: '',
    format: 'pdf' as 'pdf' | 'csv',
  });

  useEffect(() => {
    loadBusinesses();
  }, [user]);

  const loadBusinesses = async () => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user?.id)
      .eq('status', 'active');

    if (data) {
      setBusinesses(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, business_id: data[0].id }));
      }
    }
    setLoading(false);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const reportData = {
        ...formData,
        created_at: new Date().toISOString(),
      };

      await supabase.from('reports').insert(reportData);

      alert(
        `Report generated successfully!\n\nNote: In a production environment, this would generate a ${formData.format.toUpperCase()} file with your ${formData.report_type === 'tax_summary' ? 'tax summary' : 'revenue and expense'} data.`
      );
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Generate and export tax and financial reports
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleGenerate} className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="report_type">Report Type</Label>
              <Select
                value={formData.report_type}
                onValueChange={(value: 'tax_summary' | 'revenue_expense') =>
                  setFormData({ ...formData, report_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tax_summary">Tax Summary Report</SelectItem>
                  <SelectItem value="revenue_expense">Revenue & Expense Report</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value: 'pdf' | 'csv') => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={generating || businesses.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {businesses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No businesses available</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Create a business first to generate reports
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">About Reports</h3>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Reports compile your financial data and tax calculations into downloadable formats.
            Tax Summary Reports include all tax calculations for the selected period, while
            Revenue & Expense Reports provide a detailed breakdown of your business finances.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
