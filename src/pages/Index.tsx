import React, { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import OnboardingFlow from '@/screens/onboarding/OnboardingFlow';
import HomeScreen from '@/screens/HomeScreen';
import BottomNav from '@/components/layout/BottomNav';
import TransactionForm from '@/components/transaction/TransactionForm';
import { useSearchParams } from 'react-router-dom';

export default function Index() {
  const { settings, updateSettings, loading } = useSettings();
  const { wallets, reload: reloadWallets } = useWallets();
  const { transactions, addTransaction, updateTransaction, reload: reloadTx } = useTransactions();
  const { categories } = useCategories();
  const [showAddTx, setShowAddTx] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewMode = searchParams.get('review') === '1';

  if (loading) {
    return (
      <div className="mobile-container bg-background min-h-[100dvh] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center">
          <span className="text-primary-foreground text-lg font-bold">S</span>
        </div>
        <h1 className="text-2xl font-display text-text-primary">Spendly</h1>
        <p className="text-sm text-text-muted">Track smarter. Spend wiser.</p>
      </div>
    );
  }

  // First-time onboarding
  if (!settings.onboardingCompleted) {
    return (
      <OnboardingFlow
        onComplete={(s) => {
          updateSettings(s);
          reloadWallets();
        }}
      />
    );
  }

  // Review mode onboarding (from Settings → Review Onboarding)
  if (reviewMode) {
    return (
      <OnboardingFlow
        reviewMode
        existingSettings={settings}
        onComplete={(s) => {
          updateSettings(s);
          reloadWallets();
          setSearchParams({});
        }}
      />
    );
  }

  return (
    <>
      <HomeScreen onAddTransaction={() => setShowAddTx(true)} />
      <BottomNav onFabPress={() => setShowAddTx(!showAddTx)} fabOpen={showAddTx} />
      <TransactionForm
        open={showAddTx}
        onClose={() => setShowAddTx(false)}
        categories={categories}
        wallets={wallets}
        onSave={(tx) => {
          addTransaction(tx);
          setShowAddTx(false);
        }}
      />
    </>
  );
}
