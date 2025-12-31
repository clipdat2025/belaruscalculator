# Belarus Tax Calculator

## Overview
A Next.js application for calculating LLC taxes in Belarus. Supports both Simplified and General Tax Systems with features for tracking revenues, expenses, payroll, and generating tax reports.

## Project Structure
- `app/` - Next.js App Router pages and layouts
  - `dashboard/` - Protected dashboard pages (admin, businesses, calculations, calendar, expenses, payroll, reports, revenues)
  - `sign-in/` and `sign-up/` - Authentication pages
- `components/` - Reusable UI components (Radix UI based)
- `lib/` - Utilities including Supabase client and auth context
- `supabase/` - Database migrations

## Tech Stack
- **Framework**: Next.js 13.5.1 (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (external PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Libraries**: Radix UI, Lucide icons, Swiper for carousels
- **Forms**: React Hook Form with Zod validation

## Environment Variables
Required for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development
The dev server runs on port 5000:
```bash
npm run dev -- -p 5000 -H 0.0.0.0
```

## Build & Production
```bash
npm run build
npm start
```
