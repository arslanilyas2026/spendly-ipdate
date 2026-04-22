import React, { useState } from 'react';
import TransactionsScreen from '@/screens/TransactionsScreen';
import BottomNav from '@/components/layout/BottomNav';
import TransactionForm from '@/components/transaction/TransactionForm';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';

export default function TransactionsPage() {
  const { wallets } = useWallets();
  const { addTransaction } = useTransactions();
  const { categories } = useCategories();
  const [showAddTx, setShowAddTx] = useState(false);

  return (
    <>
      <TransactionsScreen />
      <BottomNav onFabPress={() => setShowAddTx(!showAddTx)} fabOpen={showAddTx} />
      <TransactionForm open={showAddTx} onClose={() => setShowAddTx(false)} categories={categories} wallets={wallets} onSave={(tx) => { addTransaction(tx); setShowAddTx(false); }} />
    </>
  );
}
