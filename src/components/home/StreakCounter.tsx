import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  transactions: Transaction[];
}

function getStreak(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0;
  const dates = new Set(transactions.map((t) => t.date));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Allow today OR yesterday as the starting day (gracefully handle first-thing-in-the-morning logging)
  const todayKey = cursor.toISOString().split('T')[0];
  if (!dates.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
    const yKey = cursor.toISOString().split('T')[0];
    if (!dates.has(yKey)) return 0;
  }

  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (!dates.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function StreakCounter({ transactions }: StreakCounterProps) {
  const streak = useMemo(() => getStreak(transactions), [transactions]);

  if (streak < 1) return null;

  const message =
    streak === 1
      ? 'Day 1 — keep it going!'
      : streak < 7
      ? `${streak}-day tracking streak`
      : streak < 30
      ? `🔥 ${streak} days strong!`
      : `🏆 ${streak} days — legend!`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/20 animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Flame className="w-4 h-4 text-amber-500" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-text-primary">{message}</p>
      </div>
      <span className="text-base font-display text-amber-500">{streak}</span>
    </div>
  );
}
