import React, { useState, useEffect, useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import CategoryIcon from '@/components/ui/CategoryIcon';
import { Wallet, Category, Currency, Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentDate, getCurrentTime, generateId } from '@/utils/dateHelpers';

interface SplitBillSheetProps {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  currency: Currency;
  onSave: (tx: Transaction) => void;
}

export default function SplitBillSheet({
  open,
  onClose,
  wallets,
  categories,
  currency,
  onSave,
}: SplitBillSheetProps) {
  const expenseCategories = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  const [total, setTotal] = useState(0);
  const [people, setPeople] = useState(2);
  const [title, setTitle] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || '');
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    if (open) {
      setTotal(0);
      setPeople(2);
      setTitle('');
      setWalletId(wallets[0]?.id || '');
      setCategoryId(expenseCategories[0]?.id || '');
    }
  }, [open, wallets, expenseCategories]);

  const yourShare = people > 0 ? total / people : 0;
  const canSave = total > 0 && people >= 1 && walletId;

  const handleSave = () => {
    if (!canSave) return;
    const cat = categories.find((c) => c.id === categoryId);
    const tx: Transaction = {
      id: generateId(),
      type: 'expense',
      title: title || `Split: ${cat?.name || 'Bill'}`,
      amount: yourShare,
      categoryId,
      walletId,
      date: getCurrentDate(),
      time: getCurrentTime(),
      note: `Split ${formatCurrency(total, currency)} between ${people} people`,
      createdAt: new Date().toISOString(),
    };
    onSave(tx);
    onClose();
  };

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Split a Bill">
        <div className="space-y-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent-soft">
            <span className="text-xs text-accent font-medium">
              We'll log only your share as an expense
            </span>
          </div>

          {/* Total */}
          <button
            onClick={() => setShowCalc(true)}
            className="w-full py-4 flex flex-col items-center justify-center rounded-2xl bg-bg-secondary/50"
          >
            <span className="text-[10px] text-text-muted uppercase tracking-wider">Total bill</span>
            <span className="text-3xl font-display text-text-primary">
              {currency.symbol} {total > 0 ? total.toLocaleString() : '0.00'}
            </span>
          </button>

          {/* People stepper */}
          <div className="flex items-center justify-between bg-bg-input rounded-xl px-3 py-3">
            <div>
              <p className="text-[10px] text-text-muted font-medium">Split between</p>
              <p className="text-sm font-semibold text-text-primary">
                {people} {people === 1 ? 'person' : 'people'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-9 h-9 rounded-xl bg-bg-card flex items-center justify-center active:scale-95 transition-transform"
              >
                <Minus className="w-4 h-4 text-text-primary" />
              </button>
              <span className="w-8 text-center text-base font-display text-text-primary">{people}</span>
              <button
                onClick={() => setPeople((p) => Math.min(50, p + 1))}
                className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* Your share preview */}
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-accent/15 to-accent/5 border border-accent/20">
            <span className="text-xs font-medium text-text-primary">Your share</span>
            <span className="text-xl font-display text-accent">
              {formatCurrency(yourShare, currency)}
            </span>
          </div>

          {/* Title */}
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">What for? (optional)</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dinner with friends"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none mt-0.5"
            />
          </div>

          {/* Category chips */}
          <div>
            <span className="text-[10px] text-text-muted font-medium px-1 mb-2 block">Category</span>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {expenseCategories.map((c) => {
                const active = c.id === categoryId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
                      active ? 'bg-accent/10 ring-1.5 ring-accent' : 'bg-bg-input active:bg-bg-secondary'
                    }`}
                  >
                    <CategoryIcon icon={c.icon} color={c.color} size={22} />
                    <span className="text-[13px] font-medium text-text-primary whitespace-nowrap">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet chips */}
          <div>
            <span className="text-[10px] text-text-muted font-medium px-1 mb-2 block">Pay from</span>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {wallets.map((w) => {
                const active = w.id === walletId;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWalletId(w.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 whitespace-nowrap ${
                      active ? 'text-primary-foreground' : 'bg-bg-input text-text-primary active:bg-bg-secondary'
                    }`}
                    style={active ? { background: `linear-gradient(135deg, ${w.color}, ${w.color}dd)` } : undefined}
                  >
                    {w.icon} {w.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full h-12 rounded-2xl bg-accent text-primary-foreground font-semibold text-sm disabled:opacity-40"
          >
            Log my share {yourShare > 0 ? `· ${formatCurrency(yourShare, currency)}` : ''}
          </button>
        </div>
      </BottomSheet>

      {showCalc && (
        <Calculator
          value={total}
          currencySymbol={currency.symbol}
          onConfirm={(v) => {
            setTotal(v);
            setShowCalc(false);
          }}
          onClose={() => setShowCalc(false)}
        />
      )}
    </>
  );
}
