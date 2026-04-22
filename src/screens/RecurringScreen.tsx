import React, { useState, useEffect } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import { ArrowLeft, Plus, X, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { useWallets } from '@/hooks/useWallets';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/utils/formatCurrency';
import { storage } from '@/store/storage';
import { RecurringTransaction } from '@/types';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { t } from '@/utils/translations';

export default function RecurringScreen() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { wallets } = useWallets();
  const { settings } = useSettings();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState('');
  const [frequency, setFrequency] = useState<RecurringTransaction['frequency']>('monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    storage.getRecurring?.()?.then?.((r: RecurringTransaction[]) => setItems(r || [])).catch(() => {});
  }, []);

  const save = async (updated: RecurringTransaction[]) => {
    setItems(updated);
    if (storage.saveRecurring) await storage.saveRecurring(updated);
  };

  const handleAdd = () => {
    if (!title.trim() || !amount || !categoryId) return;
    const item: RecurringTransaction = {
      id: `rec-${Date.now()}`,
      title: title.trim(),
      amount: parseFloat(amount),
      categoryId,
      walletId: walletId || wallets[0]?.id || '',
      frequency,
      nextDueDate,
      note: note.trim() || undefined,
    };
    save([...items, item]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    save(items.filter(i => i.id !== id));
  };

  const resetForm = () => {
    setTitle(''); setAmount(''); setCategoryId(''); setWalletId('');
    setFrequency('monthly'); setNote(''); setShowForm(false);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <PageWrapper>
      <div className="px-4 h-14 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </button>
        <h1 className="text-base font-semibold text-text-primary flex-1">{t('manage_recurring')}</h1>
        <button onClick={() => setShowForm(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 pb-8 space-y-3">
        {items.length === 0 ? (
          <div className="bg-bg-card rounded-2xl p-8 flex flex-col items-center card-shadow mt-4">
            <RefreshCw className="w-10 h-10 text-text-muted mb-3" />
            <p className="text-sm text-text-muted text-center mb-3">No recurring transactions yet</p>
            <button onClick={() => setShowForm(true)} className="h-9 px-4 rounded-xl bg-accent-soft text-accent text-xs font-medium">
              + Add Recurring
            </button>
          </div>
        ) : (
          items.map(item => {
            const cat = categories.find(c => c.id === item.categoryId);
            const wallet = wallets.find(w => w.id === item.walletId);
            return (
              <div key={item.id} className="bg-bg-card rounded-2xl p-4 card-shadow flex items-center gap-3">
                {cat && <CategoryIcon icon={cat.icon} color={cat.color} size={40} />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                  <p className="text-[10px] text-text-muted">
                    {item.frequency} · {wallet?.name || 'Unknown'} · Next: {item.nextDueDate}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-red-500">
                    -{formatCurrency(item.amount, settings.currency)}
                  </p>
                  <button onClick={() => handleDelete(item.id)} className="text-text-muted mt-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Form Bottom Sheet */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative w-full max-w-[430px] bg-bg-card rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-text-primary">Add Recurring</h3>
              <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-full bg-border/50">
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Netflix Subscription"
                  className="w-full h-11 px-3 rounded-xl bg-bg-base border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                  className="w-full h-11 px-3 rounded-xl bg-bg-base border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(f => (
                    <button key={f} onClick={() => setFrequency(f)}
                      className={`h-9 rounded-xl text-xs font-medium transition-colors ${frequency === f ? 'bg-accent text-primary-foreground' : 'bg-bg-base border border-border text-text-muted'}`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {expenseCategories.map(cat => (
                    <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium transition-colors ${categoryId === cat.id ? 'bg-accent text-primary-foreground' : 'bg-bg-base border border-border text-text-secondary'}`}>
                      <CategoryIcon icon={cat.icon} size={24} color={categoryId === cat.id ? '#fff' : cat.color} />
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {wallets.length > 1 && (
                <div>
                  <label className="text-xs text-text-muted mb-1.5 block">Wallet</label>
                  <div className="flex gap-2 flex-wrap">
                    {wallets.map(w => (
                      <button key={w.id} onClick={() => setWalletId(w.id)}
                        className={`h-9 px-3 rounded-xl text-xs font-medium transition-colors ${walletId === w.id ? 'bg-accent text-primary-foreground' : 'bg-bg-base border border-border text-text-muted'}`}>
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Next Due Date</label>
                <input type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-bg-base border border-border text-sm text-text-primary focus:outline-none focus:border-accent" />
              </div>

              <div>
                <label className="text-xs text-text-muted mb-1.5 block">Note (optional)</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
                  className="w-full h-11 px-3 rounded-xl bg-bg-base border border-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent" />
              </div>

              <button onClick={handleAdd} disabled={!title.trim() || !amount || !categoryId}
                className="w-full h-12 rounded-2xl bg-accent text-primary-foreground font-medium text-sm disabled:opacity-40 transition-opacity">
                Add Recurring
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
