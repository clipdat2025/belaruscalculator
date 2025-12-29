# Belarus LLC Tax Calculator

A comprehensive full-stack web application that helps Belarus LLC owners calculate their business taxes automatically without needing an accountant during early stages.

## Features

### Core Functionality
- **Automated Tax Calculations**: Calculate taxes for both Simplified and General Tax Systems
- **Financial Tracking**: Track revenues, expenses, and payroll in one centralized platform
- **Business Management**: Create and manage multiple business profiles with different tax regimes
- **Tax Calendar**: View important tax deadlines and payment dates
- **Reports & Exports**: Generate detailed tax reports (PDF/CSV export placeholders)
- **Multi-Language Support**: Available in English, Russian, and Belarusian

### Security Features
- Secure authentication with Supabase
- Row-Level Security (RLS) for data protection
- Role-based access control (User/Admin)
- Input validation and sanitization

### Tax Features
- **Simplified Tax System**
  - Flat tax rate calculation
  - Optional VAT inclusion/exclusion
  - Automatic period-based calculations
- **General Tax System**
  - Corporate income tax
  - VAT calculation with deductions
  - Social security contributions
  - Payroll tax calculations

## Tech Stack

### Frontend
- **Framework**: Next.js 13 (React)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks

### Backend
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (email/password)
- **ORM**: Supabase Client
- **API**: Next.js API routes (via Supabase)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. The database schema has been created and seeded with initial tax rates and deadlines.

### Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

Production build:
```bash
npm run build
npm start
```

## Database Schema

The application uses the following main tables:
- **profiles**: User profiles and roles
- **businesses**: Business information and tax regime settings
- **revenues**: Revenue entries for businesses
- **expenses**: Expense entries with categories
- **payroll**: Employee salary and tax information
- **tax_calculations**: Calculated tax obligations
- **tax_rates**: Configurable tax rates by regime
- **tax_deadlines**: Important tax payment deadlines
- **reports**: Generated report metadata
- **audit_logs**: System audit trail

## Usage Guide

### 1. Create an Account
- Navigate to the sign-up page
- Enter your full name, email, and password
- You'll be automatically redirected to the dashboard

### 2. Set Up Your Business
- Go to the Businesses page
- Click "Add Business"
- Enter your LLC details:
  - Business name
  - Registration date
  - Tax regime (Simplified or General)
  - VAT applicability
  - Number of employees

### 3. Track Financial Data
- **Revenues**: Add income entries with period dates and amounts
- **Expenses**: Categorize expenses (rent, utilities, supplies, etc.)
- **Payroll**: Enter employee salaries with automatic tax calculations

### 4. Calculate Taxes
- Navigate to Tax Calculations
- Click "New Calculation"
- Select your business and calculation period
- View detailed breakdown of:
  - Total revenue and expenses
  - Taxable income
  - Income tax, VAT, and social contributions
  - Total tax liability

### 5. Review Tax Calendar
- Check upcoming tax deadlines
- View payment obligations by quarter
- See status indicators (Upcoming, Urgent, Overdue)

### 6. Generate Reports
- Go to Reports page
- Select business, period, and format
- Generate Tax Summary or Revenue/Expense reports

## Admin Features

Admins have access to additional functionality:
- Manage tax rates for different regimes
- Update effective dates for rate changes
- View all system activity

To access admin features, a user's role must be set to 'admin' in the profiles table.

## Legal Disclaimer

**IMPORTANT**: This application provides automated tax calculations for informational purposes and does not replace certified accounting or legal advice. Always consult with qualified professionals for official tax filings and complex tax matters.

## Tax Rates (Current)

### Simplified Tax System
- Income Tax: 5%
- VAT: 20% (optional)

### General Tax System
- Corporate Income Tax: 18%
- VAT: 20%
- Employer Social Contributions: 34%
- Employee Income Tax: 13%

*Note: Tax rates are configurable via the admin panel and can be updated without code changes.*

## Project Structure

```
├── app/
│   ├── dashboard/          # Protected dashboard area
│   │   ├── businesses/     # Business management
│   │   ├── revenues/       # Revenue tracking
│   │   ├── expenses/       # Expense tracking
│   │   ├── payroll/        # Payroll management
│   │   ├── calculations/   # Tax calculations
│   │   ├── calendar/       # Tax calendar
│   │   ├── reports/        # Report generation
│   │   └── admin/          # Admin panel
│   ├── sign-in/           # Authentication pages
│   ├── sign-up/
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase.ts        # Supabase client and types
│   ├── auth-context.tsx   # Authentication context
│   ├── tax-engine.ts      # Tax calculation engine
│   └── translations.ts    # Multi-language support
└── README.md
```

## Future Enhancements

Potential features for future versions:
- OCR receipt upload and processing
- Bank CSV import for automatic transaction entry
- AI-powered suggestions for deductible expenses
- Integration with Belarus tax authority APIs
- Mobile application (React Native)
- Email notifications for tax deadlines
- Multi-year comparative analysis
- Budget forecasting tools
- Accountant review marketplace

## Support

For questions or issues, please refer to Belarus tax authority official resources or consult with a certified accountant.

## License

This project is for educational and informational purposes. Always verify tax calculations with official sources.
