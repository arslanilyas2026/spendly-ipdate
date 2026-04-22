import React, { useState, useMemo } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { t } from '@/utils/translations';
import { useNavigate, useParams } from 'react-router-dom';
import { Wallet, RefreshCw, Pencil, Trash2, Plus, Eye, EyeOff, MoreVertical } from 'lucide-react';
import { WALLET_COLORS } from '@/constants/languages';
import TransactionItem from '@/components/transaction/TransactionItem';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TransactionForm from '@/components/transaction/TransactionForm';
import { formatDate } from '@/utils/dateHelpers';

export default function WalletDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const { wallets, updateWallet, deleteWallet } = useWallets();
  const { transactions, addTransaction } = useTransactions();
  const { categories } = useCategories();
  const navigate = useNavigate();

  const wallet = wallets.find(w => w.id === id);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdjustCalc, setShowAdjustCalc] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [editName, setEditName] = useState(wallet?.name || '');
  const [editColor, setEditColor] = useState(wallet?.color || WALLET_COLORS[0].start);

  // Filter transactions for this wallet
  const walletTransactions = useMemo(() =>
    transactions.filter(tx => tx.walletId === id)
      .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()),
    [transactions, id]
  );

  // This month's income and expense
  const thisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthTxs = walletTransactions.filter(tx => tx.date >= monthStart);
    const income = monthTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = monthTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    return { income, expense };
  }, [walletTransactions]);

  // Group transactions by date
  const grouped = useMemo(() => {
    const groups: Record<string, typeof walletTransactions> = {};
    walletTransactions.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return Object.entries(groups);
  }, [walletTransactions]);

  if (!wallet) {
    return (
      <PageWrapper>
        <TopBar title="Wallet" showBack />
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-text-muted">Wallet not found</p>
        </div>
      </PageWrapper>
    );
  }

  const walletEndColor = WALLET_COLORS.find(c => c.start === wallet.color)?.end || wallet.color + '99';

  const handleEditSave = () => {
    updateWallet(wallet.id, { name: editName, color: editColor });
    setShowEditModal(false);
  };

  const handleDelete = () => {
    deleteWallet(wallet.id);
    navigate('/wallets');
  };

  const handleAdjustBalance = (val: number) => {
    updateWallet(wallet.id, { startingBalance: val, currentBalance: val });
    setShowAdjustCalc(false);
  };

  return (
    <PageWrapper>
      <TopBar title="Wallet Details" showBack />

      <div className="px-4 pb-24">
        {/* Action pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4">
          <button
            onClick={() => setShowAdjustCalc(true)}
            className="h-10 px-4 rounded-xl bg-bg-card border border-border text-sm text-text-primary flex items-center gap-2 flex-shrink-0 card-shadow"
          >
            <RefreshCw className="w-4 h-4 text-text-muted" />
            Adjust Balance
          </button>
          <button
            onClick={() => { setEditName(wallet.name); setEditColor(wallet.color); setShowEditModal(true); }}
            className="h-10 px-4 rounded-xl bg-bg-card border border-border text-sm text-text-primary flex items-center gap-2 flex-shrink-0 card-shadow"
          >
            <Pencil className="w-4 h-4 text-text-muted" />
            Edit Wallet
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-10 px-4 rounded-xl bg-bg-card border border-border text-sm text-text-primary flex items-center gap-2 flex-shrink-0 card-shadow"
          >
            <Trash2 className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Wallet Card (expanded) */}
        <div
          className="w-full rounded-2xl p-5 mb-6"
          style={{ background: `linear-gradient(135deg, ${wallet.color}, ${walletEndColor})` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-primary-foreground">{wallet.name}</p>
                <p className="text-xs text-primary-foreground/70">
                  Balance: {settings.showBalances
                    ? formatCurrency(wallet.startingBalance, settings.currency)
                    : formatCurrencyHidden(settings.currency)
                  }
                </p>
              </div>
            </div>
            <button className="w-8 h-8 flex items-center justify-center">
              {settings.showBalances
                ? <Eye className="w-4 h-4 text-primary-foreground/70" />
                : <EyeOff className="w-4 h-4 text-primary-foreground/70" />
              }
            </button>
          </div>

          {/* This Month Breakdown */}
          <div className="bg-primary-foreground/10 rounded-xl p-4">
            <p className="text-xs text-primary-foreground/70 mb-2">This Month</p>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-primary-foreground/60">Income</p>
                <p className="text-base font-display text-primary-foreground">
                  {settings.showBalances
                    ? formatCurrency(thisMonth.income, settings.currency)
                    : formatCurrencyHidden(settings.currency)
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-foreground/60">Expense</p>
                <p className="text-base font-display text-primary-foreground">
                  {settings.showBalances
                    ? formatCurrency(thisMonth.expense, settings.currency)
                    : formatCurrencyHidden(settings.currency)
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <h3 className="text-base font-semibold text-text-primary mb-3">{t('transactions')}</h3>

        {grouped.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 flex flex-col items-center">
            <span className="text-3xl mb-2">📝</span>
            <p className="text-sm text-text-muted text-center mb-3">No transactions for this wallet yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, txs]) => (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-muted">{formatDate(date)}</span>
                </div>
                <div className="bg-bg-card rounded-2xl card-shadow px-3">
                  {txs.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      category={categories.find(c => c.id === tx.categoryId)}
                      wallet={wallet}
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

      {/* Fixed Add Transaction Button */}
      <div className="fixed bottom-6 right-4 left-4 max-w-[430px] mx-auto z-50 flex justify-end">
        <button
          onClick={() => setShowAddTx(true)}
          className="h-12 px-6 rounded-2xl bg-bg-secondary text-text-primary text-sm font-medium flex items-center gap-2 card-shadow border border-border"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Edit Wallet Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Wallet">
        <div className="space-y-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Wallet name..."
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <div className="flex gap-3 overflow-x-auto overflow-y-visible py-2 px-1">
            {WALLET_COLORS.map((c) => (
              <button
                key={c.start}
                onClick={() => setEditColor(c.start)}
                className={`flex-shrink-0 rounded-full transition-transform ${editColor === c.start ? 'ring-2 ring-offset-2 ring-accent scale-110' : ''}`}
                style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${c.start}, ${c.end})` }}
              />
            ))}
          </div>
          <button onClick={handleEditSave} className="w-full h-10 rounded-xl bg-accent text-primary-foreground text-sm font-medium">
            {t('save')}
          </button>
        </div>
      </Modal>

      {/* Adjust Balance Calculator */}
      {showAdjustCalc && (
        <Calculator
          value={wallet.startingBalance}
          currencySymbol={settings.currency.symbol}
          onConfirm={handleAdjustBalance}
          onClose={() => setShowAdjustCalc(false)}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={`Delete "${wallet.name}"?`}
        message="This will remove the wallet. Transactions linked to it will still exist but won't be associated with any wallet."
        confirmText="Delete"
      />

      {/* Add Transaction */}
      <TransactionForm
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
        categories={categories}
        wallets={wallets}
        defaultWalletId={wallet.id}
        onSave={(tx) => {
          addTransaction(tx);
          setShowAddTx(false);
        }}
      />
    </PageWrapper>
  );
}
