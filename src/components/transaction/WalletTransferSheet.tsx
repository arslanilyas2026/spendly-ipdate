import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import { Wallet, Transaction, Currency } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentDate, getCurrentTime, generateId } from '@/utils/dateHelpers';

interface WalletTransferSheetProps {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  transactions: Transaction[];
  currency: Currency;
  onTransfer: (txs: Transaction[]) => void;
}

export default function WalletTransferSheet({
  open,
  onClose,
  wallets,
  transactions,
  currency,
  onTransfer,
}: WalletTransferSheetProps) {
  const [fromId, setFromId] = useState(wallets[0]?.id || '');
  const [toId, setToId] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  const [showCalc, setShowCalc] = useState(false);

  useEffect(() => {
    if (open) {
      setFromId(wallets[0]?.id || '');
      setToId(wallets[1]?.id || wallets[0]?.id || '');
      setAmount(0);
      setNote('');
    }
  }, [open, wallets]);

  const getWalletBalance = (w: Wallet) => {
    const txs = transactions.filter((tx) => tx.walletId === w.id);
    const income = txs.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = txs.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    return w.startingBalance + income - expense;
  };

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);
  const fromBalance = fromWallet ? getWalletBalance(fromWallet) : 0;

  const canSubmit = useMemo(
    () => fromId && toId && fromId !== toId && amount > 0 && amount <= fromBalance,
    [fromId, toId, amount, fromBalance]
  );

  const handleSubmit = () => {
    if (!canSubmit || !fromWallet || !toWallet) return;
    const date = getCurrentDate();
    const time = getCurrentTime();
    const createdAt = new Date().toISOString();
    const groupNote = note || `Transfer ${fromWallet.name} → ${toWallet.name}`;

    const expenseTx: Transaction = {
      id: generateId(),
      type: 'expense',
      title: `→ ${toWallet.name}`,
      amount,
      categoryId: '',
      walletId: fromId,
      date,
      time,
      note: groupNote,
      createdAt,
    };
    const incomeTx: Transaction = {
      id: generateId(),
      type: 'income',
      title: `← ${fromWallet.name}`,
      amount,
      categoryId: '',
      walletId: toId,
      date,
      time,
      note: groupNote,
      createdAt,
    };
    onTransfer([expenseTx, incomeTx]);
    onClose();
  };

  if (wallets.length < 2) {
    return (
      <BottomSheet open={open} onClose={onClose} title="Transfer Money">
        <div className="py-8 text-center">
          <Send className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
          <p className="text-sm text-text-primary font-semibold mb-1">Add another wallet first</p>
          <p className="text-xs text-text-muted">You need at least 2 wallets to transfer money between them.</p>
        </div>
      </BottomSheet>
    );
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Transfer Between Wallets">
        <div className="space-y-3">
          {/* From / To */}
          <div className="flex items-stretch gap-2">
            <WalletPicker
              label="From"
              wallets={wallets}
              value={fromId}
              onChange={(id) => {
                setFromId(id);
                if (id === toId) setToId(wallets.find((w) => w.id !== id)?.id || '');
              }}
              currency={currency}
              getBalance={getWalletBalance}
            />
            <div className="flex items-center justify-center w-8">
              <ArrowRight className="w-4 h-4 text-text-muted" />
            </div>
            <WalletPicker
              label="To"
              wallets={wallets.filter((w) => w.id !== fromId)}
              value={toId}
              onChange={setToId}
              currency={currency}
              getBalance={getWalletBalance}
            />
          </div>

          {/* Amount */}
          <button
            onClick={() => setShowCalc(true)}
            className="w-full py-4 flex items-center justify-center rounded-2xl bg-bg-secondary/50"
          >
            <span className="text-3xl font-display text-accent">
              {currency.symbol} {amount > 0 ? amount.toLocaleString() : '0.00'}
            </span>
          </button>

          {/* Insufficient warning */}
          {amount > 0 && amount > fromBalance && (
            <div className="px-3 py-2 rounded-xl bg-negative-soft text-negative text-xs font-medium">
              Not enough balance in {fromWallet?.name} ({formatCurrency(fromBalance, currency)})
            </div>
          )}

          {/* Note */}
          <div className="bg-bg-input rounded-xl px-3 py-2.5">
            <span className="text-[10px] text-text-muted font-medium">Note (optional)</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Moving to savings"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none mt-0.5"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 rounded-2xl bg-accent text-primary-foreground font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            Transfer {amount > 0 ? formatCurrency(amount, currency) : ''}
          </button>
        </div>
      </BottomSheet>

      {showCalc && (
        <Calculator
          value={amount}
          currencySymbol={currency.symbol}
          onConfirm={(val) => {
            setAmount(val);
            setShowCalc(false);
          }}
          onClose={() => setShowCalc(false)}
        />
      )}
    </>
  );
}

function WalletPicker({
  label,
  wallets,
  value,
  onChange,
  currency,
  getBalance,
}: {
  label: string;
  wallets: Wallet[];
  value: string;
  onChange: (id: string) => void;
  currency: Currency;
  getBalance: (w: Wallet) => number;
}) {
  const selected = wallets.find((w) => w.id === value) || wallets[0];
  return (
    <div className="flex-1">
      <span className="text-[10px] text-text-muted font-medium px-1 mb-1 block">{label}</span>
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        {wallets.map((w) => {
          const isActive = w.id === selected?.id;
          return (
            <button
              key={w.id}
              onClick={() => onChange(w.id)}
              className={`flex-shrink-0 px-2.5 py-2 rounded-xl text-left transition-all ${
                isActive ? 'text-primary-foreground shadow-md' : 'bg-bg-input text-text-primary'
              }`}
              style={isActive ? { background: `linear-gradient(135deg, ${w.color}, ${w.color}dd)` } : undefined}
            >
              <p className={`text-[11px] font-semibold ${isActive ? 'text-primary-foreground' : ''}`}>
                {w.name}
              </p>
              <p className={`text-[9px] ${isActive ? 'text-primary-foreground/80' : 'text-text-muted'}`}>
                {formatCurrency(getBalance(w), currency)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
