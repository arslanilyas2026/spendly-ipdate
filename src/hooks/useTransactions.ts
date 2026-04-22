import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';
import { storage } from '@/store/storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const t = await storage.getTransactions();
    setTransactions(t.sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTransaction = useCallback(async (tx: Transaction) => {
    const updated = [tx, ...transactions];
    setTransactions(updated);
    await storage.saveTransactions(updated);
  }, [transactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(updated);
    await storage.saveTransactions(updated);
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await storage.saveTransactions(updated);
  }, [transactions]);

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction, reload: load };
}
