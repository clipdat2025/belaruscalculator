/*
  # Belarus LLC Tax Calculator - Complete Database Schema

  ## Overview
  This migration creates the complete database structure for a Belarus LLC tax calculation platform.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, FK to auth.users) - User profile ID
  - `full_name` (text) - User's full name
  - `email` (text) - User email
  - `role` (text) - User role (user/admin)
  - `language` (text) - Preferred language (en/ru/be)
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. businesses
  - `id` (uuid, PK) - Business ID
  - `user_id` (uuid, FK) - Owner user ID
  - `name` (text) - LLC name
  - `registration_date` (date) - Business registration date
  - `tax_regime` (text) - simplified/general
  - `vat_applicable` (boolean) - VAT registration status
  - `employee_count` (integer) - Number of employees
  - `status` (text) - active/inactive
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. tax_rates
  - `id` (uuid, PK) - Tax rate ID
  - `regime` (text) - Tax regime type
  - `rate_type` (text) - income_tax/vat/social/payroll
  - `rate_value` (numeric) - Tax rate percentage
  - `effective_from` (date) - When rate becomes effective
  - `effective_to` (date, nullable) - When rate expires
  - `description` (text) - Rate description
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. revenues
  - `id` (uuid, PK) - Revenue ID
  - `business_id` (uuid, FK) - Business ID
  - `amount` (numeric) - Revenue amount
  - `period_start` (date) - Period start date
  - `period_end` (date) - Period end date
  - `description` (text) - Revenue description
  - `vat_included` (boolean) - VAT inclusion flag
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. expenses
  - `id` (uuid, PK) - Expense ID
  - `business_id` (uuid, FK) - Business ID
  - `category` (text) - Expense category
  - `amount` (numeric) - Expense amount
  - `expense_date` (date) - Expense date
  - `description` (text) - Expense description
  - `vat_deductible` (boolean) - VAT deductibility flag
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. payroll
  - `id` (uuid, PK) - Payroll ID
  - `business_id` (uuid, FK) - Business ID
  - `employee_name` (text) - Employee name
  - `gross_salary` (numeric) - Gross salary amount
  - `period_month` (integer) - Payment month (1-12)
  - `period_year` (integer) - Payment year
  - `social_contributions` (numeric) - Social security contributions
  - `income_tax` (numeric) - Income tax withheld
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. tax_calculations
  - `id` (uuid, PK) - Calculation ID
  - `business_id` (uuid, FK) - Business ID
  - `period_start` (date) - Calculation period start
  - `period_end` (date) - Calculation period end
  - `total_revenue` (numeric) - Total revenue for period
  - `total_expenses` (numeric) - Total expenses for period
  - `taxable_income` (numeric) - Calculated taxable income
  - `income_tax` (numeric) - Income tax amount
  - `vat_payable` (numeric) - VAT payable amount
  - `social_contributions` (numeric) - Social contributions
  - `total_tax_liability` (numeric) - Total tax to pay
  - `status` (text) - draft/final
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. tax_deadlines
  - `id` (uuid, PK) - Deadline ID
  - `tax_type` (text) - Type of tax
  - `deadline_date` (date) - Deadline date
  - `period_year` (integer) - Relevant year
  - `period_quarter` (integer, nullable) - Relevant quarter (1-4)
  - `description` (text) - Deadline description
  - `is_reminder_sent` (boolean) - Reminder status
  - `created_at` (timestamptz) - Record creation timestamp

  ### 9. reports
  - `id` (uuid, PK) - Report ID
  - `business_id` (uuid, FK) - Business ID
  - `report_type` (text) - tax_summary/revenue_expense
  - `period_start` (date) - Report period start
  - `period_end` (date) - Report period end
  - `file_url` (text, nullable) - Generated file URL
  - `format` (text) - pdf/csv
  - `created_at` (timestamptz) - Report generation timestamp

  ### 10. audit_logs
  - `id` (uuid, PK) - Log ID
  - `user_id` (uuid, FK) - User who performed action
  - `action` (text) - Action performed
  - `table_name` (text) - Affected table
  - `record_id` (uuid, nullable) - Affected record ID
  - `old_values` (jsonb, nullable) - Previous values
  - `new_values` (jsonb, nullable) - New values
  - `created_at` (timestamptz) - Action timestamp

  ## Security
  - RLS enabled on all tables
  - Policies ensure users can only access their own data
  - Admins have full access to tax_rates and tax_deadlines
  - Audit logs are read-only for regular users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ru', 'be')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  registration_date date NOT NULL,
  tax_regime text NOT NULL CHECK (tax_regime IN ('simplified', 'general')),
  vat_applicable boolean DEFAULT false,
  employee_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tax_rates table
CREATE TABLE IF NOT EXISTS tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regime text NOT NULL CHECK (regime IN ('simplified', 'general')),
  rate_type text NOT NULL CHECK (rate_type IN ('income_tax', 'vat', 'social', 'payroll')),
  rate_value numeric(5, 2) NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create revenues table
CREATE TABLE IF NOT EXISTS revenues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount numeric(15, 2) NOT NULL CHECK (amount >= 0),
  period_start date NOT NULL,
  period_end date NOT NULL,
  description text,
  vat_included boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('rent', 'utilities', 'supplies', 'marketing', 'salaries', 'other')),
  amount numeric(15, 2) NOT NULL CHECK (amount >= 0),
  expense_date date NOT NULL,
  description text,
  vat_deductible boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_name text NOT NULL,
  gross_salary numeric(15, 2) NOT NULL CHECK (gross_salary >= 0),
  period_month integer NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year integer NOT NULL CHECK (period_year >= 2020),
  social_contributions numeric(15, 2) DEFAULT 0,
  income_tax numeric(15, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tax_calculations table
CREATE TABLE IF NOT EXISTS tax_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_revenue numeric(15, 2) DEFAULT 0,
  total_expenses numeric(15, 2) DEFAULT 0,
  taxable_income numeric(15, 2) DEFAULT 0,
  income_tax numeric(15, 2) DEFAULT 0,
  vat_payable numeric(15, 2) DEFAULT 0,
  social_contributions numeric(15, 2) DEFAULT 0,
  total_tax_liability numeric(15, 2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'final')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tax_deadlines table
CREATE TABLE IF NOT EXISTS tax_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_type text NOT NULL,
  deadline_date date NOT NULL,
  period_year integer NOT NULL,
  period_quarter integer CHECK (period_quarter BETWEEN 1 AND 4),
  description text,
  is_reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('tax_summary', 'revenue_expense')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  file_url text,
  format text NOT NULL CHECK (format IN ('pdf', 'csv')),
  created_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Businesses policies
CREATE POLICY "Users can view own businesses"
  ON businesses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own businesses"
  ON businesses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own businesses"
  ON businesses FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Tax rates policies (read-only for users, full access for admins)
CREATE POLICY "Anyone can view tax rates"
  ON tax_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tax rates"
  ON tax_rates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Revenues policies
CREATE POLICY "Users can view own business revenues"
  ON revenues FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = revenues.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own business revenues"
  ON revenues FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = revenues.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business revenues"
  ON revenues FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = revenues.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = revenues.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own business revenues"
  ON revenues FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = revenues.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Expenses policies
CREATE POLICY "Users can view own business expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = expenses.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own business expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = expenses.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = expenses.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = expenses.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own business expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = expenses.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Payroll policies
CREATE POLICY "Users can view own business payroll"
  ON payroll FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = payroll.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own business payroll"
  ON payroll FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = payroll.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business payroll"
  ON payroll FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = payroll.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = payroll.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own business payroll"
  ON payroll FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = payroll.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Tax calculations policies
CREATE POLICY "Users can view own business tax calculations"
  ON tax_calculations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tax_calculations.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own business tax calculations"
  ON tax_calculations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tax_calculations.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own business tax calculations"
  ON tax_calculations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tax_calculations.business_id
      AND businesses.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tax_calculations.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own business tax calculations"
  ON tax_calculations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = tax_calculations.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Tax deadlines policies (read for all authenticated users)
CREATE POLICY "Authenticated users can view tax deadlines"
  ON tax_deadlines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage tax deadlines"
  ON tax_deadlines FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Reports policies
CREATE POLICY "Users can view own business reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reports.business_id
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own business reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reports.business_id
      AND businesses.user_id = auth.uid()
    )
  );

-- Audit logs policies
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_revenues_business_id ON revenues(business_id);
CREATE INDEX IF NOT EXISTS idx_revenues_period ON revenues(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_expenses_business_id ON expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_payroll_business_id ON payroll(business_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_business_id ON tax_calculations(business_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_period ON tax_calculations(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_reports_business_id ON reports(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_calculations_updated_at BEFORE UPDATE ON tax_calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
