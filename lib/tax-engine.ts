import { supabase, TaxRate, Business } from './supabase';

export type TaxCalculationInput = {
  businessId: string;
  periodStart: string;
  periodEnd: string;
};

export type TaxCalculationResult = {
  totalRevenue: number;
  totalExpenses: number;
  taxableIncome: number;
  incomeTax: number;
  vatPayable: number;
  socialContributions: number;
  totalTaxLiability: number;
  breakdown: {
    revenueDetails: Array<{ amount: number; date: string; description: string }>;
    expenseDetails: Array<{ amount: number; date: string; category: string }>;
    payrollDetails: Array<{ salary: number; employee: string; tax: number }>;
  };
};

export class BelarusTaxEngine {
  private taxRates: TaxRate[] = [];

  async loadTaxRates(regime: 'simplified' | 'general'): Promise<void> {
    const { data, error } = await supabase
      .from('tax_rates')
      .select('*')
      .eq('regime', regime)
      .is('effective_to', null);

    if (error) {
      console.error('Error loading tax rates:', error);
      return;
    }

    this.taxRates = data || [];
  }

  getTaxRate(rateType: string): number {
    const rate = this.taxRates.find((r) => r.rate_type === rateType);
    return rate ? rate.rate_value / 100 : 0;
  }

  async calculateTaxes(input: TaxCalculationInput): Promise<TaxCalculationResult> {
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', input.businessId)
      .maybeSingle();

    if (!business) {
      throw new Error('Business not found');
    }

    await this.loadTaxRates(business.tax_regime);

    const revenues = await this.getRevenues(input.businessId, input.periodStart, input.periodEnd);
    const expenses = await this.getExpenses(input.businessId, input.periodStart, input.periodEnd);
    const payroll = await this.getPayroll(input.businessId, input.periodStart, input.periodEnd);

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPayroll = payroll.reduce((sum, p) => sum + p.gross_salary, 0);

    let taxableIncome: number;
    let incomeTax: number;
    let vatPayable: number = 0;
    let socialContributions: number = 0;

    if (business.tax_regime === 'simplified') {
      taxableIncome = totalRevenue - totalExpenses - totalPayroll;
      incomeTax = taxableIncome * this.getTaxRate('income_tax');

      if (business.vat_applicable) {
        const vatRate = this.getTaxRate('vat');
        const vatOnRevenue = totalRevenue * vatRate;
        const vatOnExpenses = expenses
          .filter((e) => e.vat_deductible)
          .reduce((sum, e) => sum + e.amount * vatRate, 0);
        vatPayable = vatOnRevenue - vatOnExpenses;
      }
    } else {
      taxableIncome = totalRevenue - totalExpenses - totalPayroll;
      incomeTax = taxableIncome * this.getTaxRate('income_tax');

      if (business.vat_applicable) {
        const vatRate = this.getTaxRate('vat');
        const vatOnRevenue = totalRevenue * vatRate;
        const vatOnExpenses = expenses
          .filter((e) => e.vat_deductible)
          .reduce((sum, e) => sum + e.amount * vatRate, 0);
        vatPayable = vatOnRevenue - vatOnExpenses;
      }

      const socialRate = this.getTaxRate('social');
      socialContributions = totalPayroll * socialRate;
    }

    const totalTaxLiability = incomeTax + vatPayable + socialContributions;

    const revenueDetails = revenues.map((r) => ({
      amount: r.amount,
      date: r.period_start,
      description: r.description || 'Revenue',
    }));

    const expenseDetails = expenses.map((e) => ({
      amount: e.amount,
      date: e.expense_date,
      category: e.category,
    }));

    const payrollDetails = payroll.map((p) => ({
      salary: p.gross_salary,
      employee: p.employee_name,
      tax: p.income_tax,
    }));

    return {
      totalRevenue,
      totalExpenses,
      taxableIncome: Math.max(0, taxableIncome),
      incomeTax: Math.max(0, incomeTax),
      vatPayable: Math.max(0, vatPayable),
      socialContributions: Math.max(0, socialContributions),
      totalTaxLiability: Math.max(0, totalTaxLiability),
      breakdown: {
        revenueDetails,
        expenseDetails,
        payrollDetails,
      },
    };
  }

  private async getRevenues(businessId: string, periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('revenues')
      .select('*')
      .eq('business_id', businessId)
      .gte('period_start', periodStart)
      .lte('period_end', periodEnd);

    if (error) {
      console.error('Error fetching revenues:', error);
      return [];
    }

    return data || [];
  }

  private async getExpenses(businessId: string, periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('business_id', businessId)
      .gte('expense_date', periodStart)
      .lte('expense_date', periodEnd);

    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    return data || [];
  }

  private async getPayroll(businessId: string, periodStart: string, periodEnd: string) {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('business_id', businessId)
      .gte('period_year', startDate.getFullYear())
      .lte('period_year', endDate.getFullYear());

    if (error) {
      console.error('Error fetching payroll:', error);
      return [];
    }

    return (data || []).filter((p) => {
      const payrollDate = new Date(p.period_year, p.period_month - 1);
      return payrollDate >= startDate && payrollDate <= endDate;
    });
  }

  async saveTaxCalculation(
    businessId: string,
    periodStart: string,
    periodEnd: string,
    result: TaxCalculationResult,
    status: 'draft' | 'final' = 'draft'
  ) {
    const { data, error } = await supabase
      .from('tax_calculations')
      .insert({
        business_id: businessId,
        period_start: periodStart,
        period_end: periodEnd,
        total_revenue: result.totalRevenue,
        total_expenses: result.totalExpenses,
        taxable_income: result.taxableIncome,
        income_tax: result.incomeTax,
        vat_payable: result.vatPayable,
        social_contributions: result.socialContributions,
        total_tax_liability: result.totalTaxLiability,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving tax calculation:', error);
      throw error;
    }

    return data;
  }
}
