import { useState, useEffect, useCallback } from 'react';
import { Wallet } from '@/types';
import { storage } from '@/store/storage';

export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const w = await storage.getWallets();
    setWallets(w);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addWallet = useCallback(async (wallet: Wallet) => {
    const updated = [...wallets, wallet];
    setWallets(updated);
    await storage.saveWallets(updated);
  }, [wallets]);

  const updateWallet = useCallback(async (id: string, updates: Partial<Wallet>) => {
    const updated = wallets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWallets(updated);
    await storage.saveWallets(updated);
  }, [wallets]);

  const deleteWallet = useCallback(async (id: string) => {
    const updated = wallets.filter(w => w.id !== id);
    setWallets(updated);
    await storage.saveWallets(updated);
  }, [wallets]);

  return { wallets, loading, addWallet, updateWallet, deleteWallet, reload: load };
}
