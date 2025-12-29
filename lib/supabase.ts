import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  language: 'en' | 'ru' | 'be';
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  user_id: string;
  name: string;
  registration_date: string;
  tax_regime: 'simplified' | 'general';
  vat_applicable: boolean;
  employee_count: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type Revenue = {
  id: string;
  business_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  description: string;
  vat_included: boolean;
  created_at: string;
  updated_at: string;
};

export type Expense = {
  id: string;
  business_id: string;
  category: 'rent' | 'utilities' | 'supplies' | 'marketing' | 'salaries' | 'other';
  amount: number;
  expense_date: string;
  description: string;
  vat_deductible: boolean;
  created_at: string;
  updated_at: string;
};

export type Payroll = {
  id: string;
  business_id: string;
  employee_name: string;
  gross_salary: number;
  period_month: number;
  period_year: number;
  social_contributions: number;
  income_tax: number;
  created_at: string;
  updated_at: string;
};

export type TaxCalculation = {
  id: string;
  business_id: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_expenses: number;
  taxable_income: number;
  income_tax: number;
  vat_payable: number;
  social_contributions: number;
  total_tax_liability: number;
  status: 'draft' | 'final';
  created_at: string;
  updated_at: string;
};

export type TaxRate = {
  id: string;
  regime: 'simplified' | 'general';
  rate_type: 'income_tax' | 'vat' | 'social' | 'payroll';
  rate_value: number;
  effective_from: string;
  effective_to: string | null;
  description: string;
  created_at: string;
};

export type TaxDeadline = {
  id: string;
  tax_type: string;
  deadline_date: string;
  period_year: number;
  period_quarter: number | null;
  description: string;
  is_reminder_sent: boolean;
  created_at: string;
};
