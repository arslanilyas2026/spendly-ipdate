import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { t } from '@/utils/translations';
import { ChevronDown, ChevronUp, Wallet, LayoutList, PieChart, Target, Lightbulb, BookOpen } from 'lucide-react';

const sections = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    content: 'Welcome to Spendly! Start by adding your first expense — tap the + button on the home screen. You can track expenses, income, and transfers between wallets. All data stays on your device, no internet required.'
  },
  {
    icon: Wallet,
    title: 'Wallets',
    content: 'A wallet represents where your money lives — Cash, Bank Account, JazzCash, etc. You can create multiple wallets and track balances separately. Each transaction is linked to a wallet.'
  },
  {
    icon: LayoutList,
    title: 'Categories',
    content: 'Categories help you organize spending. Spendly comes with default categories like Food, Transport, and Salary. You can create custom categories from Profile → Manage Categories.'
  },
  {
    icon: PieChart,
    title: 'Reports',
    content: 'The Report screen shows your spending breakdown by week, category, and trend. Use the period selector to view different months. Tap chart segments for details.'
  },
  {
    icon: Target,
    title: 'Goals & Debts',
    content: 'Set savings goals (e.g., New Phone, Travel Fund) and track progress. Record debts — money you owe or others owe you — and mark payments as they happen.'
  },
  {
    icon: Lightbulb,
    title: 'Tips & Tricks',
    content: 'Use Spending Type tags (Essential/Want/Impulse) to understand habits. Set a daily spending limit to stay on track. Back up your data regularly from Settings → Backup & Restore.'
  },
];

export default function UserGuideScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageWrapper>
      <TopBar title={t('user_guide')} showBack />
      <div className="px-4 pb-8 space-y-3">
        {sections.map((section, i) => {
          const Icon = section.icon;
          const isOpen = openIndex === i;
          return (
            <div key={i} className="bg-bg-card rounded-2xl card-shadow overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3.5"
              >
                <Icon className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-text-primary flex-1 text-left">{section.title}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-sm text-text-secondary leading-relaxed">{section.content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
