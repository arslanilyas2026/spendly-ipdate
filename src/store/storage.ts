import localforage from 'localforage';
import { AppSettings, Wallet, Category, Transaction, Budget, Goal, Debt, RecurringTransaction, Reminder, TransactionTemplate } from '@/types';
import { ALL_DEFAULT_CATEGORIES } from '@/constants/categories';
import { CURRENCIES } from '@/constants/currencies';

localforage.config({ name: 'spendly', storeName: 'spendly_data' });

const KEYS = {
  settings: 'settings',
  wallets: 'wallets',
  categories: 'categories',
  transactions: 'transactions',
  budgets: 'budgets',
  goals: 'goals',
  debts: 'debts',
  recurring: 'recurring',
  reminders: 'reminders',
  templates: 'templates',
};

export const DEFAULT_SETTINGS: AppSettings = {
  onboardingCompleted: false,
  theme: 'system',
  language: 'en',
  currency: CURRENCIES[0],
  userName: 'User',
  defaultWalletId: '',
  reduceAnimations: false,
  dailySpendingLimit: null,
  showBalances: true,
};

async function getItem<T>(key: string, fallback: T): Promise<T> {
  const val = await localforage.getItem<T>(key);
  return val ?? fallback;
}

export const storage = {
  getSettings: () => getItem<AppSettings>(KEYS.settings, DEFAULT_SETTINGS),
  saveSettings: (s: AppSettings) => localforage.setItem(KEYS.settings, s),

  getWallets: () => getItem<Wallet[]>(KEYS.wallets, []),
  saveWallets: (w: Wallet[]) => localforage.setItem(KEYS.wallets, w),

  getCategories: async () => {
    const cats = await getItem<Category[]>(KEYS.categories, []);
    return cats.length > 0 ? cats : ALL_DEFAULT_CATEGORIES;
  },
  saveCategories: (c: Category[]) => localforage.setItem(KEYS.categories, c),

  getTransactions: () => getItem<Transaction[]>(KEYS.transactions, []),
  saveTransactions: (t: Transaction[]) => localforage.setItem(KEYS.transactions, t),

  getBudgets: () => getItem<Budget[]>(KEYS.budgets, []),
  saveBudgets: (b: Budget[]) => localforage.setItem(KEYS.budgets, b),

  getGoals: () => getItem<Goal[]>(KEYS.goals, []),
  saveGoals: (g: Goal[]) => localforage.setItem(KEYS.goals, g),

  getDebts: () => getItem<Debt[]>(KEYS.debts, []),
  saveDebts: (d: Debt[]) => localforage.setItem(KEYS.debts, d),

  getRecurring: () => getItem<RecurringTransaction[]>(KEYS.recurring, []),
  saveRecurring: (r: RecurringTransaction[]) => localforage.setItem(KEYS.recurring, r),

  getReminders: () => getItem<Reminder[]>(KEYS.reminders, []),
  saveReminders: (r: Reminder[]) => localforage.setItem(KEYS.reminders, r),

  getTemplates: () => getItem<TransactionTemplate[]>(KEYS.templates, []),
  saveTemplates: (t: TransactionTemplate[]) => localforage.setItem(KEYS.templates, t),

  exportAll: async () => {
    const data: Record<string, unknown> = {};
    for (const key of Object.values(KEYS)) {
      data[key] = await localforage.getItem(key);
    }
    return data;
  },

  importAll: async (data: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(data)) {
      await localforage.setItem(key, value);
    }
  },

  clearAll: () => localforage.clear(),
};
