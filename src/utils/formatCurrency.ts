import { Currency } from '@/types';

export function formatCurrency(amount: number, currency: Currency, showSign = false): string {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

  const sign = showSign ? (amount >= 0 ? '+' : '-') : (amount < 0 ? '-' : '');

  if (currency.symbolPosition === 'before') {
    return `${sign}${currency.symbol} ${formatted}`;
  }
  return `${sign}${formatted} ${currency.symbol}`;
}

export function formatCurrencyHidden(currency: Currency): string {
  return `${currency.symbol} ••••••`;
}
