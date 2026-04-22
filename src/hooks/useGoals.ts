import { useState, useEffect, useCallback } from 'react';
import { Goal } from '@/types';
import { storage } from '@/store/storage';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const g = await storage.getGoals();
    setGoals(g);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addGoal = useCallback(async (goal: Goal) => {
    const updated = [...goals, goal];
    setGoals(updated);
    await storage.saveGoals(updated);
    console.log('Goal saved:', goal.name, 'Total goals:', updated.length);
  }, [goals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    await storage.saveGoals(updated);
  }, [goals]);

  const deleteGoal = useCallback(async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await storage.saveGoals(updated);
  }, [goals]);

  return { goals, loading, addGoal, updateGoal, deleteGoal, reload: load };
}
