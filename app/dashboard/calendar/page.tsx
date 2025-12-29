'use client';

import { useEffect, useState } from 'react';
import { supabase, TaxDeadline } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CalendarPage() {
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    const { data, error } = await supabase
      .from('tax_deadlines')
      .select('*')
      .order('deadline_date', { ascending: true });

    if (data) {
      setDeadlines(data);
    }
    setLoading(false);
  };

  const getDeadlineStatus = (deadlineDate: string) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'text-red-600' };
    } else if (diffDays <= 7) {
      return { status: 'urgent', label: 'Urgent', icon: Clock, color: 'text-amber-600' };
    } else if (diffDays <= 30) {
      return { status: 'upcoming', label: 'Upcoming', icon: Clock, color: 'text-blue-600' };
    } else {
      return { status: 'future', label: 'Future', icon: CheckCircle2, color: 'text-slate-500' };
    }
  };

  const groupedDeadlines = deadlines.reduce((acc, deadline) => {
    const year = deadline.period_year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(deadline);
    return acc;
  }, {} as Record<number, TaxDeadline[]>);

  if (loading) return <div className="text-center py-12">Loading calendar...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Calendar</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Important tax deadlines and payment dates
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Important Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            These are general tax deadlines for Belarus. Always verify specific deadlines with the tax authorities
            as they may vary based on your business type and circumstances.
          </p>
        </CardContent>
      </Card>

      {Object.keys(groupedDeadlines)
        .sort((a, b) => Number(b) - Number(a))
        .map((year) => (
          <div key={year} className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{year}</h2>

            <div className="grid gap-4">
              {groupedDeadlines[Number(year)].map((deadline) => {
                const status = getDeadlineStatus(deadline.deadline_date);
                const StatusIcon = status.icon;

                return (
                  <Card key={deadline.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-emerald-600">
                              {new Date(deadline.deadline_date).getDate()}
                            </span>
                            <span className="text-xs text-emerald-600 uppercase">
                              {new Date(deadline.deadline_date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{deadline.tax_type}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {deadline.description}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(deadline.deadline_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={status.status === 'overdue' ? 'destructive' : 'secondary'}
                                className="flex items-center gap-1"
                              >
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                              {deadline.period_quarter && (
                                <Badge variant="outline">Q{deadline.period_quarter}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

      {deadlines.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deadlines loaded</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Tax calendar data will be displayed here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
