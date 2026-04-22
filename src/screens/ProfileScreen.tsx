import React, { useState } from 'react';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/hooks/useSettings';
import { useWallets } from '@/hooks/useWallets';
import { useGoals } from '@/hooks/useGoals';
import { useDebts } from '@/hooks/useDebts';
import { formatCurrency, formatCurrencyHidden } from '@/utils/formatCurrency';
import { t } from '@/utils/translations';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, FolderOpen, RefreshCw, Archive, Settings, Target, Trash2, Wallet } from 'lucide-react';
import { Goal, Debt } from '@/types';
import { generateId } from '@/utils/dateHelpers';
import { WALLET_COLORS } from '@/constants/languages';
import BottomSheet from '@/components/ui/BottomSheet';
import Calculator from '@/components/ui/Calculator';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function ProfileScreen() {
  const { settings } = useSettings();
  const { wallets } = useWallets();
  const { goals, addGoal, deleteGoal } = useGoals();
  const { debts, addDebt, deleteDebt } = useDebts();
  const navigate = useNavigate();

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalColor, setGoalColor] = useState(WALLET_COLORS[0].start);
  const [showGoalCalc, setShowGoalCalc] = useState(false);

  const [debtType, setDebtType] = useState<'payable' | 'receivable'>('payable');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtReason, setDebtReason] = useState('');
  const [debtAmount, setDebtAmount] = useState(0);
  const [debtColor, setDebtColor] = useState(WALLET_COLORS[2].start);
  const [showDebtCalc, setShowDebtCalc] = useState(false);

  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [deleteDebtId, setDeleteDebtId] = useState<string | null>(null);

  const handleSaveGoal = () => {
    if (!goalName || goalTarget <= 0) return;
    const goal: Goal = {
      id: generateId(),
      name: goalName,
      icon: 'target',
      color: goalColor,
      targetAmount: goalTarget,
      currentAmount: 0,
      currency: settings.currency,
      tags: [],
      includeInBalance: false,
      createdAt: new Date().toISOString(),
    };
    addGoal(goal);
    setGoalName('');
    setGoalTarget(0);
    setShowGoalForm(false);
  };

  const handleSaveDebt = () => {
    if (!debtPerson || debtAmount <= 0) return;
    const debt: Debt = {
      id: generateId(),
      type: debtType,
      personName: debtPerson,
      reason: debtReason,
      amount: debtAmount,
      paidAmount: 0,
      currency: settings.currency,
      color: debtColor,
      date: new Date().toISOString().split('T')[0],
      includeInBalance: false,
    };
    addDebt(debt);
    setDebtPerson('');
    setDebtReason('');
    setDebtAmount(0);
    setShowDebtForm(false);
  };

  const EmptyState = ({ emoji, message, buttonLabel, onAdd }: {
    emoji: string; message: string; buttonLabel: string; onAdd: () => void;
  }) => (
    <div className="rounded-2xl border-2 border-dashed border-border p-8 flex flex-col items-center">
      <span className="text-4xl mb-3">{emoji}</span>
      <p className="text-sm text-text-muted text-center mb-4">{message}</p>
      <button
        onClick={onAdd}
        className="h-10 px-5 rounded-xl bg-bg-secondary text-text-primary text-sm font-medium flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {buttonLabel}
      </button>
    </div>
  );

  return (
    <PageWrapper>
      <TopBar title={t('profile')} right={
        <button onClick={() => navigate('/settings')} className="w-9 h-9 flex items-center justify-center rounded-xl">
          <Settings className="w-5 h-5 text-text-muted" />
        </button>
      } />

      <div className="px-4 space-y-6 pb-4">
        {/* Cards & Wallets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text-primary">{t('cards_wallets')}</h3>
            <button
              onClick={() => navigate('/wallets')}
              className="h-8 px-3 rounded-full border border-border text-xs font-medium text-text-primary"
            >
              {t('view_all')}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {wallets.map((wallet) => {
              const walletEndColor = WALLET_COLORS.find(c => c.start === wallet.color)?.end || wallet.color + '99';
              return (
                <button
                  key={wallet.id}
                  onClick={() => navigate(`/wallet/${wallet.id}`)}
                  className="min-w-[180px] h-[120px] rounded-2xl p-4 flex flex-col justify-between flex-shrink-0 text-left active:scale-[0.97] transition-transform"
                  style={{ background: `linear-gradient(135deg, ${wallet.color}, ${walletEndColor})` }}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/70 mb-0.5">{wallet.name}</p>
                    <p className="text-lg font-display text-primary-foreground">
                      {settings.showBalances
                        ? formatCurrency(wallet.startingBalance, settings.currency)
                        : formatCurrencyHidden(settings.currency)
                      }
                    </p>
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => navigate('/wallets?add=1')}
              className="min-w-[100px] h-[120px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 flex-shrink-0 active:bg-bg-secondary/50 transition-colors"
            >
              <Plus className="w-5 h-5 text-text-muted" />
              <span className="text-xs text-text-muted">{t('add_wallet')}</span>
            </button>
          </div>
        </div>

        {/* Goals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text-primary">{t('goals')}</h3>
            {goals.length > 0 && (
              <button onClick={() => setShowGoalForm(true)} className="text-xs font-medium text-accent">+ {t('add_goal')}</button>
            )}
          </div>
          {goals.length === 0 ? (
            <EmptyState
              emoji="🎯"
              message="You haven't added any goals."
              buttonLabel={t('add_goal')}
              onAdd={() => setShowGoalForm(true)}
            />
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-bg-card rounded-2xl p-4 card-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: goal.color + '20' }}>
                        <Target className="w-4 h-4" style={{ color: goal.color }} />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{goal.name}</span>
                    </div>
                    <button onClick={() => setDeleteGoalId(goal.id)} className="w-8 h-8 flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                  <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`, backgroundColor: goal.color }} />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-text-muted">{formatCurrency(goal.currentAmount, settings.currency)}</span>
                    <span className="text-xs text-text-muted">{formatCurrency(goal.targetAmount, settings.currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-text-primary">{t('debts')}</h3>
            {debts.length > 0 && (
              <button onClick={() => setShowDebtForm(true)} className="text-xs font-medium text-accent">+ {t('add_debt')}</button>
            )}
          </div>
          {debts.length === 0 ? (
            <EmptyState
              emoji="📋"
              message="You haven't added any debts yet."
              buttonLabel={t('add_debt')}
              onAdd={() => setShowDebtForm(true)}
            />
          ) : (
            <div className="space-y-2">
              {debts.map((debt) => (
                <div key={debt.id} className="bg-bg-card rounded-2xl p-4 card-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: debt.color }}>
                        {debt.personName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-text-primary">{debt.personName}</span>
                        <p className="text-xs text-text-muted">{debt.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-display ${debt.type === 'payable' ? 'text-negative' : 'text-positive'}`}>
                        {formatCurrency(debt.amount, settings.currency)}
                      </span>
                      <button onClick={() => setDeleteDebtId(debt.id)} className="w-8 h-8 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-bg-card rounded-2xl card-shadow overflow-hidden">
          {[
            { icon: FolderOpen, label: t('manage_categories'), path: '/categories' },
            { icon: RefreshCw, label: t('manage_recurring'), path: '/recurring' },
            { icon: Archive, label: t('backup_restore'), path: '/settings' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full h-[52px] flex items-center gap-3 px-4 active:bg-bg-secondary/50 transition-colors"
            >
              <item.icon className="w-5 h-5 text-text-muted" />
              <span className="text-sm text-text-primary flex-1 text-left">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          ))}
        </div>
      </div>

      {/* Goal Form */}
      <BottomSheet open={showGoalForm} onClose={() => setShowGoalForm(false)} title={t('add_goal')}>
        <div className="space-y-3">
          <input
            type="text"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="e.g. New Phone, Hajj Fund, Car..."
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <div className="flex gap-3 overflow-x-auto overflow-y-visible py-2 px-1">
            {WALLET_COLORS.map((c) => (
              <button
                key={c.start}
                onClick={() => setGoalColor(c.start)}
                className={`flex-shrink-0 rounded-full transition-transform ${goalColor === c.start ? 'ring-2 ring-offset-2 ring-accent scale-110' : ''}`}
                style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${c.start}, ${c.end})` }}
              />
            ))}
          </div>
          <button
            onClick={() => setShowGoalCalc(true)}
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-left text-sm flex items-center justify-between"
          >
            <span className="text-text-muted">Target Amount</span>
            <span className="font-display text-lg text-text-primary">
              {settings.currency.symbol} {goalTarget.toLocaleString()}
            </span>
          </button>
          <button onClick={handleSaveGoal} className="w-full h-12 rounded-xl bg-accent text-primary-foreground font-medium text-sm">
            {t('save')}
          </button>
        </div>
      </BottomSheet>

      {showGoalCalc && (
        <Calculator
          value={goalTarget}
          currencySymbol={settings.currency.symbol}
          onConfirm={(val) => { setGoalTarget(val); setShowGoalCalc(false); }}
          onClose={() => setShowGoalCalc(false)}
        />
      )}

      {/* Debt Form */}
      <BottomSheet open={showDebtForm} onClose={() => setShowDebtForm(false)} title={t('add_debt')}>
        <div className="space-y-3">
          <div className="flex bg-bg-secondary rounded-xl p-1 mb-1">
            {(['payable', 'receivable'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setDebtType(tp)}
                className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${
                  debtType === tp ? 'bg-bg-card text-text-primary card-shadow' : 'text-text-muted'
                }`}
              >
                {tp === 'payable' ? '↓ Payable' : '↑ Receivable'}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={debtPerson}
            onChange={(e) => setDebtPerson(e.target.value)}
            placeholder={debtType === 'payable' ? "e.g. Ahmed, Bank, Uncle..." : "e.g. Sara, Friend, Client..."}
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <input
            type="text"
            value={debtReason}
            onChange={(e) => setDebtReason(e.target.value)}
            placeholder="e.g. Lunch split, Loan, Business expense..."
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <div className="flex gap-3 overflow-x-auto overflow-y-visible py-2 px-1">
            {WALLET_COLORS.map((c) => (
              <button
                key={c.start}
                onClick={() => setDebtColor(c.start)}
                className={`flex-shrink-0 rounded-full transition-transform ${debtColor === c.start ? 'ring-2 ring-offset-2 ring-accent scale-110' : ''}`}
                style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${c.start}, ${c.end})` }}
              />
            ))}
          </div>
          <button
            onClick={() => setShowDebtCalc(true)}
            className="w-full h-11 bg-bg-input rounded-xl px-4 text-left text-sm flex items-center justify-between"
          >
            <span className="text-text-muted">Amount</span>
            <span className="font-display text-lg text-text-primary">
              {settings.currency.symbol} {debtAmount.toLocaleString()}
            </span>
          </button>
          <button onClick={handleSaveDebt} className="w-full h-12 rounded-xl bg-accent text-primary-foreground font-medium text-sm">
            {t('save')}
          </button>
        </div>
      </BottomSheet>

      {showDebtCalc && (
        <Calculator
          value={debtAmount}
          currencySymbol={settings.currency.symbol}
          onConfirm={(val) => { setDebtAmount(val); setShowDebtCalc(false); }}
          onClose={() => setShowDebtCalc(false)}
        />
      )}

      {/* Delete confirmations */}
      <ConfirmDialog
        open={!!deleteGoalId}
        onClose={() => setDeleteGoalId(null)}
        onConfirm={() => { if (deleteGoalId) deleteGoal(deleteGoalId); setDeleteGoalId(null); }}
        title="Delete Goal?"
        message="This action cannot be undone."
      />
      <ConfirmDialog
        open={!!deleteDebtId}
        onClose={() => setDeleteDebtId(null)}
        onConfirm={() => { if (deleteDebtId) deleteDebt(deleteDebtId); setDeleteDebtId(null); }}
        title="Delete Debt?"
        message="This action cannot be undone."
      />
    </PageWrapper>
  );
}
