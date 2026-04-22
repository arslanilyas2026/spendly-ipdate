import { Category } from '@/types';

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'exp-apparel', name: 'Apparel', icon: 'shirt', color: '#3B82F6', type: 'expense', isDefault: true },
  { id: 'exp-food', name: 'Food', icon: 'utensils', color: '#F97316', type: 'expense', isDefault: true },
  { id: 'exp-entertainment', name: 'Entertainment', icon: 'gamepad-2', color: '#0D9488', type: 'expense', isDefault: true },
  { id: 'exp-gifts', name: 'Gifts', icon: 'gift', color: '#F59E0B', type: 'expense', isDefault: true },
  { id: 'exp-grocery', name: 'Grocery', icon: 'shopping-cart', color: '#EA580C', type: 'expense', isDefault: true },
  { id: 'exp-health', name: 'Health', icon: 'heart-pulse', color: '#8B5CF6', type: 'expense', isDefault: true },
  { id: 'exp-others', name: 'Others', icon: 'more-horizontal', color: '#6B7280', type: 'expense', isDefault: true },
  { id: 'exp-pet', name: 'Pet', icon: 'dog', color: '#0D9488', type: 'expense', isDefault: true },
  { id: 'exp-rent', name: 'Rent', icon: 'home', color: '#14B8A6', type: 'expense', isDefault: true },
  { id: 'exp-shopping', name: 'Shopping', icon: 'shopping-bag', color: '#3B82F6', type: 'expense', isDefault: true },
  { id: 'exp-subscriptions', name: 'Subscriptions', icon: 'refresh-cw', color: '#EF4444', type: 'expense', isDefault: true },
  { id: 'exp-transport', name: 'Transportation', icon: 'car', color: '#8B5CF6', type: 'expense', isDefault: true },
  { id: 'exp-utilities', name: 'Utilities', icon: 'lightbulb', color: '#F59E0B', type: 'expense', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'inc-gift', name: 'Gift', icon: 'gift', color: '#F97316', type: 'income', isDefault: true },
  { id: 'inc-interest', name: 'Interest', icon: 'coins', color: '#0D9488', type: 'income', isDefault: true },
  { id: 'inc-others', name: 'Others', icon: 'more-horizontal', color: '#6B7280', type: 'income', isDefault: true },
  { id: 'inc-reimbursements', name: 'Reimbursements', icon: 'banknote', color: '#3B82F6', type: 'income', isDefault: true },
  { id: 'inc-salary', name: 'Salary', icon: 'wallet', color: '#F59E0B', type: 'income', isDefault: true },
  { id: 'inc-sales', name: 'Sales', icon: 'tag', color: '#14B8A6', type: 'income', isDefault: true },
];

export const ALL_DEFAULT_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
