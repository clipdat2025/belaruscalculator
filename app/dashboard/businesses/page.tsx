'use client';

import { useEffect, useState } from 'react';
import { supabase, Business } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    registration_date: '',
    tax_regime: 'simplified' as 'simplified' | 'general',
    vat_applicable: false,
    employee_count: 0,
  });

  useEffect(() => {
    loadBusinesses();
  }, [user]);

  const loadBusinesses = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBusinesses(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBusiness) {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', editingBusiness.id);

      if (!error) {
        await loadBusinesses();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('businesses').insert({
        ...formData,
        user_id: user?.id,
        status: 'active',
      });

      if (!error) {
        await loadBusinesses();
        resetForm();
      }
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      registration_date: business.registration_date,
      tax_regime: business.tax_regime,
      vat_applicable: business.vat_applicable,
      employee_count: business.employee_count,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this business?')) {
      const { error } = await supabase.from('businesses').delete().eq('id', id);

      if (!error) {
        await loadBusinesses();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      registration_date: '',
      tax_regime: 'simplified',
      vat_applicable: false,
      employee_count: 0,
    });
    setEditingBusiness(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading businesses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Businesses</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your business profiles</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBusiness ? 'Edit Business' : 'Add New Business'}</DialogTitle>
              <DialogDescription>
                Enter your LLC information and tax configuration
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_date">Registration Date</Label>
                <Input
                  id="registration_date"
                  type="date"
                  value={formData.registration_date}
                  onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_regime">Tax Regime</Label>
                <Select
                  value={formData.tax_regime}
                  onValueChange={(value: 'simplified' | 'general') =>
                    setFormData({ ...formData, tax_regime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simplified">Simplified Tax System</SelectItem>
                    <SelectItem value="general">General Tax System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="vat_applicable">VAT Applicable</Label>
                <Switch
                  id="vat_applicable"
                  checked={formData.vat_applicable}
                  onCheckedChange={(checked) => setFormData({ ...formData, vat_applicable: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee_count">Number of Employees</Label>
                <Input
                  id="employee_count"
                  type="number"
                  min="0"
                  value={formData.employee_count}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_count: parseInt(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingBusiness ? 'Update' : 'Create'} Business
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create your first business profile to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription>
                      {business.tax_regime === 'simplified' ? 'Simplified Tax' : 'General Tax'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(business)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(business.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-500">Registered:</span>{' '}
                  {new Date(business.registration_date).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">VAT:</span>{' '}
                  {business.vat_applicable ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Employees:</span> {business.employee_count}
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">Status:</span>{' '}
                  <span className={business.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}>
                    {business.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
