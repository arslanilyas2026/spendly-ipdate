import React, { useState } from 'react';
import { AppSettings, Currency, Wallet } from '@/types';
import { CURRENCIES } from '@/constants/currencies';
import { WALLET_COLORS } from '@/constants/languages';
import { storage, DEFAULT_SETTINGS } from '@/store/storage';
import { generateId } from '@/utils/dateHelpers';
import { Sun, Moon, Monitor, User, Search, Target, Flame, Send, Bell } from 'lucide-react';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import { t } from '@/utils/translations';

const TOTAL_STEPS = 7;

interface OnboardingFlowProps {
  onComplete: (settings: AppSettings) => void;
  reviewMode?: boolean;
  existingSettings?: AppSettings | null;
}

export default function OnboardingFlow({ onComplete, reviewMode = false, existingSettings }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(existingSettings?.theme || 'system');
  const [name, setName] = useState(existingSettings?.userName || '');
  const [currency, setCurrency] = useState<Currency>(existingSettings?.currency || CURRENCIES[0]);
  const [walletName, setWalletName] = useState('');
  const [walletColor, setWalletColor] = useState(WALLET_COLORS[0].start);
  const [startingBalance, setStartingBalance] = useState(0);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');

  const themeOptions = [
    { value: 'light' as const, label: t('light'), icon: Sun, emoji: '☀️' },
    { value: 'dark' as const, label: t('dark'), icon: Moon, emoji: '🌙' },
    { value: 'system' as const, label: t('system'), icon: Monitor, emoji: '⚙️' },
  ];

  const currentTheme = themeOptions.find(o => o.value === theme)!;

  const cycleTheme = () => {
    const idx = themeOptions.findIndex(o => o.value === theme);
    const next = themeOptions[(idx + 1) % 3];
    setTheme(next.value);
    document.documentElement.setAttribute('data-theme', next.value === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : next.value
    );
  };

  // Steps that can be skipped: theme/currency in review mode, plus all info-intro steps (5-7)
  const canSkipStep = (s: number) => {
    if (s >= 5 && s <= 7) return true;
    if (!reviewMode) return false;
    return s === 1 || s === 3;
  };

  const handleSkip = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (reviewMode) {
      // In review mode: update settings but don't create a new wallet or clear existing data
      const updatedSettings: AppSettings = {
        ...(existingSettings || DEFAULT_SETTINGS),
        onboardingCompleted: true,
        theme,
        userName: name || existingSettings?.userName || 'User',
        currency,
      };

      // Only create a new wallet if user actually filled in wallet details
      if (walletName.trim() || startingBalance > 0) {
        const walletId = generateId();
        const existingWallets = await storage.getWallets();
        const wallet: Wallet = {
          id: walletId,
          name: walletName || 'Cash',
          icon: 'wallet',
          color: walletColor,
          startingBalance,
          currentBalance: startingBalance,
          includeInNetWorth: true,
          createdAt: new Date().toISOString(),
        };
        await storage.saveWallets([...existingWallets, wallet]);
      }

      await storage.saveSettings(updatedSettings);
      onComplete(updatedSettings);
    } else {
      // First-time onboarding: create wallet
      const walletId = generateId();
      const wallet: Wallet = {
        id: walletId,
        name: walletName || 'Cash',
        icon: 'wallet',
        color: walletColor,
        startingBalance,
        currentBalance: startingBalance,
        includeInNetWorth: true,
        createdAt: new Date().toISOString(),
      };
      await storage.saveWallets([wallet]);

      const settings: AppSettings = {
        ...DEFAULT_SETTINGS,
        onboardingCompleted: true,
        theme,
        userName: name || 'User',
        currency,
        defaultWalletId: walletId,
      };
      await storage.saveSettings(settings);
      onComplete(settings);
    }
  };

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  return (
    <div className="mobile-container bg-background min-h-[100dvh] flex flex-col">
      {/* Top bar with step badge and skip */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="w-16" /> {/* spacer */}
        <div className="w-10 h-10 rounded-xl bg-text-primary flex items-center justify-center">
          <span className="text-background font-semibold text-sm">{step}</span>
        </div>
        {canSkipStep(step) ? (
          <button
            onClick={handleSkip}
            className="w-16 text-right text-sm font-medium text-accent"
          >
            Skip
          </button>
        ) : (
          <div className="w-16" /> /* spacer */
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6">
        {step === 1 && (
          <>
            <h2 className="text-[22px] font-semibold text-text-primary text-center mb-8">
              {t('onboarding.step1.title')}
            </h2>
            <button
              onClick={cycleTheme}
              className="h-12 px-8 rounded-xl bg-accent text-primary-foreground font-medium text-base flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>{currentTheme.emoji}</span>
              <span>{currentTheme.label}</span>
            </button>
            <p className="text-sm text-text-muted text-center mt-6 max-w-[280px]">
              {t('onboarding.step1.desc')}
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-[22px] font-semibold text-text-primary text-center mb-6">
              {t('onboarding.step2.title')}
            </h2>
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mb-6">
              <User className="w-8 h-8 text-accent" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ahmed, Sara, Ali..."
              className="w-[280px] h-12 bg-bg-input rounded-xl px-4 text-base text-text-primary placeholder:text-text-muted text-center outline-none focus:ring-2 focus:ring-accent/30"
            />
            <p className="text-sm text-text-muted text-center mt-6 max-w-[280px]">
              {t('onboarding.step2.desc')}
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-[22px] font-semibold text-text-primary text-center mb-6">
              {t('onboarding.step3.title')}
            </h2>
            <button
              onClick={() => setShowCurrencySheet(true)}
              className="h-12 px-6 rounded-xl bg-bg-secondary text-text-primary font-medium flex items-center gap-2"
            >
              <span className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-sm font-bold text-accent">
                {currency.symbol}
              </span>
              <span>{currency.name}</span>
            </button>
            <p className="text-sm text-text-muted text-center mt-6 max-w-[280px]">
              {t('onboarding.step3.desc')}
            </p>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-[22px] font-semibold text-text-primary text-center mb-4">
              {reviewMode ? 'Add Another Wallet' : t('onboarding.step4.title')}
            </h2>

            {reviewMode && (
              <p className="text-xs text-text-muted text-center mb-4 max-w-[280px]">
                Your existing wallets are safe. Fill in details below to add a new wallet, or leave empty to skip.
              </p>
            )}

            {/* Preview Card */}
            <div
              className="w-full max-w-[300px] h-[120px] rounded-2xl p-4 flex flex-col justify-between mb-6"
              style={{ background: `linear-gradient(135deg, ${walletColor}, ${WALLET_COLORS.find(c => c.start === walletColor)?.end || walletColor}99)` }}
            >
              <div className="text-xs text-primary-foreground/70">{walletName || 'Cash'}</div>
              <div className="text-2xl font-display text-primary-foreground">
                {currency.symbol} {startingBalance.toLocaleString()}
              </div>
            </div>

            {/* Color Picker */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-5 max-w-[280px]">
              {WALLET_COLORS.map((c) => {
                const selected = walletColor === c.start;
                return (
                  <button
                    key={c.start}
                    onClick={() => setWalletColor(c.start)}
                    className="relative flex-shrink-0 transition-all duration-200"
                    style={{ width: 36, height: 36 }}
                  >
                    <div
                      className={`w-full h-full rounded-full transition-all duration-200 ${selected ? 'ring-2 ring-offset-2 ring-accent scale-110' : 'active:scale-95'}`}
                      style={{ background: `linear-gradient(135deg, ${c.start}, ${c.end})` }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className="w-full max-w-[300px] space-y-3">
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder="e.g. Cash, Bank Account, JazzCash..."
                className="w-full h-12 bg-bg-input rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button
                onClick={() => setShowCalc(true)}
                className="w-full h-12 bg-bg-input rounded-xl px-4 text-left text-sm flex items-center justify-between"
              >
                <span className="text-text-muted">{t('starting_balance')}</span>
                <span className="font-display text-lg text-text-primary">
                  {currency.symbol} {startingBalance.toLocaleString()}
                </span>
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <FeatureIntro
            icon={Target}
            iconBg="bg-accent-soft"
            iconColor="text-accent"
            title={t('onboarding.step5.title')}
            description={t('onboarding.step5.desc')}
            preview={
              <div className="w-full max-w-[280px] bg-bg-card rounded-2xl p-3 card-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-primary">Daily Limit</span>
                  <span className="text-[10px] text-text-muted">Rs 550 left</span>
                </div>
                <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                  <div className="h-full w-[45%] rounded-full bg-accent" />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] font-semibold text-text-primary">Rs 450</span>
                  <span className="text-[10px] text-text-muted">/ Rs 1,000</span>
                </div>
              </div>
            }
          />
        )}

        {step === 6 && (
          <FeatureIntro
            icon={Flame}
            iconBg="bg-amber-500/15"
            iconColor="text-amber-500"
            title={t('onboarding.step6.title')}
            description={t('onboarding.step6.desc')}
            preview={
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/20">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-xs font-semibold text-text-primary flex-1">🔥 12 days strong!</span>
                <span className="text-base font-display text-amber-500">12</span>
              </div>
            }
          />
        )}

        {step === 7 && (
          <FeatureIntro
            icon={Send}
            iconBg="bg-accent-soft"
            iconColor="text-accent"
            title={t('onboarding.step7.title')}
            description={t('onboarding.step7.desc')}
            preview={
              <div className="w-full max-w-[280px] space-y-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-card card-shadow">
                  <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
                    <Send className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs text-text-primary flex-1">Cash → Bank</span>
                  <span className="text-xs font-semibold text-accent">Rs 5,000</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg-card card-shadow">
                  <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-xs text-text-primary flex-1">Electric bill</span>
                  <span className="text-xs font-semibold text-text-primary">Rs 2,500</span>
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="px-6 pb-8 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-text-primary"
          >
            {t('previous')}
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            onClick={() => {
              if (step === 4) {
                // Save settings/wallet at step 4 in non-review mode, then keep showing intros
                handleFinish();
                setStep(5);
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 h-12 rounded-xl bg-accent text-primary-foreground text-sm font-medium"
          >
            {t('next')}
          </button>
        ) : (
          <button
            onClick={() => {
              if (reviewMode) {
                handleFinish();
              } else {
                // Settings already saved at step 4, just close onboarding
                onComplete(existingSettings || ({ ...DEFAULT_SETTINGS, onboardingCompleted: true } as AppSettings));
              }
            }}
            className="flex-1 h-12 rounded-xl bg-accent text-primary-foreground text-sm font-medium"
          >
            {reviewMode ? 'Done' : "Let's Go 🚀"}
          </button>
        )}
      </div>

      {/* Currency Bottom Sheet */}
      <BottomSheet open={showCurrencySheet} onClose={() => setShowCurrencySheet(false)} title={t('onboarding.step3.title')}>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={currencySearch}
            onChange={(e) => setCurrencySearch(e.target.value)}
            placeholder="Search by name or code... e.g. 'PKR' or 'Dollar'"
            className="w-full h-11 bg-bg-input rounded-xl pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
          {filteredCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c); setShowCurrencySheet(false); }}
              className={`w-full flex items-center gap-3 h-12 px-3 rounded-xl ${currency.code === c.code ? 'bg-accent-soft' : 'active:bg-bg-secondary'}`}
            >
              <span className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center text-sm font-bold text-text-primary">
                {c.symbol}
              </span>
              <span className="text-sm text-text-primary flex-1 text-left">{c.name}</span>
              <span className="text-xs text-text-muted">{c.code}</span>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Calculator */}
      {showCalc && (
        <Calculator
          value={startingBalance}
          currencySymbol={currency.symbol}
          onConfirm={(val) => { setStartingBalance(val); setShowCalc(false); }}
          onClose={() => setShowCalc(false)}
        />
      )}
    </div>
  );
}

interface FeatureIntroProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  preview: React.ReactNode;
}

function FeatureIntro({ icon: Icon, iconBg, iconColor, title, description, preview }: FeatureIntroProps) {
  return (
    <>
      <div className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center mb-4 animate-scale-in`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h2 className="text-[22px] font-semibold text-text-primary text-center mb-3 max-w-[280px]">
        {title}
      </h2>
      <p className="text-sm text-text-muted text-center mb-6 max-w-[300px] leading-relaxed">
        {description}
      </p>
      <div className="flex justify-center">{preview}</div>
    </>
  );
}
