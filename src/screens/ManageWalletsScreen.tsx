import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { t } from '@/utils/translations';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ArrowUpDown, Wallet } from 'lucide-react';
import { Wallet as WalletType } from '@/types';
import { generateId } from '@/utils/dateHelpers';
import { WALLET_COLORS } from '@/constants/languages';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import Modal from '@/components/ui/Modal';

export default function ManageWalletsScreen() {
  const { settings } = useSettings();
  const { wallets, addWallet } = useWallets();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [showAddForm, setShowAddForm] = useState(searchParams.get('add') === '1');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'date' | 'amount'>('date');

  const [walletName, setWalletName] = useState('');
  const [walletColor, setWalletColor] = useState(WALLET_COLORS[0].start);
  const [startingBalance, setStartingBalance] = useState(0);
  const [showCalc, setShowCalc] = useState(false);

  const sortedWallets = [...wallets].sort((a, b) => {
    if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
    if (sortBy === 'amount') return b.startingBalance - a.startingBalance;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleSaveWallet = () => {
    if (!walletName.trim()) return;
    const wallet: WalletType = {
      id: generateId(),
      name: walletName,
      icon: 'wallet',
      color: walletColor,
      startingBalance,
      currentBalance: startingBalance,
      includeInNetWorth: true,
      createdAt: new Date().toISOString(),
    };
    addWallet(wallet);
    setWalletName('');
    setStartingBalance(0);
    setShowAddForm(false);
  };

  const sortOptions = [
    { value: 'alphabetical' as const, label: 'Alphabetically' },
    { value: 'date' as const, label: 'By Date Created' },
    { value: 'amount' as const, label: 'By Amount' },
  ];

  return (
    <PageWrapper>
      <TopBar
        title={t('cards_wallets')}
        showBack
        right={
          <button onClick={() => setShowSortModal(true)} className="w-9 h-9 flex items-center justify-center rounded-xl">
            <ArrowUpDown className="w-5 h-5 text-text-muted" />
          </button>
        }
      />

      <div className="px-4 pb-24">
        {/* Wallet Grid */}
        <div className="grid grid-cols-2 gap-3">
          {sortedWallets.map((wallet) => {
            const walletEndColor = WALLET_COLORS.find(c => c.start === wallet.color)?.end || wallet.color + '99';
            return (
              <button
                key={wallet.id}
                onClick={() => navigate(`/wallet/${wallet.id}`)}
                className="h-[140px] rounded-2xl p-4 flex flex-col justify-between text-left active:scale-[0.97] transition-transform"
                style={{ background: `linear-gradient(135deg, ${wallet.color}, ${walletEndColor})` }}
              >
                <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-primary-foreground/70 mb-0.5">{wallet.name}</p>
                  <p className="text-base font-display text-primary-foreground">
                    {settings.showBalances
                      ? formatCurrency(wallet.startingBalance, settings.currency)
                      : formatCurrencyHidden(settings.currency)
                    }
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {wallets.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-10 flex flex-col items-center mt-4">
            <span className="text-4xl mb-3">💳</span>
            <p className="text-sm text-text-muted text-center mb-4">No wallets yet. Create your first one!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="h-10 px-5 rounded-xl bg-bg-secondary text-text-primary text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('add_wallet')}
            </button>
          </div>
        )}
      </div>

      {/* Fixed Add Wallet Button */}
      {wallets.length > 0 && (
        <div className="fixed bottom-6 right-4 max-w-[430px] z-50">
          <button
            onClick={() => setShowAddForm(true)}
            className="h-12 px-6 rounded-2xl bg-bg-secondary text-text-primary text-sm font-medium flex items-center gap-2 card-shadow border border-border"
          >
            <Plus className="w-4 h-4" />
            {t('add_wallet')}
          </button>
        </div>
      )}

      {/* Sort Modal */}
      <Modal open={showSortModal} onClose={() => setShowSortModal(false)} title="Sort All Wallets">
        <p className="text-xs text-text-muted mb-4">Your selected sorting option will apply to all wallets.</p>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value); setShowSortModal(false); }}
              className={`w-full h-12 flex items-center justify-between px-3 rounded-xl text-sm ${
                sortBy === opt.value ? 'bg-accent-soft text-accent font-medium' : 'text-text-primary active:bg-bg-secondary'
              }`}
            >
              <span>{opt.label}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                sortBy === opt.value ? 'border-accent' : 'border-border'
              }`}>
                {sortBy === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Add Wallet Form */}
      <BottomSheet open={showAddForm} onClose={() => setShowAddForm(false)} title={t('add_wallet')}>
        <div className="space-y-3">
          {/* Preview Card */}
          <div
            className="w-full h-[100px] rounded-2xl p-4 flex flex-col justify-between"
            style={{ background: `linear-gradient(135deg, ${walletColor}, ${WALLET_COLORS.find(c => c.start === walletColor)?.end || walletColor}99)` }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xs text-primary-foreground/70">{walletName || 'Wallet Name'}</span>
              <p className="text-lg font-display text-primary-foreground">
                {settings.currency.symbol} {startingBalance.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Color picker */}
          <div className="flex flex-wrap justify-center gap-2.5 py-1">
            {WALLET_COLORS.map((c) => {
              const selected = walletColor === c.start;
              return (
                <button
                  key={c.start}
                  onClick={() => setWalletColor(c.start)}
                  className="relative flex-shrink-0 transition-all duration-200"
                  style={{ width: 34, height: 34 }}
                >
                  <div
                    className={`w-full h-full rounded-full transition-all duration-200 ${selected ? 'ring-2 ring-offset-2 ring-accent scale-110' : 'active:scale-95'}`}
                    style={{ background: `linear-gradient(135deg, ${c.start}, ${c.end})` }}
                  />
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="e.g. Cash, Bank Account, JazzCash..."
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            onClick={() => setShowCalc(true)}
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-left text-sm flex items-center justify-between"
          >
            <span className="text-text-muted">{t('starting_balance')}</span>
            <span className="font-display text-lg text-text-primary">
              {settings.currency.symbol} {startingBalance.toLocaleString()}
            </span>
          </button>
          <button onClick={handleSaveWallet} className="w-full h-12 rounded-xl bg-accent text-primary-foreground font-medium text-sm">
            {t('save')}
          </button>
        </div>
      </BottomSheet>

      {showCalc && (
        <Calculator
          value={startingBalance}
          currencySymbol={settings.currency.symbol}
          onConfirm={(val) => { setStartingBalance(val); setShowCalc(false); }}
          onClose={() => setShowCalc(false)}
        />
      )}
    </PageWrapper>
  );
}
