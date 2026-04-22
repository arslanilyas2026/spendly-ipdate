import { useState, useEffect, useCallback } from 'react';
import { Budget } from '@/types';
import { storage } from '@/store/storage';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getBudgets().then(b => { setBudgets(b); setLoading(false); });
  }, []);

  const saveBudgets = useCallback(async (updated: Budget[]) => {
    setBudgets(updated);
    await storage.saveBudgets(updated);
  }, []);

  const addBudget = useCallback(async (budget: Budget) => {
    const updated = [...budgets, budget];
    await saveBudgets(updated);
  }, [budgets, saveBudgets]);

  const updateBudget = useCallback(async (budget: Budget) => {
    const updated = budgets.map(b => b.id === budget.id ? budget : b);
    await saveBudgets(updated);
  }, [budgets, saveBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    await saveBudgets(updated);
  }, [budgets, saveBudgets]);

  return { budgets, loading, addBudget, updateBudget, deleteBudget };
}
