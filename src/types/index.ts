export interface Currency {
  code: string;
  symbol: string;
  name: string;
  symbolPosition: 'before' | 'after';
}

export interface AppSettings {
  onboardingCompleted: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ur' | 'ar' | 'hi' | 'tr';
  currency: Currency;
  userName: string;
  defaultWalletId: string;
  reduceAnimations: boolean;
  dailySpendingLimit: number | null;
  showBalances: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  color: string;
  startingBalance: number;
  currentBalance: number;
  includeInNetWorth: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  title: string;
  amount: number;
  categoryId: string;
  walletId: string;
  date: string;
  time: string;
  note?: string;
  tags?: string[];
  spendingType?: 'essential' | 'want' | 'impulse';
  isRecurring?: boolean;
  recurringId?: string;
  templateId?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  icon: string;
  amount: number;
  spent: number;
  categoryIds: string[];
  startDate: string;
  recurrence: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  description?: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  tags: string[];
  includeInBalance: boolean;
  createdAt: string;
}

export interface Debt {
  id: string;
  type: 'payable' | 'receivable';
  personName: string;
  reason: string;
  amount: number;
  paidAmount: number;
  currency: Currency;
  color: string;
  date: string;
  note?: string;
  includeInBalance: boolean;
  bindToWalletId?: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  walletId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  note?: string;
}

export interface Reminder {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  walletId: string;
  dueDate: string;
  dueTime?: string;
  note?: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  categoryId: string;
  walletId: string;
  note?: string;
  spendingType?: 'essential' | 'want' | 'impulse';
  createdAt: string;
}
