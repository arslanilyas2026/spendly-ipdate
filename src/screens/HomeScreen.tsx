import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { Eye, EyeOff, Plus, TrendingDown, TrendingUp, ChevronRight, AlertTriangle, X, Clock, CreditCard, Wallet, Send, ArrowDownLeft, ArrowUpRight, Target, Users } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgets } from '@/hooks/useBudgets';
import { useReminders } from '@/hooks/useReminders';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { getCurrentDate, getGreeting, formatDate, generateId } from '@/utils/dateHelpers';
import { t } from '@/utils/translations';
import TransactionItem from '@/components/transaction/TransactionItem';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Transaction, Budget, Reminder } from '@/types';
import BottomSheet from '@/components/ui/BottomSheet';
import BalanceCarousel from '@/components/home/BalanceCarousel';
import SpendingInsights from '@/components/home/SpendingInsights';
import DailyLimitTracker from '@/components/home/DailyLimitTracker';
import StreakCounter from '@/components/home/StreakCounter';
import MonthEndSummary from '@/components/home/MonthEndSummary';
import WalletTransferSheet from '@/components/transaction/WalletTransferSheet';
import SplitBillSheet from '@/components/transaction/SplitBillSheet';

interface HomeScreenProps {
  onAddTransaction?: () => void;
}

