import React from 'react';
import { Target } from 'lucide-react';
import { Currency } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

interface DailyLimitTrackerProps {
  spent: number;
  limit: number;
  currency: Currency;
  onClick?: () => void;
}

export default function DailyLimitTracker({ spent, limit, currency, onClick }: DailyLimitTrackerProps) {
  const pct = Math.min((spent / limit) * 100, 100);
  const remaining = Math.max(limit - spent, 0);
  const isOver = spent > limit;
  const isWarn = pct >= 80 && !isOver;

  const barColor = isOver ? 'bg-negative' : isWarn ? 'bg-amber-500' : 'bg-accent';
  const textColor = isOver ? 'text-negative' : 'text-text-primary';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-bg-card rounded-2xl p-3 card-shadow active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-accent" />
          </div>
          <span className="text-xs font-semibold text-text-primary">Daily Limit</span>
        </div>
        <span className={`text-[10px] font-medium ${isOver ? 'text-negative' : 'text-text-muted'}`}>
          {isOver ? `Over by ${formatCurrency(spent - limit, currency)}` : `${formatCurrency(remaining, currency)} left`}
        </span>
      </div>
      <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className={`text-[11px] font-semibold ${textColor}`}>
          {formatCurrency(spent, currency)}
        </span>
        <span className="text-[10px] text-text-muted">
          / {formatCurrency(limit, currency)}
        </span>
      </div>
    </button>
  );
}
