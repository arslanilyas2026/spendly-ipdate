import React, { useState, useMemo, useRef, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import TransactionItem from '@/components/transaction/TransactionItem';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatDate, getCurrentDate } from '@/utils/dateHelpers';
import { t } from '@/utils/translations';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Transaction } from '@/types';

const FILTERS = ['today', 'this_week', 'this_month', 'this_year'] as const;
const SORT_OPTIONS = [
  { key: 'date_desc', label: 'Newest first' },
  { key: 'date_asc', label: 'Oldest first' },
  { key: 'amount_desc', label: 'Highest amount' },
  { key: 'amount_asc', label: 'Lowest amount' },
] as const;
const TYPE_OPTIONS = ['all', 'expense', 'income'] as const;

export default function TransactionsScreen() {
  const { settings } = useSettings();
  const { wallets } = useWallets();
  const { transactions, deleteTransaction } = useTransactions();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('this_month');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterPanel(false);
      }
    };
    if (showFilterPanel) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilterPanel]);

  const hasActiveFilters = sortBy !== 'date_desc' || typeFilter !== 'all';

  const filtered = useMemo(() => {
    let result = transactions;
    const now = new Date();
    const today = getCurrentDate();

    if (filter === 'today') result = result.filter(tx => tx.date === today);
    else if (filter === 'this_week') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      result = result.filter(tx => tx.date >= weekAgo);
    } else if (filter === 'this_month') {
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      result = result.filter(tx => tx.date >= monthStart);
    } else if (filter === 'this_year') {
      const yearStart = `${now.getFullYear()}-01-01`;
      result = result.filter(tx => tx.date >= yearStart);
    }

    if (typeFilter !== 'all') {
      result = result.filter(tx => tx.type === typeFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(tx =>
        tx.title.toLowerCase().includes(q) ||
        tx.amount.toString().includes(q) ||
        categories.find(c => c.id === tx.categoryId)?.name.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'date_asc') result = [...result].sort((a, b) => a.date.localeCompare(b.date));
    else if (sortBy === 'amount_desc') result = [...result].sort((a, b) => b.amount - a.amount);
    else if (sortBy === 'amount_asc') result = [...result].sort((a, b) => a.amount - b.amount);

    return result;
  }, [transactions, filter, search, categories, sortBy, typeFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups).sort(([a], [b]) => sortBy === 'date_asc' ? a.localeCompare(b) : b.localeCompare(a));
  }, [filtered, sortBy]);

  const deleteTx = filtered.find(tx => tx.id === deleteId);

  return (
    <PageWrapper>
      <TopBar title={t('all_transactions')} right={
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              hasActiveFilters || showFilterPanel ? 'bg-accent text-primary-foreground' : 'bg-bg-secondary'
            }`}
          >
            <SlidersHorizontal className={`w-4 h-4 ${hasActiveFilters || showFilterPanel ? 'text-primary-foreground' : 'text-text-secondary'}`} />
          </button>

          {/* Filter Dropdown */}
          {showFilterPanel && (
            <div className="absolute right-0 top-11 w-56 bg-bg-card rounded-2xl card-shadow border border-border-subtle p-3 z-50 space-y-3 animate-fade-in">
              {/* Sort */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Sort by</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSortBy(opt.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        sortBy === opt.key ? 'bg-accent text-primary-foreground' : 'bg-bg-secondary text-text-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Type</span>
                <div className="flex gap-1.5 mt-1.5">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setTypeFilter(opt)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                        typeFilter === opt ? 'bg-accent text-primary-foreground' : 'bg-bg-secondary text-text-muted'
                      }`}
                    >
                      {opt === 'all' ? 'All' : t(`${opt}_label`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  onClick={() => { setSortBy('date_desc'); setTypeFilter('all'); }}
                  className="w-full text-center text-[11px] text-negative font-medium py-1"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>
      } />

      <div className="px-4 space-y-3 pb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search_transactions')}
            className="w-full h-11 bg-bg-input rounded-xl pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-accent text-primary-foreground' : 'bg-bg-secondary text-text-muted'
              }`}
            >
              {t(f)}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {filtered.length === 0 ? (
          <div className="bg-bg-card rounded-2xl p-8 flex flex-col items-center card-shadow mt-4">
            <span className="text-3xl mb-2">🔍</span>
            <p className="text-sm text-text-muted text-center">{t('no_transactions_found')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {grouped.map(([dateKey, txs]) => (
              <div key={dateKey}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-text-muted font-medium">{formatDate(dateKey)}</span>
                </div>
                <div className="bg-bg-card rounded-2xl card-shadow px-3">
                  {txs.map((tx) => (
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
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteTransaction(deleteId); }}
        title={`Delete "${deleteTx?.title}"?`}
        message={t('delete_confirm')}
      />
    </PageWrapper>
  );
}
