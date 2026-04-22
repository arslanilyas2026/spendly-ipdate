import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/types';
import { storage } from '@/store/storage';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const d = await storage.getDebts();
    setDebts(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addDebt = useCallback(async (debt: Debt) => {
    const updated = [...debts, debt];
    setDebts(updated);
    await storage.saveDebts(updated);
    console.log('Debt saved:', debt.personName, 'Total debts:', updated.length);
  }, [debts]);

  const updateDebt = useCallback(async (id: string, updates: Partial<Debt>) => {
    const updated = debts.map(d => d.id === id ? { ...d, ...updates } : d);
    setDebts(updated);
    await storage.saveDebts(updated);
  }, [debts]);

  const deleteDebt = useCallback(async (id: string) => {
    const updated = debts.filter(d => d.id !== id);
    setDebts(updated);
    await storage.saveDebts(updated);
  }, [debts]);

  return { debts, loading, addDebt, updateDebt, deleteDebt, reload: load };
}
