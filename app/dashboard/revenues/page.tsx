'use client';

import { useEffect, useState } from 'react';
import { supabase, Revenue, Business } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RevenuesPage() {
  const { user } = useAuth();
  const [revenues, setRevenues] = useState<(Revenue & { business: Business })[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);

  const [formData, setFormData] = useState({
    business_id: '',
    amount: '',
    period_start: '',
    period_end: '',
    description: '',
    vat_included: false,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const [businessesResult, revenuesResult] = await Promise.all([
      supabase.from('businesses').select('*').eq('user_id', user?.id).eq('status', 'active'),
      supabase
        .from('revenues')
        .select('*, business:businesses(*)')
        .order('period_start', { ascending: false }),
    ]);

    if (businessesResult.data) setBusinesses(businessesResult.data);
    if (revenuesResult.data) setRevenues(revenuesResult.data as any);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingRevenue) {
      await supabase.from('revenues').update(data).eq('id', editingRevenue.id);
    } else {
      await supabase.from('revenues').insert(data);
    }

    await loadData();
    resetForm();
  };

  const handleEdit = (revenue: Revenue) => {
    setEditingRevenue(revenue);
    setFormData({
      business_id: revenue.business_id,
      amount: revenue.amount.toString(),
      period_start: revenue.period_start,
      period_end: revenue.period_end,
      description: revenue.description || '',
      vat_included: revenue.vat_included,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this revenue entry?')) {
      await supabase.from('revenues').delete().eq('id', id);
      await loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      business_id: businesses[0]?.id || '',
      amount: '',
      period_start: '',
      period_end: '',
      description: '',
      vat_included: false,
    });
    setEditingRevenue(null);
    setDialogOpen(false);
  };

  const totalRevenue = revenues.reduce((sum, r) => sum + Number(r.amount), 0);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenues</h1>
          <p className="text-slate-600 dark:text-slate-400">Track your business income</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} disabled={businesses.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRevenue ? 'Edit Revenue' : 'Add Revenue'}</DialogTitle>
              <DialogDescription>Enter revenue details for the period</DialogDescription>
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
                <Label htmlFor="amount">Amount (BYN)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="vat_included">VAT Included</Label>
                <Switch
                  id="vat_included"
                  checked={formData.vat_included}
                  onCheckedChange={(checked) => setFormData({ ...formData, vat_included: checked })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingRevenue ? 'Update' : 'Add'} Revenue
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
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-3xl font-bold">{totalRevenue.toFixed(2)} BYN</p>
          </div>
          <TrendingUp className="h-12 w-12 text-emerald-500" />
        </div>
      </Card>

      {revenues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No revenue entries yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Add your first revenue entry to get started</p>
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">VAT</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {revenues.map((revenue) => (
                    <tr key={revenue.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 text-sm">{revenue.business.name}</td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(revenue.period_start).toLocaleDateString()} -{' '}
                        {new Date(revenue.period_end).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {Number(revenue.amount).toFixed(2)} BYN
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {revenue.vat_included ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(revenue)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(revenue.id)}>
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
