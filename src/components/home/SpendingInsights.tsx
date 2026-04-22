import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { Transaction, Currency } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

interface SpendingInsightsProps {
  transactions: Transaction[];
  currency: Currency;
}

export default function SpendingInsights({ transactions, currency }: SpendingInsightsProps) {
  const insight = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(now.getDate() - now.getDay());

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    let thisWeek = 0;
    let lastWeek = 0;
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const d = new Date(tx.date + 'T00:00:00');
      if (d >= startOfThisWeek) thisWeek += tx.amount;
      else if (d >= startOfLastWeek) lastWeek += tx.amount;
    }

    if (lastWeek === 0 && thisWeek === 0) {
      return { type: 'neutral' as const, text: 'Track expenses to unlock weekly insights', emoji: '✨' };
    }
    if (lastWeek === 0) {
      return {
        type: 'neutral' as const,
        text: `You've spent ${formatCurrency(thisWeek, currency)} this week`,
        emoji: '📊',
      };
    }
    const diff = thisWeek - lastWeek;
    const pct = Math.round((Math.abs(diff) / lastWeek) * 100);
    if (diff < 0) {
      return {
        type: 'positive' as const,
        text: `You spent ${pct}% less than last week 🎉`,
        emoji: '🎉',
      };
    }
    if (diff === 0 || pct < 5) {
      return { type: 'neutral' as const, text: 'Spending pace matches last week', emoji: '⚖️' };
    }
    return {
      type: 'negative' as const,
      text: `You spent ${pct}% more than last week`,
      emoji: '⚠️',
    };
  }, [transactions, currency]);

  const Icon =
    insight.type === 'positive' ? TrendingDown : insight.type === 'negative' ? TrendingUp : Sparkles;

  const color =
    insight.type === 'positive'
      ? 'text-positive bg-positive-soft'
      : insight.type === 'negative'
      ? 'text-negative bg-negative-soft'
      : 'text-accent bg-accent-soft';

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${color} animate-fade-in`}>
      <div className="w-7 h-7 rounded-lg bg-bg-card/40 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs font-medium flex-1">{insight.text}</span>
    </div>
  );
}
