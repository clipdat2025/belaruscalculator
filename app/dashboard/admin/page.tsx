'use client';

import { useEffect, useState } from 'react';
import { supabase, TaxRate } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function AdminPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);

  const [formData, setFormData] = useState({
    regime: 'simplified' as 'simplified' | 'general',
    rate_type: 'income_tax' as TaxRate['rate_type'],
    rate_value: '',
    effective_from: '',
    description: '',
  });

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.push('/dashboard');
    } else {
      loadTaxRates();
    }
  }, [profile, router]);

  const loadTaxRates = async () => {
    const { data } = await supabase.from('tax_rates').select('*').order('effective_from', { ascending: false });

    if (data) {
      setTaxRates(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      rate_value: parseFloat(formData.rate_value),
    };

    if (editingRate) {
      await supabase.from('tax_rates').update(data).eq('id', editingRate.id);
    } else {
      await supabase.from('tax_rates').insert(data);
    }

    await loadTaxRates();
    resetForm();
  };

  const handleEdit = (rate: TaxRate) => {
    setEditingRate(rate);
    setFormData({
      regime: rate.regime,
      rate_type: rate.rate_type,
      rate_value: rate.rate_value.toString(),
      effective_from: rate.effective_from,
      description: rate.description || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      await supabase.from('tax_rates').delete().eq('id', id);
      await loadTaxRates();
    }
  };

  const resetForm = () => {
    setFormData({
      regime: 'simplified',
      rate_type: 'income_tax',
      rate_value: '',
      effective_from: '',
      description: '',
    });
    setEditingRate(null);
    setDialogOpen(false);
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-emerald-600" />
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage tax rates and system configuration</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tax Rate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRate ? 'Edit Tax Rate' : 'Add Tax Rate'}</DialogTitle>
              <DialogDescription>Configure tax rate parameters</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regime">Tax Regime</Label>
                <Select
                  value={formData.regime}
                  onValueChange={(value: 'simplified' | 'general') =>
                    setFormData({ ...formData, regime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplified">Simplified</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_type">Rate Type</Label>
                <Select
                  value={formData.rate_type}
                  onValueChange={(value: TaxRate['rate_type']) =>
                    setFormData({ ...formData, rate_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income_tax">Income Tax</SelectItem>
                    <SelectItem value="vat">VAT</SelectItem>
                    <SelectItem value="social">Social Contributions</SelectItem>
                    <SelectItem value="payroll">Payroll Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate_value">Rate Value (%)</Label>
                <Input
                  id="rate_value"
                  type="number"
                  step="0.01"
                  value={formData.rate_value}
                  onChange={(e) => setFormData({ ...formData, rate_value: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_from">Effective From</Label>
                <Input
                  id="effective_from"
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                  required
                />
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

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingRate ? 'Update' : 'Add'} Rate
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Regime</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Effective From</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {taxRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm capitalize">{rate.regime}</td>
                    <td className="px-4 py-3 text-sm capitalize">
                      {rate.rate_type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">{rate.rate_value}%</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(rate.effective_from).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(rate)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(rate.id)}>
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
    </div>
  );
}
