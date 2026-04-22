import { useState, useEffect, useCallback } from 'react';
import { Reminder } from '@/types';
import { storage } from '@/store/storage';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await storage.getReminders();
    setReminders(r.sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addReminder = useCallback(async (reminder: Reminder) => {
    const updated = [reminder, ...reminders];
    setReminders(updated);
    await storage.saveReminders(updated);
  }, [reminders]);

  const markPaid = useCallback(async (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, isPaid: true } : r);
    setReminders(updated);
    await storage.saveReminders(updated);
  }, [reminders]);

  const deleteReminder = useCallback(async (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    await storage.saveReminders(updated);
  }, [reminders]);

  const pendingReminders = reminders.filter(r => !r.isPaid);
  const overdueReminders = pendingReminders.filter(r => r.dueDate <= new Date().toISOString().split('T')[0]);

  return { reminders, pendingReminders, overdueReminders, loading, addReminder, markPaid, deleteReminder, reload: load };
}