export default function HomeScreen({ onAddTransaction }: HomeScreenProps) {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { wallets } = useWallets();
  const { transactions, addTransaction } = useTransactions();
  const { categories } = useCategories();
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { pendingReminders, overdueReminders, markPaid, addReminder, deleteReminder } = useReminders();
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [showSplitSheet, setShowSplitSheet] = useState(false);
  const [summaryDismissedKey, setSummaryDismissedKey] = useState<string | null>(
    () => localStorage.getItem('monthEndSummaryDismissed')
  );
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCategoryIds, setBudgetCategoryIds] = useState<string[]>([]);
  const [budgetRecurrence, setBudgetRecurrence] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  // Reminder form state
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderAmount, setReminderAmount] = useState('');
  const [reminderDate, setReminderDate] = useState(getCurrentDate());
  const [reminderCatId, setReminderCatId] = useState('');
  const [reminderWalletId, setReminderWalletId] = useState(wallets[0]?.id || '');

  const greeting = t(`greeting.${getGreeting()}`);

  const netWorth = useMemo(() => {
    return wallets
      .filter(w => w.includeInNetWorth)
      .reduce((sum, w) => {
        const walletTxs = transactions.filter(tx => tx.walletId === w.id);
        const income = walletTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
        const expense = walletTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
        return sum + w.startingBalance + income - expense;
      }, 0);
  }, [wallets, transactions]);

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthTxs = transactions.filter(tx => tx.date >= monthStart);
    const income = monthTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = monthTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    return { income, expense };
  }, [transactions]);

  const todaySpending = useMemo(() => {
    const today = getCurrentDate();
    return transactions
      .filter(tx => tx.type === 'expense' && tx.date === today)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  // Show month-end summary in the last 3 days of the month, once per month
  const monthKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
  }, []);
  const showMonthEndSummary = useMemo(() => {
    if (summaryDismissedKey === monthKey) return false;
    if (transactions.length < 3) return false;
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return now.getDate() >= lastDay - 2;
  }, [summaryDismissedKey, monthKey, transactions.length]);

  const handleDismissSummary = () => {
    localStorage.setItem('monthEndSummaryDismissed', monthKey);
    setSummaryDismissedKey(monthKey);
  };

  const latestTransactions = transactions.slice(0, 5);

  

  const expenseCategories = categories.filter(c => c.type === 'expense');

  const getBudgetSpent = (budget: Budget) => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return transactions
      .filter(tx => {
        if (tx.type !== 'expense') return false;
        if (budget.categoryIds.length > 0 && !budget.categoryIds.includes(tx.categoryId)) return false;
        const txDate = new Date(tx.date);
        if (budget.recurrence === 'monthly') return txDate.getMonth() === month && txDate.getFullYear() === year;
        if (budget.recurrence === 'yearly') return txDate.getFullYear() === year;
        if (budget.recurrence === 'weekly') {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          return txDate >= weekStart;
        }
        return true;
      })
      .reduce((s, tx) => s + tx.amount, 0);
  };

  const handleCreateBudget = () => {
    if (!budgetName.trim() || !budgetAmount) return;
    const budget: Budget = {
      id: `budget-${Date.now()}`,
      name: budgetName.trim(),
      icon: '📊',
      amount: parseFloat(budgetAmount),
      spent: 0,
      categoryIds: budgetCategoryIds,
      startDate: new Date().toISOString().split('T')[0],
      recurrence: budgetRecurrence,
    };
    addBudget(budget);
    setBudgetName('');
    setBudgetAmount('');
    setBudgetCategoryIds([]);
    setBudgetRecurrence('monthly');
    setShowBudgetForm(false);
  };

  const handleCreateReminder = () => {
    if (!reminderTitle.trim() || !reminderAmount) return;
    const reminder: Reminder = {
      id: generateId(),
      title: reminderTitle.trim(),
      amount: parseFloat(reminderAmount),
      categoryId: reminderCatId || expenseCategories[0]?.id || '',
      walletId: reminderWalletId || wallets[0]?.id || '',
      dueDate: reminderDate,
      isPaid: false,
      isRecurring: false,
      createdAt: new Date().toISOString(),
    };
    addReminder(reminder);
    setReminderTitle('');
    setReminderAmount('');
    setReminderDate(getCurrentDate());
    setShowReminderForm(false);
  };

  const handlePayReminder = (reminder: Reminder) => {
    const tx: Transaction = {
      id: generateId(),
      type: 'expense',
      title: reminder.title,
      amount: reminder.amount,
      categoryId: reminder.categoryId,
      walletId: reminder.walletId,
      date: getCurrentDate(),
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString(),
    };
    addTransaction(tx);
    markPaid(reminder.id);
  };

  const toggleCategory = (id: string) => {
    setBudgetCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-5 pt-3 pb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center">
          <span className="text-accent text-sm font-bold">{settings.userName?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-text-muted">{greeting}</p>
          <p className="text-sm font-semibold text-text-primary">{settings.userName} 👋</p>
        </div>
        <button
          onClick={() => updateSettings({ showBalances: !settings.showBalances })}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-bg-card card-shadow"
        >
          {settings.showBalances
            ? <Eye className="w-[18px] h-[18px] text-text-muted" />
            : <EyeOff className="w-[18px] h-[18px] text-text-muted" />
          }
        </button>
      </div>

      <div className="px-5 space-y-4 pb-4">
        {/* Swipeable Balance Cards */}
        <BalanceCarousel
          wallets={wallets}
          transactions={transactions}
          currency={settings.currency}
          showBalances={settings.showBalances}
          monthlyIncome={monthlyStats.income}
          monthlyExpense={monthlyStats.expense}
          netWorth={netWorth}
          onAddWallet={() => navigate('/wallets')}
        />

        {/* Month-end summary (last 3 days of the month) */}
        {showMonthEndSummary && (
          <MonthEndSummary
            transactions={transactions}
            categories={categories}
            currency={settings.currency}
            onDismiss={handleDismissSummary}
            onViewReport={() => navigate('/report')}
          />
        )}

        {/* Spending Insights Pill */}
        {transactions.length > 0 && (
          <SpendingInsights transactions={transactions} currency={settings.currency} />
        )}

        {/* Streak Counter */}
        <StreakCounter transactions={transactions} />

        {/* Daily Spending Limit Tracker */}
        {settings.dailySpendingLimit && settings.dailySpendingLimit > 0 ? (
          <DailyLimitTracker
            spent={todaySpending}
            limit={settings.dailySpendingLimit}
            currency={settings.currency}
            onClick={() => navigate('/settings')}
          />
        ) : transactions.length > 2 ? (
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-bg-card card-shadow active:scale-[0.98] transition-transform"
          >
            <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-xs font-medium text-text-primary flex-1 text-left">
              Set a daily spending limit
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          </button>
        ) : null}

        {/* Quick Actions */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { icon: ArrowUpRight, label: 'Expense', color: 'text-negative', bg: 'bg-negative-soft', action: onAddTransaction },
            { icon: ArrowDownLeft, label: 'Income', color: 'text-positive', bg: 'bg-positive-soft', action: onAddTransaction },
            { icon: Send, label: 'Transfer', color: 'text-accent', bg: 'bg-accent-soft', action: () => setShowTransferSheet(true) },
            { icon: Users, label: 'Split', color: 'text-amber-500', bg: 'bg-amber-500/10', action: () => setShowSplitSheet(true) },
            { icon: Clock, label: 'Reminder', color: 'text-text-secondary', bg: 'bg-bg-secondary', action: () => setShowReminderForm(true) },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-1 py-2.5 rounded-2xl bg-bg-card card-shadow active:scale-[0.97] transition-transform"
            >
              <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <span className="text-[9px] font-medium text-text-secondary">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Upcoming Reminders */}
        {pendingReminders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">Upcoming Payments</h3>
              <span className="text-[10px] text-accent font-medium">{pendingReminders.length} pending</span>
            </div>
            <div className="space-y-2">
              {pendingReminders.slice(0, 2).map(reminder => {
                const isOverdue = reminder.dueDate <= getCurrentDate();
                const cat = categories.find(c => c.id === reminder.categoryId);
                return (
                  <div key={reminder.id} className={`flex items-center gap-3 p-3 rounded-2xl bg-bg-card card-shadow ${isOverdue ? 'ring-1 ring-negative/30' : ''}`}>
                    <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center">
                      {cat ? <CategoryIcon icon={cat.icon} color={cat.color} size={20} /> : <Clock className="w-4 h-4 text-accent" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{reminder.title}</p>
                      <p className={`text-[10px] ${isOverdue ? 'text-negative font-medium' : 'text-text-muted'}`}>
                        {isOverdue ? 'Overdue' : `Due ${formatDate(reminder.dueDate)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary">{formatCurrency(reminder.amount, settings.currency)}</span>
                      <button
                        onClick={() => handlePayReminder(reminder)}
                        className="h-7 px-2.5 rounded-lg bg-positive text-primary-foreground text-[10px] font-semibold"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Budgets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text-primary">{t('budgets')}</h3>
            <button className="text-[11px] font-semibold text-accent" onClick={() => setShowBudgetForm(true)}>+ {t('add')}</button>
          </div>

          {budgets.length === 0 ? (
            <button
              onClick={() => setShowBudgetForm(true)}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-border flex items-center justify-center gap-2 active:bg-bg-secondary/50"
            >
              <Plus className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted font-medium">{t('create_first_budget')}</span>
            </button>
          ) : (
            <div className="space-y-2">
              {budgets.map(budget => {
                const spent = getBudgetSpent(budget);
                const pct = Math.min((spent / budget.amount) * 100, 100);
                const isOver = spent > budget.amount;
                return (
                  <div key={budget.id} className="bg-bg-card rounded-2xl p-3 card-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{budget.icon}</span>
                        <span className="text-xs font-semibold text-text-primary">{budget.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isOver ? 'text-negative' : 'text-text-primary'}`}>
                          {formatCurrency(spent, settings.currency)}
                        </span>
                        <span className="text-[10px] text-text-muted">/ {formatCurrency(budget.amount, settings.currency)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-negative' : 'bg-accent'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Latest Transactions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-text-primary">{t('latest_transactions')}</h3>
            <button onClick={() => navigate('/transactions')} className="text-[11px] font-semibold text-accent flex items-center gap-0.5">
              {t('view_all')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <button
              onClick={onAddTransaction}
              className="w-full p-5 rounded-2xl border-2 border-dashed border-border flex flex-col items-center gap-2 active:bg-bg-secondary/50"
            >
              <span className="text-2xl">💸</span>
              <span className="text-xs text-text-muted font-medium">{t('add_first_expense')}</span>
            </button>
          ) : (
            <div className="bg-bg-card rounded-2xl card-shadow overflow-hidden">
              {latestTransactions.map((tx, i) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={categories.find(c => c.id === tx.categoryId)}
                  wallet={wallets.find(w => w.id === tx.walletId)}
                  currency={settings.currency}
                  showBalances={settings.showBalances}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Budget Creation Bottom Sheet */}
      <BottomSheet open={showBudgetForm} onClose={() => setShowBudgetForm(false)} title="Create Budget">
        <div className="space-y-3">
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Budget Name</span>
            <input
              value={budgetName}
              onChange={e => setBudgetName(e.target.value)}
              placeholder="e.g. Food & Dining"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none mt-0.5"
            />
          </div>
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Budget Amount</span>
            <input
              type="number"
              value={budgetAmount}
              onChange={e => setBudgetAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none mt-0.5"
            />
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-medium px-1 mb-1.5 block">Period</span>
            <div className="flex gap-2">
              {(['weekly', 'monthly', 'yearly'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setBudgetRecurrence(r)}
                  className={`flex-1 h-9 rounded-xl text-xs font-medium transition-colors ${
                    budgetRecurrence === r
                      ? 'bg-accent text-primary-foreground'
                      : 'bg-bg-input text-text-muted'
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-text-muted font-medium px-1 mb-1.5 block">Categories (optional)</span>
            <div className="flex flex-wrap gap-1.5">
              {expenseCategories.map(cat => {
                const selected = budgetCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-medium transition-colors ${
                      selected ? 'bg-accent text-primary-foreground' : 'bg-bg-input text-text-muted'
                    }`}
                  >
                    <CategoryIcon icon={cat.icon} size={16} color={selected ? '#fff' : cat.color} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleCreateBudget}
            disabled={!budgetName.trim() || !budgetAmount}
            className="w-full h-12 rounded-2xl bg-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            Create Budget
          </button>
        </div>
      </BottomSheet>

      {/* Reminder Creation Bottom Sheet */}
      <BottomSheet open={showReminderForm} onClose={() => setShowReminderForm(false)} title="Add Reminder">
        <div className="space-y-3">
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Payment Title</span>
            <input
              value={reminderTitle}
              onChange={e => setReminderTitle(e.target.value)}
              placeholder="e.g. Electricity Bill, Rent..."
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none mt-0.5"
            />
          </div>
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Amount</span>
            <input
              type="number"
              value={reminderAmount}
              onChange={e => setReminderAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none mt-0.5"
            />
          </div>
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Due Date</span>
            <input
              type="date"
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
              className="w-full bg-transparent text-sm text-text-primary outline-none mt-0.5"
            />
          </div>
          {wallets.length > 1 && (
            <div>
              <span className="text-[10px] text-text-muted font-medium px-1 mb-1.5 block">Wallet</span>
              <div className="flex gap-2 overflow-x-auto">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setReminderWalletId(w.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      reminderWalletId === w.id ? 'bg-accent text-primary-foreground' : 'bg-bg-input text-text-muted'
                    }`}
                  >
                    <span>{w.icon}</span> {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleCreateReminder}
            disabled={!reminderTitle.trim() || !reminderAmount}
            className="w-full h-12 rounded-2xl bg-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            Add Reminder
          </button>
        </div>
      </BottomSheet>

      {/* Wallet Transfer Sheet */}
      <WalletTransferSheet
        open={showTransferSheet}
        onClose={() => setShowTransferSheet(false)}
        wallets={wallets}
        transactions={transactions}
        currency={settings.currency}
        onTransfer={(txs) => {
          txs.forEach((t) => addTransaction(t));
        }}
      />

      {/* Split Bill Sheet */}
      <SplitBillSheet
        open={showSplitSheet}
        onClose={() => setShowSplitSheet(false)}
        wallets={wallets}
        categories={categories}
        currency={settings.currency}
        onSave={(tx) => addTransaction(tx)}
      />
    </PageWrapper>
  );
}
