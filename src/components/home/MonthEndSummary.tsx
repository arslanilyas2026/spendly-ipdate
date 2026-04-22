import React, { useMemo } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Transaction, Category, Currency } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

interface MonthEndSummaryProps {
  transactions: Transaction[];
  categories: Category[];
  currency: Currency;
  onDismiss: () => void;
  onViewReport: () => void;
}

export default function MonthEndSummary({
  transactions,
  categories,
  currency,
  onDismiss,
  onViewReport,
}: MonthEndSummaryProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthTxs = transactions.filter((t) => t.date >= monthStart);

    let income = 0;
    let expense = 0;
    const catTotals: Record<string, number> = {};

    for (const tx of monthTxs) {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') {
        expense += tx.amount;
        catTotals[tx.categoryId] = (catTotals[tx.categoryId] || 0) + tx.amount;
      }
    }

    const topCatId = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCat = categories.find((c) => c.id === topCatId);
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    return { income, expense, topCat, topCatAmount: topCatId ? catTotals[topCatId] : 0, savingsRate, monthName };
  }, [transactions, categories]);

  return (
    <div className="relative rounded-2xl p-4 bg-gradient-to-br from-accent/15 via-bg-card to-bg-card border border-accent/20 card-shadow animate-fade-in overflow-hidden">
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-bg-secondary/60 flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3 text-text-muted" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
            Month-End Summary
          </p>
          <p className="text-sm font-display text-text-primary">{stats.monthName} so far</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-xl bg-bg-card/60">
          <p className="text-[9px] text-text-muted uppercase">Spent</p>
          <p className="text-sm font-display text-negative truncate">
            {formatCurrency(stats.expense, currency)}
          </p>
        </div>
        <div className="text-center p-2 rounded-xl bg-bg-card/60">
          <p className="text-[9px] text-text-muted uppercase">Earned</p>
          <p className="text-sm font-display text-positive truncate">
            {formatCurrency(stats.income, currency)}
          </p>
        </div>
        <div className="text-center p-2 rounded-xl bg-bg-card/60">
          <p className="text-[9px] text-text-muted uppercase">Saved</p>
          <p
            className={`text-sm font-display ${
              stats.savingsRate >= 0 ? 'text-positive' : 'text-negative'
            }`}
          >
            {stats.savingsRate}%
          </p>
        </div>
      </div>

      {stats.topCat && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-bg-secondary/50 mb-3">
          <span className="text-[11px] text-text-muted">Top category</span>
          <span className="text-xs font-semibold text-text-primary">
            {stats.topCat.icon} {stats.topCat.name} · {formatCurrency(stats.topCatAmount, currency)}
          </span>
        </div>
      )}

      <button
        onClick={onViewReport}
        className="w-full h-9 rounded-xl bg-accent text-primary-foreground text-xs font-semibold"
      >
        View Full Report
      </button>
    </div>
  );
}
