'use client';

import { useEffect, useState } from 'react';
import { supabase, Payroll, Business } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export default function PayrollPage() {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState<(Payroll & { business: Business })[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);

  const [formData, setFormData] = useState({
    business_id: '',
    employee_name: '',
    gross_salary: '',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const [businessesResult, payrollResult] = await Promise.all([
      supabase.from('businesses').select('*').eq('user_id', user?.id).eq('status', 'active'),
      supabase
        .from('payroll')
        .select('*, business:businesses(*)')
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false }),
    ]);

    if (businessesResult.data) setBusinesses(businessesResult.data);
    if (payrollResult.data) setPayroll(payrollResult.data as any);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const grossSalary = parseFloat(formData.gross_salary);
    const incomeTaxRate = 0.13;
    const socialRate = 0.34;

    const data = {
      business_id: formData.business_id,
      employee_name: formData.employee_name,
      gross_salary: grossSalary,
      period_month: formData.period_month,
      period_year: formData.period_year,
      income_tax: grossSalary * incomeTaxRate,
      social_contributions: grossSalary * socialRate,
    };

    if (editingPayroll) {
      await supabase.from('payroll').update(data).eq('id', editingPayroll.id);
    } else {
      await supabase.from('payroll').insert(data);
    }

    await loadData();
    resetForm();
  };

  const handleEdit = (entry: Payroll) => {
    setEditingPayroll(entry);
    setFormData({
      business_id: entry.business_id,
      employee_name: entry.employee_name,
      gross_salary: entry.gross_salary.toString(),
      period_month: entry.period_month,
      period_year: entry.period_year,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payroll entry?')) {
      await supabase.from('payroll').delete().eq('id', id);
      await loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: businesses[0]?.id || '',
      employee_name: '',
      gross_salary: '',
      period_month: new Date().getMonth() + 1,
      period_year: new Date().getFullYear(),
    });
    setEditingPayroll(null);
    setDialogOpen(false);
  };

  const totalPayroll = payroll.reduce((sum, p) => sum + Number(p.gross_salary), 0);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage employee salary payments</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} disabled={businesses.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payroll Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPayroll ? 'Edit Payroll' : 'Add Payroll'}</DialogTitle>
              <DialogDescription>Enter employee salary information</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="employee_name">Employee Name</Label>
                <Input
                  id="employee_name"
                  value={formData.employee_name}
                  onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gross_salary">Gross Salary (BYN)</Label>
                <Input
                  id="gross_salary"
                  type="number"
                  step="0.01"
                  value={formData.gross_salary}
                  onChange={(e) => setFormData({ ...formData, gross_salary: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_month">Month</Label>
                  <Select
                    value={formData.period_month.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, period_month: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period_year">Year</Label>
                  <Input
                    id="period_year"
                    type="number"
                    value={formData.period_year}
                    onChange={(e) => setFormData({ ...formData, period_year: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <p>Calculated taxes (estimated):</p>
                <p>Income Tax (13%): {(parseFloat(formData.gross_salary || '0') * 0.13).toFixed(2)} BYN</p>
                <p>Social (34%): {(parseFloat(formData.gross_salary || '0') * 0.34).toFixed(2)} BYN</p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPayroll ? 'Update' : 'Add'} Payroll
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Payroll</p>
            <p className="text-3xl font-bold">{totalPayroll.toFixed(2)} BYN</p>
          </div>
          <Users className="h-12 w-12 text-blue-500" />
        </div>
      </Card>

      {payroll.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payroll entries yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Add your first payroll entry</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Gross Salary</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payroll.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm">{entry.business.name}</td>
                      <td className="px-4 py-3 text-sm">{entry.employee_name}</td>
                      <td className="px-4 py-3 text-sm">
                        {MONTHS[entry.period_month - 1].label} {entry.period_year}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {Number(entry.gross_salary).toFixed(2)} BYN
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
