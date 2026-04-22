import React from 'react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Transaction, Category, Wallet, Currency } from '@/types';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { formatTime } from '@/utils/dateHelpers';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  currency: Currency;
  showBalances: boolean;
  onTap?: () => void;
}

export default function TransactionItem({ transaction, category, wallet, currency, showBalances, onTap }: TransactionItemProps) {
  const isExpense = transaction.type === 'expense';
  const amountStr = showBalances
    ? formatCurrency(transaction.amount, currency)
    : formatCurrencyHidden(currency);

  return (
    <button onClick={onTap} className="w-full flex items-center gap-3 h-[60px] px-1 active:bg-bg-secondary/50 rounded-xl transition-colors">
      <CategoryIcon
        icon={category?.icon || 'more-horizontal'}
        color={category?.color || '#6B7280'}
        size={40}
      />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-text-primary truncate">{transaction.title}</p>
        <p className="text-xs text-text-muted">
          {wallet?.name || 'Wallet'} • {formatTime(transaction.time)}
        </p>
      </div>
      <span className={`text-sm font-semibold ${isExpense ? 'text-negative' : 'text-positive'}`}>
        {isExpense ? '-' : '+'}{amountStr}
      </span>
    </button>
  );
}
