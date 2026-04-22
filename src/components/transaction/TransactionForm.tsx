import React, { useState, useMemo } from 'react';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Category, Transaction, Wallet, TransactionTemplate } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, formatTime, getCurrentDate, getCurrentTime, generateId } from '@/utils/dateHelpers';
import { t } from '@/utils/translations';
import { useSettings } from '@/hooks/useSettings';
import { useTransactions } from '@/hooks/useTransactions';
import { useTemplates } from '@/hooks/useTemplates';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import Modal from '@/components/ui/Modal';
import { ChevronDown, Calendar, Clock, Bookmark, BookmarkCheck, Zap, Sparkles } from 'lucide-react';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: Wallet[];
  onSave: (tx: Transaction) => void;
  editTransaction?: Transaction | null;
  defaultWalletId?: string;
}

export default function TransactionForm({ open, onClose, categories, wallets, onSave, editTransaction, defaultWalletId }: TransactionFormProps) {
  const { settings } = useSettings();
  const { transactions } = useTransactions();
  const { templates, addTemplate } = useTemplates();
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount || 0);
  const [title, setTitle] = useState(editTransaction?.title || '');
  const [categoryId, setCategoryId] = useState(editTransaction?.categoryId || '');
  const [walletId, setWalletId] = useState(editTransaction?.walletId || defaultWalletId || wallets[0]?.id || '');
  const [date, setDate] = useState(editTransaction?.date || getCurrentDate());
  const [time, setTime] = useState(editTransaction?.time || getCurrentTime());
  const [note, setNote] = useState(editTransaction?.note || '');
  const [spendingType, setSpendingType] = useState<'essential' | 'want' | 'impulse' | undefined>(editTransaction?.spendingType);
  const [showCalc, setShowCalc] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredCategories = categories.filter(c => c.type === type);
  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedWallet = wallets.find(w => w.id === walletId);

  // Smart category suggestion based on past transactions matching the title
  const suggestedCategory = useMemo(() => {
    const q = title.trim().toLowerCase();
    if (!q || q.length < 2 || categoryId) return null;
    const scores: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type !== type || !tx.categoryId) continue;
      const t = (tx.title || '').toLowerCase();
      if (!t) continue;
      let score = 0;
      if (t === q) score = 5;
      else if (t.startsWith(q) || q.startsWith(t)) score = 3;
      else if (t.includes(q) || q.includes(t)) score = 2;
      if (score > 0) scores[tx.categoryId] = (scores[tx.categoryId] || 0) + score;
    }
    const topId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!topId) return null;
    return filteredCategories.find(c => c.id === topId) || null;
  }, [title, type, categoryId, transactions, filteredCategories]);

  const getWalletBalance = (wallet: Wallet) => {
    const walletTxs = transactions.filter(tx => tx.walletId === wallet.id);
    const income = walletTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = walletTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    return wallet.startingBalance + income - expense;
  };

  const formattedDate = useMemo(() => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [date]);

  const formattedTime = useMemo(() => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }, [time]);

  const applyTemplate = (tmpl: TransactionTemplate) => {
    setType(tmpl.type);
    setAmount(tmpl.amount);
    setCategoryId(tmpl.categoryId);
    setWalletId(tmpl.walletId);
    if (tmpl.note) setNote(tmpl.note);
    if (tmpl.spendingType) setSpendingType(tmpl.spendingType);
    setTitle(tmpl.name);
    setShowTemplates(false);
  };

  const handleSave = () => {
    if (amount <= 0) return;
    const tx: Transaction = {
      id: editTransaction?.id || generateId(),
      type,
      title: title || (selectedCategory?.name || 'Transaction'),
      amount,
      categoryId: categoryId || filteredCategories[0]?.id || '',
      walletId,
      date,
      time,
      note: note || undefined,
      spendingType,
      isRecurring: false,
      createdAt: editTransaction?.createdAt || new Date().toISOString(),
    };

    if (saveAsTemplate) {
      const tmpl: TransactionTemplate = {
        id: generateId(),
        name: tx.title,
        type: tx.type,
        amount: tx.amount,
        categoryId: tx.categoryId,
        walletId: tx.walletId,
        note: tx.note,
        spendingType: tx.spendingType,
        createdAt: new Date().toISOString(),
      };
      addTemplate(tmpl);
    }

    onSave(tx);
    onClose();
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title={editTransaction ? t('edit_transaction') : t('add_transaction')}>
        <div className="space-y-3">
          {/* Templates Quick Access */}
          {templates.length > 0 && !editTransaction && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Quick Templates</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {templates.slice(0, 5).map(tmpl => {
                  const cat = categories.find(c => c.id === tmpl.categoryId);
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => applyTemplate(tmpl)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-secondary active:bg-accent-soft transition-colors"
                    >
                      {cat && <CategoryIcon icon={cat.icon} color={cat.color} size={18} />}
                      <span className="text-xs font-medium text-text-primary">{tmpl.name}</span>
                      <span className="text-[10px] text-text-muted">{formatCurrency(tmpl.amount, settings.currency)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex bg-bg-secondary rounded-xl p-1">
            {(['expense', 'income', 'transfer'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => { setType(tp); setCategoryId(''); }}
                className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${
                  type === tp ? 'bg-bg-card text-text-primary card-shadow' : 'text-text-muted'
                }`}
              >
                {t(tp)}
              </button>
            ))}
          </div>

          {/* Amount */}
          <button
            onClick={() => setShowCalc(true)}
            className="w-full py-4 flex items-center justify-center rounded-2xl bg-bg-secondary/50"
          >
            <span className="text-3xl font-display text-accent">
              {settings.currency.symbol} {amount > 0 ? amount.toLocaleString() : '0.00'}
            </span>
          </button>

          {/* Date & Time Row */}
          <div className="flex gap-3">
            <label className="flex-1 relative">
              <div className="bg-bg-input rounded-xl px-3 py-2.5">
                <span className="text-[10px] text-text-muted font-medium">Date</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-sm text-text-primary font-medium">{formattedDate}</span>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <label className="flex-1 relative">
              <div className="bg-bg-input rounded-xl px-3 py-2.5">
                <span className="text-[10px] text-text-muted font-medium">Time</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-sm text-text-primary font-medium">{formattedTime}</span>
                </div>
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Name */}
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Name</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Transaction"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none mt-0.5"
            />
          </div>

          {/* Smart category suggestion */}
          {suggestedCategory && (
            <button
              onClick={() => setCategoryId(suggestedCategory.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-soft border border-accent/20 animate-fade-in"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span className="text-[11px] text-text-muted">Suggested:</span>
              <CategoryIcon icon={suggestedCategory.icon} color={suggestedCategory.color} size={18} />
              <span className="text-xs font-semibold text-text-primary flex-1 text-left">
                {suggestedCategory.name}
              </span>
              <span className="text-[10px] text-accent font-semibold">Tap to use</span>
            </button>
          )}

          {/* Category */}
          <button
            onClick={() => setShowCategoryPicker(true)}
            className="w-full bg-bg-input rounded-xl px-3 py-2.5 text-left"
          >
            <span className="text-[10px] text-text-muted font-medium">Category</span>
            <div className="flex items-center gap-2 mt-0.5">
              {selectedCategory ? (
                <>
                  <CategoryIcon icon={selectedCategory.icon} color={selectedCategory.color} size={22} />
                  <span className="text-sm text-text-primary font-medium flex-1">{selectedCategory.name}</span>
                </>
              ) : (
                <span className="text-sm text-text-muted flex-1">Select a category</span>
              )}
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </div>
          </button>

          {/* Wallet Selector */}
          <div>
            <span className="text-[10px] text-text-muted font-medium px-1 mb-1.5 block">Wallet</span>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {wallets.map((w) => {
                const balance = getWalletBalance(w);
                const isSelected = walletId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWalletId(w.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isSelected
                        ? 'text-primary-foreground shadow-lg'
                        : 'bg-bg-input text-text-primary'
                    }`}
                    style={isSelected ? { background: `linear-gradient(135deg, ${w.color}, ${w.color}dd)` } : undefined}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${isSelected ? 'bg-primary-foreground/20' : 'bg-bg-secondary'}`}>
                      {w.icon}
                    </div>
                    <div className="text-left">
                      <p className={`text-xs font-semibold ${isSelected ? 'text-primary-foreground' : ''}`}>{w.name}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-text-muted'}`}>
                        {formatCurrency(balance, settings.currency)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spending Type (expense only) */}
          {type === 'expense' && (
            <div className="flex gap-2">
              {(['essential', 'want', 'impulse'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSpendingType(spendingType === st ? undefined : st)}
                  className={`flex-1 h-8 rounded-xl text-[11px] font-medium border transition-colors ${
                    spendingType === st
                      ? st === 'essential' ? 'bg-positive-soft text-positive border-positive/30'
                        : st === 'want' ? 'bg-accent-soft text-accent border-accent/30'
                        : 'bg-negative-soft text-negative border-negative/30'
                      : 'border-border text-text-muted'
                  }`}
                >
                  {t(st)}
                </button>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Other Notes</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Insert your additional notes here"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none resize-none mt-0.5"
              rows={2}
            />
          </div>

          {/* Save as Template Toggle */}
          {!editTransaction && (
            <button
              onClick={() => setSaveAsTemplate(!saveAsTemplate)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                saveAsTemplate ? 'bg-accent-soft' : 'bg-bg-secondary'
              }`}
            >
              {saveAsTemplate ? (
                <BookmarkCheck className="w-4 h-4 text-accent" />
              ) : (
                <Bookmark className="w-4 h-4 text-text-muted" />
              )}
              <span className={`text-xs font-medium ${saveAsTemplate ? 'text-accent' : 'text-text-muted'}`}>
                Save as template
              </span>
            </button>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={amount <= 0}
            className="w-full h-12 rounded-2xl bg-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            {t('save')}
          </button>
        </div>
      </BottomSheet>

      {/* Category Picker Modal */}
      <Modal open={showCategoryPicker} onClose={() => setShowCategoryPicker(false)} title={t('category')}>
        <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                categoryId === cat.id ? 'bg-accent-soft ring-1 ring-accent' : 'active:bg-bg-secondary'
              }`}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} size={36} />
              <span className="text-[11px] text-text-primary text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Calculator */}
      {showCalc && (
        <Calculator
          value={amount}
          currencySymbol={settings.currency.symbol}
          onConfirm={(val) => { setAmount(val); setShowCalc(false); }}
          onClose={() => setShowCalc(false)}
        />
      )}
    </>
  );
}
