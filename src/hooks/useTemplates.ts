import { useState, useEffect, useCallback } from 'react';
import { TransactionTemplate } from '@/types';
import { storage } from '@/store/storage';

export function useTemplates() {
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const t = await storage.getTemplates();
    setTemplates(t);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addTemplate = useCallback(async (template: TransactionTemplate) => {
    const updated = [template, ...templates];
    setTemplates(updated);
    await storage.saveTemplates(updated);
  }, [templates]);

  const deleteTemplate = useCallback(async (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    await storage.saveTemplates(updated);
  }, [templates]);

  return { templates, loading, addTemplate, deleteTemplate, reload: load };
}
