import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useGoals } from '@/hooks/useGoals';
import { useDebts } from '@/hooks/useDebts';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { t } from '@/utils/translations';
import {
  Wallet, Target, Users, FolderOpen, RefreshCw, Settings, ChevronRight,
  HelpCircle, Shield, Moon, Sun, Bell, FileText
} from 'lucide-react';
import { WALLET_COLORS } from '@/constants/languages';

export default function MoreScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { wallets } = useWallets();
  const { goals } = useGoals();
  const { debts } = useDebts();

  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const menuSections = [
    {
      title: 'Financial',
      items: [
        { icon: Wallet, label: t('cards_wallets'), subtitle: `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`, path: '/wallets', color: '#D4956A' },
        { icon: Target, label: t('goals'), subtitle: `${goals.length} active`, path: '/profile', color: '#22C55E' },
        { icon: Users, label: t('debts'), subtitle: `${debts.length} tracked`, path: '/profile', color: '#EF4444' },
      ],
    },
    {
      title: 'Manage',
      items: [
        { icon: FolderOpen, label: t('manage_categories'), path: '/categories', color: '#8B5CF6' },
        { icon: RefreshCw, label: t('manage_recurring'), path: '/recurring', color: '#0EA5E9' },
        { icon: Bell, label: 'Reminders', path: '/', color: '#F59E0B' },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: Settings, label: t('settings'), path: '/settings', color: '#64748B' },
        { icon: HelpCircle, label: t('user_guide'), path: '/user-guide', color: '#06B6D4' },
        { icon: Shield, label: t('privacy_policy'), path: '/privacy-policy', color: '#6366F1' },
      ],
    },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-xl font-display text-text-primary">{t('more')}</h1>
      </div>

      <div className="px-5 space-y-5 pb-4">
        {/* Profile Card */}
        <div className="bg-bg-card rounded-2xl p-4 card-shadow flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
            <span className="text-accent text-lg font-bold">{settings.userName?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{settings.userName}</p>
            <p className="text-[11px] text-text-muted">{settings.currency.code} · {settings.language.toUpperCase()}</p>
          </div>
          <button
            onClick={() => {
              const next = isDark ? 'light' : 'dark';
              updateSettings({ theme: next });
            }}
            className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center"
          >
            {isDark ? <Sun className="w-4 h-4 text-text-muted" /> : <Moon className="w-4 h-4 text-text-muted" />}
          </button>
        </div>

        {/* Wallet Preview */}
        {wallets.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-hide">
            {wallets.slice(0, 4).map(wallet => {
              const endColor = WALLET_COLORS.find(c => c.start === wallet.color)?.end || wallet.color + 'CC';
              return (
                <button
                  key={wallet.id}
                  onClick={() => navigate(`/wallet/${wallet.id}`)}
                  className="relative min-w-[130px] h-[72px] rounded-xl p-2.5 flex flex-col justify-between flex-shrink-0 active:scale-[0.97] transition-transform overflow-hidden shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${wallet.color}, ${endColor})` }}
                >
                  {/* Subtle overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />

                  <div className="relative flex items-center justify-between">
                    <div className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-[11px]">{wallet.icon}</span>
                    </div>
                    <p className="text-[9px] text-white/80 font-medium uppercase tracking-wider truncate max-w-[70px]">{wallet.name}</p>
                  </div>
                  <div className="relative">
                    <p className="text-sm font-display text-white font-semibold leading-tight drop-shadow-sm">
                      {settings.showBalances ? formatCurrency(wallet.startingBalance, settings.currency) : '••••'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-2 px-1">{section.title}</h3>
            <div className="bg-bg-card rounded-2xl card-shadow overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full h-[52px] flex items-center gap-3 px-4 active:bg-bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm text-text-primary">{item.label}</span>
                    {item.subtitle && <p className="text-[10px] text-text-muted">{item.subtitle}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs font-display text-accent">Spendly</p>
          <p className="text-[10px] text-text-muted mt-0.5">v2.0 · Track smarter. Spend wiser.</p>
        </div>
      </div>
    </PageWrapper>
  );
}
