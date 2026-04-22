import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency } from '@/utils/formatCurrency';
import { t } from '@/utils/translations';
import { ChevronLeft, ChevronRight, MoreVertical, TrendingUp, TrendingDown, Triangle } from 'lucide-react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

function getWeeksOfMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks: { start: Date; end: Date; label: string }[] = [];
  let weekStart = new Date(firstDay);
  let weekNum = 1;

  while (weekStart <= lastDay) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    if (weekEnd > lastDay) weekEnd.setTime(lastDay.getTime());
    weeks.push({
      start: new Date(weekStart),
      end: new Date(weekEnd),
      label: `Week ${weekNum}`,
    });
    weekStart.setDate(weekStart.getDate() + 7);
    weekNum++;
  }
  return weeks;
}

function formatShortDate(d: Date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default function ReportScreen() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { wallets } = useWallets();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [monthOffset, setMonthOffset] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [flowTab, setFlowTab] = useState<'outflow' | 'inflow'>('outflow');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const currentMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isThisMonth = monthOffset === 0;

  const monthTxs = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [transactions, currentMonth]);

  const totalIncome = monthTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = monthTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
  const netChange = totalIncome - totalExpense;

  // Weeks of month
  const weeks = useMemo(() => getWeeksOfMonth(currentMonth.getFullYear(), currentMonth.getMonth()), [currentMonth]);
  
  // Determine current week
  const currentWeekIndex = useMemo(() => {
    const today = new Date();
    if (today.getFullYear() === currentMonth.getFullYear() && today.getMonth() === currentMonth.getMonth()) {
      const idx = weeks.findIndex(w => today >= w.start && today <= w.end);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  }, [weeks, currentMonth]);

  const [selectedWeek, setSelectedWeek] = useState(currentWeekIndex);
  
  useEffect(() => { setSelectedWeek(currentWeekIndex); }, [currentWeekIndex]);

  // Week transactions
  const weekTxs = useMemo(() => {
    if (!weeks[selectedWeek]) return [];
    const ws = weeks[selectedWeek].start.toISOString().split('T')[0];
    const we = weeks[selectedWeek].end.toISOString().split('T')[0];
    return monthTxs.filter(tx => tx.date >= ws && tx.date <= we);
  }, [monthTxs, weeks, selectedWeek]);

  const weekIncome = weekTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
  const weekExpense = weekTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);

  // Balance trend data (daily cumulative)
  const balanceTrendData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const startingBalance = wallets
      .filter(w => w.includeInNetWorth)
      .reduce((sum, w) => sum + w.startingBalance, 0);

    // Get all transactions before this month for starting balance
    const priorTxs = transactions.filter(tx => {
      const d = new Date(tx.date);
      return d < new Date(year, month, 1);
    });
    const priorBalance = priorTxs.reduce((sum, tx) => {
      return sum + (tx.type === 'income' ? tx.amount : tx.type === 'expense' ? -tx.amount : 0);
    }, startingBalance);

    const data: { day: string; balance: number }[] = [];
    let runningBalance = priorBalance;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayTxs = monthTxs.filter(tx => tx.date === dateStr);
      dayTxs.forEach(tx => {
        if (tx.type === 'income') runningBalance += tx.amount;
        else if (tx.type === 'expense') runningBalance -= tx.amount;
      });
      data.push({ day: String(d), balance: runningBalance });
    }
    return { data, startBalance: priorBalance, endBalance: runningBalance };
  }, [monthTxs, transactions, wallets, currentMonth]);

  // Category breakdown for outflow/inflow
  const categoryBreakdown = useMemo(() => {
    const type = flowTab === 'outflow' ? 'expense' : 'income';
    const map: Record<string, number> = {};
    monthTxs.filter(tx => tx.type === type).forEach(tx => {
      map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
    });
    return Object.entries(map)
      .map(([catId, amount]) => ({
        category: categories.find(c => c.id === catId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthTxs, categories, flowTab]);

  const flowTotal = flowTab === 'outflow' ? totalExpense : totalIncome;

  const DONUT_COLORS = ['#5B5FEF', '#EC4899', '#F97316', '#16A34A', '#8B5CF6', '#0D9488', '#EF4444', '#F59E0B'];

  // Daily bar chart for selected week
  const weekDailyData = useMemo(() => {
    if (!weeks[selectedWeek]) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const ws = weeks[selectedWeek].start;
    const we = weeks[selectedWeek].end;
    const data: { day: string; expense: number; income: number }[] = [];
    const d = new Date(ws);
    while (d <= we) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTxs = monthTxs.filter(tx => tx.date === dateStr);
      data.push({
        day: days[d.getDay()],
        expense: dayTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0),
        income: dayTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0),
      });
      d.setDate(d.getDate() + 1);
    }
    return data;
  }, [monthTxs, weeks, selectedWeek]);

  return (
    <PageWrapper>
      <TopBar title={t('report')} right={
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${showMenu ? 'bg-accent text-primary-foreground' : ''}`}
          >
            <MoreVertical className={`w-5 h-5 ${showMenu ? 'text-primary-foreground' : 'text-text-muted'}`} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-11 w-44 bg-bg-card rounded-2xl card-shadow border border-border-subtle p-2 z-50 animate-fade-in">
              <button onClick={() => { setMonthOffset(0); setShowMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary active:bg-bg-secondary">
                Reset to Current
              </button>
              <button onClick={() => { navigate('/transactions'); setShowMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-text-secondary active:bg-bg-secondary">
                View All Transactions
              </button>
            </div>
          )}
        </div>
      } />

      <div className="px-4 space-y-4 pb-4">
        {/* Period Nav */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display text-text-primary">
            {isThisMonth ? 'This Month' : monthLabel}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setMonthOffset(m => m - 1)} className="w-9 h-9 rounded-xl bg-bg-secondary flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <button onClick={() => setMonthOffset(m => m + 1)} className="w-9 h-9 rounded-xl bg-bg-secondary flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary">Summary</h3>
            <div className="flex items-center gap-1">
              <Triangle className={`w-3 h-3 ${netChange >= 0 ? 'text-positive' : 'text-negative rotate-180'}`} fill="currentColor" />
              <span className={`text-xs font-semibold ${netChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(Math.abs(netChange), settings.currency)}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-positive/10 rounded-xl p-3">
              <span className="text-[10px] text-positive/70 font-medium">{t('income_label')}</span>
              <p className="text-sm font-display text-positive mt-0.5">{formatCurrency(totalIncome, settings.currency)}</p>
            </div>
            <div className="flex-1 bg-negative/10 rounded-xl p-3">
              <span className="text-[10px] text-negative/70 font-medium">{t('expense_label')}</span>
              <p className="text-sm font-display text-negative mt-0.5">{formatCurrency(totalExpense, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="bg-bg-card rounded-2xl card-shadow overflow-hidden">
          {/* Week date range header */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">
                {weeks[selectedWeek] ? `${formatShortDate(weeks[selectedWeek].start)} to ${formatShortDate(weeks[selectedWeek].end)}` : ''}
              </h3>
              <div className="flex items-center gap-1">
                <Triangle className={`w-3 h-3 ${(weekIncome - weekExpense) >= 0 ? 'text-positive' : 'text-negative rotate-180'}`} fill="currentColor" />
                <span className={`text-xs font-semibold ${(weekIncome - weekExpense) >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(Math.abs(weekIncome - weekExpense), settings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly bar chart */}
          {weekDailyData.length > 0 && (weekExpense > 0 || weekIncome > 0) ? (
            <div className="px-2 py-2">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={weekDailyData} barGap={2}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Bar dataKey="expense" fill="hsl(var(--negative))" radius={[3, 3, 0, 0]} barSize={10} />
                  <Bar dataKey="income" fill="hsl(var(--positive))" radius={[3, 3, 0, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-text-muted">No data</p>
            </div>
          )}

          {/* Week tabs */}
          <div className="flex border-t border-border-subtle">
            {weeks.map((w, i) => (
              <button
                key={i}
                onClick={() => setSelectedWeek(i)}
                className={`flex-1 py-2.5 text-[10px] font-medium text-center transition-colors relative ${
                  selectedWeek === i ? 'text-accent' : 'text-text-muted'
                }`}
              >
                {w.label}
                {selectedWeek === i && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-accent rounded-full" />}
              </button>
            ))}
          </div>

          {/* Week income/expense */}
          <div className="flex gap-3 px-4 py-3 border-t border-border-subtle">
            <div className="flex-1 bg-positive/10 rounded-xl p-2.5">
              <span className="text-[10px] text-positive/70 font-medium">{t('income_label')}</span>
              <p className="text-xs font-display text-positive mt-0.5">{formatCurrency(weekIncome, settings.currency)}</p>
            </div>
            <div className="flex-1 bg-negative/10 rounded-xl p-2.5">
              <span className="text-[10px] text-negative/70 font-medium">{t('expense_label')}</span>
              <p className="text-xs font-display text-negative mt-0.5">{formatCurrency(weekExpense, settings.currency)}</p>
            </div>
          </div>
        </div>

        {/* Balance Trend */}
        <div className="bg-bg-card rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-text-primary">Balance Trend</h3>
            <div className="flex items-center gap-1">
              <Triangle className={`w-3 h-3 ${netChange >= 0 ? 'text-positive' : 'text-negative rotate-180'}`} fill="currentColor" />
              <span className={`text-xs font-semibold ${netChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                {formatCurrency(Math.abs(netChange), settings.currency)}
              </span>
            </div>
          </div>
          <div className="flex justify-between mb-3">
            <div>
              <span className="text-[10px] text-text-muted">Starting Balance</span>
              <p className="text-xs font-display text-text-primary">{formatCurrency(balanceTrendData.startBalance, settings.currency)}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-text-muted">Ending Balance</span>
              <p className="text-xs font-display text-text-primary">{formatCurrency(balanceTrendData.endBalance, settings.currency)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={balanceTrendData.data}>
              <XAxis dataKey="day" tick={{ fontSize: 8, fill: 'hsl(var(--text-muted))' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value, settings.currency), 'Balance']}
                contentStyle={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border-subtle))', borderRadius: '8px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="balance" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Outflow / Inflow with Donut */}
        <div className="bg-bg-card rounded-2xl card-shadow overflow-hidden">
          {/* Toggle */}
          <div className="p-4 pb-0">
            <div className="flex bg-bg-secondary rounded-xl p-1">
              <button
                onClick={() => setFlowTab('outflow')}
                className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                  flowTab === 'outflow' ? 'bg-bg-card text-text-primary card-shadow' : 'text-text-muted'
                }`}
              >
                − Outflow
              </button>
              <button
                onClick={() => setFlowTab('inflow')}
                className={`flex-1 h-8 rounded-lg text-xs font-medium transition-colors ${
                  flowTab === 'inflow' ? 'bg-bg-card text-text-primary card-shadow' : 'text-text-muted'
                }`}
              >
                + Inflow
              </button>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="flex justify-center py-4 relative">
            {categoryBreakdown.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.map(c => ({ name: c.category?.name || 'Other', value: c.amount }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">All Categories</span>
                  <span className="text-sm font-display text-text-primary">{formatCurrency(flowTotal, settings.currency)}</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={[{ value: 1 }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                      <Cell fill="hsl(var(--bg-secondary))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-text-muted">All Categories</span>
                  <span className="text-sm font-display text-text-primary">{formatCurrency(0, settings.currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Category Legend */}
          {categoryBreakdown.length > 0 && (
            <div className="px-4 pb-3 space-y-2">
              {categoryBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  {item.category && <CategoryIcon icon={item.category.icon} color={item.category.color} size={24} />}
                  <span className="text-xs text-text-primary flex-1">{item.category?.name || 'Other'}</span>
                  <span className="text-xs text-text-secondary font-medium">{formatCurrency(item.amount, settings.currency)}</span>
                  <span className="text-[10px] text-text-muted w-8 text-right">
                    {flowTotal > 0 ? `${Math.round((item.amount / flowTotal) * 100)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* View Transactions Button */}
          <div className="px-4 pb-4 pt-1">
            <button
              onClick={() => navigate('/transactions')}
              className="w-full h-10 rounded-xl border border-border-subtle text-xs font-medium text-text-secondary active:bg-bg-secondary transition-colors"
            >
              View Transactions
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}