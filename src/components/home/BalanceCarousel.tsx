import React, { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Plus, Wallet as WalletIcon } from 'lucide-react';
import { Wallet, Transaction, Currency } from '@/types';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { WALLET_COLORS } from '@/constants/languages';
import { t } from '@/utils/translations';

interface BalanceCarouselProps {
  wallets: Wallet[];
  transactions: Transaction[];
  currency: Currency;
  showBalances: boolean;
  monthlyIncome: number;
  monthlyExpense: number;
  netWorth: number;
  onAddWallet?: () => void;
}

interface CardData {
  id: string;
  name: string;
  balance: number;
  income: number;
  expense: number;
  start: string;
  end: string;
  isTotal?: boolean;
  icon?: string;
}

export default function BalanceCarousel({
  wallets,
  transactions,
  currency,
  showBalances,
  monthlyIncome,
  monthlyExpense,
  netWorth,
  onAddWallet,
}: BalanceCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    skipSnaps: false,
    duration: 28,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // Build cards: one per wallet (no separate total card — wallets ARE the balance)
  const cards: CardData[] = [
    ...wallets.map((w) => {
      const walletTxs = transactions.filter((tx) => tx.walletId === w.id);
      const income = walletTxs.filter((tx) => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
      const expense = walletTxs.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
      const palette = WALLET_COLORS.find((c) => c.start === w.color);
      return {
        id: w.id,
        name: w.name,
        balance: w.startingBalance + income - expense,
        income,
        expense,
        start: w.color,
        end: palette?.end || w.color + 'CC',
        icon: w.icon,
      };
    }),
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="-mx-5">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex-[0_0_88%] min-w-0 px-2 first:pl-5 last:pr-5"
            >
              <BalanceCard card={card} currency={currency} showBalances={showBalances} />
            </div>
          ))}

          {/* Add wallet card */}
          {onAddWallet && (
            <div className="flex-[0_0_88%] min-w-0 px-2 last:pr-5">
              <button
                onClick={onAddWallet}
                className="w-full h-full min-h-[200px] rounded-3xl border-2 border-dashed border-border bg-bg-card/50 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-accent" />
                </div>
                <p className="text-xs font-semibold text-text-primary">Add Wallet</p>
                <p className="text-[10px] text-text-muted">Track another account</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination dots */}
      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 px-5">
          {scrollSnaps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === selectedIndex ? 'w-5 bg-accent' : 'w-1.5 bg-border'
              }`}
              aria-label={`Go to card ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BalanceCard({
  card,
  currency,
  showBalances,
}: {
  card: CardData;
  currency: Currency;
  showBalances: boolean;
}) {
  const isTotal = card.isTotal;

  return (
    <div className="relative rounded-3xl p-5 pb-4 overflow-hidden card-shadow-lg gradient-card">
      {/* Decorative circles */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border border-primary-foreground/10" />
      <div className="absolute -right-2 -top-2 w-16 h-16 rounded-full border border-primary-foreground/10" />
      <div className="absolute left-6 bottom-14 w-8 h-8 rounded-full bg-primary-foreground/5" />

      {/* Card chip / label row */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 rounded bg-gradient-to-br from-yellow-300/80 to-yellow-500/60 flex items-center justify-center">
            <div className="w-4 h-3 rounded-sm border border-yellow-600/40" />
          </div>
          <span className="text-[10px] text-primary-foreground/60 font-medium tracking-wider uppercase">
            {isTotal ? 'Spendly' : card.icon ? `${card.icon} ${card.name}` : card.name}
          </span>
        </div>
        {isTotal ? (
          <CreditCard className="w-5 h-5 text-primary-foreground/40" />
        ) : (
          <WalletIcon className="w-5 h-5 text-primary-foreground/40" />
        )}
      </div>

      {/* Balance */}
      <div className="relative">
        <p className="text-[10px] text-primary-foreground/60 tracking-wider uppercase mb-1">
          {isTotal ? t('net_worth') : 'Balance'}
        </p>
        <p className="text-[28px] font-display text-primary-foreground leading-tight">
          {showBalances
            ? formatCurrency(card.balance, currency)
            : formatCurrencyHidden(currency)}
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mt-4 relative">
        <div className="flex-1 bg-primary-foreground/10 rounded-xl p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <ArrowDownLeft className="w-3 h-3 text-positive" />
            <span className="text-[9px] text-primary-foreground/60 uppercase tracking-wider">
              {t('income_label')}
            </span>
          </div>
          <p className="text-xs font-semibold text-primary-foreground">
            {showBalances ? formatCurrency(card.income, currency) : '••••'}
          </p>
        </div>
        <div className="flex-1 bg-primary-foreground/10 rounded-xl p-2.5 backdrop-blur-sm">
          <div className="flex items-center gap-1 mb-0.5">
            <ArrowUpRight className="w-3 h-3 text-negative" />
            <span className="text-[9px] text-primary-foreground/60 uppercase tracking-wider">
              {t('expense_label')}
            </span>
          </div>
          <p className="text-xs font-semibold text-primary-foreground">
            {showBalances ? formatCurrency(card.expense, currency) : '••••'}
          </p>
        </div>
      </div>

      {/* Card number dots */}
      <div className="flex items-center gap-4 mt-4 relative">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-1">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="w-1.5 h-1.5 rounded-full bg-primary-foreground/25" />
            ))}
          </div>
        ))}
        <span className="text-[11px] text-primary-foreground/50 font-medium tracking-widest">
          {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}
