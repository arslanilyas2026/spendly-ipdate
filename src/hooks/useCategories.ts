import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types';
import { storage } from '@/store/storage';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const c = await storage.getCategories();
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addCategory = useCallback(async (cat: Category) => {
    const updated = [...categories, cat];
    setCategories(updated);
    await storage.saveCategories(updated);
  }, [categories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    setCategories(updated);
    await storage.saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await storage.saveCategories(updated);
  }, [categories]);

  return { categories, loading, addCategory, updateCategory, deleteCategory, reload: load };
}
