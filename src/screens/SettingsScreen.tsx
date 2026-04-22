import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/hooks/useSettings';
import { t } from '@/utils/translations';
import { LANGUAGES } from '@/constants/languages';
import { CURRENCIES } from '@/constants/currencies';
import Modal from '@/components/ui/Modal';
import BottomSheet from '@/components/ui/BottomSheet';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Calculator from '@/components/ui/Calculator';
import { storage } from '@/store/storage';
import { ChevronRight, User, Palette, Globe, DollarSign, Target, Zap, Archive, FileDown, Trash2, BookOpen, RotateCcw, Info, Shield, Eye, Search, Download, Upload } from 'lucide-react';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showLimitCalc, setShowLimitCalc] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [tempName, setTempName] = useState(settings.userName);
  const [currencySearch, setCurrencySearch] = useState('');
  const [pendingRestoreData, setPendingRestoreData] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeLabel = settings.theme === 'light' ? '☀️ Light' : settings.theme === 'dark' ? '🌙 Dark' : '⚙️ System';
  const langObj = LANGUAGES.find(l => l.code === settings.language);

  const filteredCurrencies = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleBackup = async () => {
    const data = await storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendly-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setPendingRestoreData(data);
        setShowRestoreConfirm(true);
      } catch {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreConfirm = async () => {
    if (pendingRestoreData) {
      await storage.importAll(pendingRestoreData);
      window.location.reload();
    }
  };

  const SettingRow = ({ icon: Icon, label, value, onClick, destructive }: {
    icon: React.ElementType; label: string; value?: string; onClick?: () => void; destructive?: boolean;
  }) => (
    <button onClick={onClick} className="w-full h-[52px] flex items-center gap-3 px-4 active:bg-bg-secondary/50">
      <Icon className={`w-5 h-5 ${destructive ? 'text-negative' : 'text-text-muted'}`} />
      <span className={`text-sm flex-1 text-left ${destructive ? 'text-negative' : 'text-text-primary'}`}>{label}</span>
      {value && <span className="text-xs text-text-muted max-w-[120px] truncate">{value}</span>}
      {onClick && !destructive && <ChevronRight className="w-4 h-4 text-text-muted" />}
    </button>
  );

  const SettingToggle = ({ icon: Icon, label, checked, onChange }: {
    icon: React.ElementType; label: string; checked: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="w-full h-[52px] flex items-center gap-3 px-4">
      <Icon className="w-5 h-5 text-text-muted" />
      <span className="text-sm text-text-primary flex-1">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-accent' : 'bg-border'}`}
      >
        <div className={`w-5 h-5 bg-primary-foreground rounded-full absolute top-0.5 transition-transform card-shadow ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 pt-4 pb-1">
      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{title}</span>
    </div>
  );

  return (
    <PageWrapper>
      <TopBar title={t('settings')} showBack />

      <div className="pb-4">
        <SectionHeader title={t('preferences')} />
        <div className="bg-bg-card mx-4 rounded-2xl card-shadow overflow-hidden">
          <SettingRow icon={User} label={t('name')} value={settings.userName} onClick={() => { setTempName(settings.userName); setShowNameModal(true); }} />
          <SettingRow icon={Palette} label={t('theme')} value={themeLabel} onClick={() => setShowThemeModal(true)} />
          <SettingRow icon={Globe} label={t('language')} value={`${langObj?.flag} ${langObj?.name}`} onClick={() => setShowLangModal(true)} />
        </div>

        <SectionHeader title={t('display')} />
        <div className="bg-bg-card mx-4 rounded-2xl card-shadow overflow-hidden">
          <SettingRow icon={DollarSign} label={t('currency')} value={`${settings.currency.name} (${settings.currency.code})`} onClick={() => setShowCurrencySheet(true)} />
          <SettingRow
            icon={Target}
            label={t('daily_spending_limit')}
            value={settings.dailySpendingLimit ? `${settings.currency.symbol} ${settings.dailySpendingLimit.toLocaleString()}` : t('not_set')}
            onClick={() => setShowLimitCalc(true)}
          />
        </div>

        <SectionHeader title={t('privacy_security')} />
        <div className="bg-bg-card mx-4 rounded-2xl card-shadow overflow-hidden">
          <SettingToggle icon={Eye} label={t('show_balances')} checked={settings.showBalances} onChange={(v) => updateSettings({ showBalances: v })} />
        </div>

        <SectionHeader title={t('experience')} />
        <div className="bg-bg-card mx-4 rounded-2xl card-shadow overflow-hidden">
          <SettingToggle icon={Zap} label={t('reduce_animations')} checked={settings.reduceAnimations} onChange={(v) => updateSettings({ reduceAnimations: v })} />
        </div>

        <SectionHeader title={t('data')} />
        <div className="bg-bg-card mx-4 rounded-2xl card-shadow overflow-hidden">
          <SettingRow icon={Archive} label={t('backup_restore')} onClick={() => setShowBackupModal(true)} />
          <SettingRow icon={FileDown} label={t('export_csv')} />
          <SettingRow icon={Trash2} label={t('clear_all_data')} destructive onClick={() => setShowClearConfirm(true)} />
        </div>

        <SectionHeader title={t('about')} />
        <div className="bg-bg-card mx-4 rounded-2xl card-shadow overflow-hidden">
          <SettingRow icon={BookOpen} label={t('user_guide')} onClick={() => navigate('/user-guide')} />
          <SettingRow icon={RotateCcw} label={t('review_onboarding')} onClick={() => navigate('/?review=1')} />
          <SettingRow icon={Info} label={t('app_version')} value="Spendly v1.0.0" />
          <SettingRow icon={Shield} label={t('privacy_policy')} onClick={() => navigate('/privacy-policy')} />
        </div>
      </div>

      {/* Theme Modal */}
      <Modal open={showThemeModal} onClose={() => setShowThemeModal(false)} title={t('theme')}>
        <div className="space-y-1">
          {([
            { value: 'light', label: '☀️ Light' },
            { value: 'dark', label: '🌙 Dark' },
            { value: 'system', label: '⚙️ System' },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => { updateSettings({ theme: opt.value }); setShowThemeModal(false); }}
              className={`w-full h-11 flex items-center px-3 rounded-xl text-sm ${
                settings.theme === opt.value ? 'bg-accent-soft text-accent font-medium' : 'text-text-primary active:bg-bg-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Modal>

      {/* Language Modal */}
      <Modal open={showLangModal} onClose={() => setShowLangModal(false)} title={t('language')}>
        <div className="space-y-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { updateSettings({ language: lang.code }); setShowLangModal(false); }}
              className={`w-full h-11 flex items-center gap-2 px-3 rounded-xl text-sm ${
                settings.language === lang.code ? 'bg-accent-soft text-accent font-medium' : 'text-text-primary active:bg-bg-secondary'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Name Modal */}
      <Modal open={showNameModal} onClose={() => setShowNameModal(false)} title={t('name')}>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          className="w-full h-11 bg-bg-input rounded-xl px-4 text-sm text-text-primary outline-none mb-4"
          placeholder="e.g. Ahmed, Sara, Ali..."
        />
        <button
          onClick={() => { updateSettings({ userName: tempName }); setShowNameModal(false); }}
          className="w-full h-10 rounded-xl bg-accent text-primary-foreground text-sm font-medium"
        >
          {t('save')}
        </button>
      </Modal>

      {/* Currency Bottom Sheet */}
      <BottomSheet open={showCurrencySheet} onClose={() => setShowCurrencySheet(false)} title={t('currency')}>
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
              onClick={() => { updateSettings({ currency: c }); setShowCurrencySheet(false); }}
              className={`w-full flex items-center gap-3 h-12 px-3 rounded-xl ${settings.currency.code === c.code ? 'bg-accent-soft' : 'active:bg-bg-secondary'}`}
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

      {/* Daily Limit Calculator */}
      {showLimitCalc && (
        <Calculator
          value={settings.dailySpendingLimit || 0}
          currencySymbol={settings.currency.symbol}
          onConfirm={(val) => { updateSettings({ dailySpendingLimit: val > 0 ? val : null }); setShowLimitCalc(false); }}
          onClose={() => setShowLimitCalc(false)}
        />
      )}

      {/* Backup & Restore Modal */}
      <Modal open={showBackupModal} onClose={() => setShowBackupModal(false)} title={t('backup_restore')}>
        <div className="space-y-3">
          <button
            onClick={() => { handleBackup(); setShowBackupModal(false); }}
            className="w-full h-12 rounded-xl bg-accent text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Backup Data
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-12 rounded-xl border border-border text-sm font-medium text-text-primary flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Restore Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />
        </div>
      </Modal>

      {/* Restore Confirm */}
      <ConfirmDialog
        open={showRestoreConfirm}
        onClose={() => { setShowRestoreConfirm(false); setPendingRestoreData(null); }}
        onConfirm={handleRestoreConfirm}
        title="Restore Data?"
        message="This will replace all current data. Continue?"
        confirmText="Restore"
      />

      {/* Clear Data Confirm */}
      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={async () => { await storage.clearAll(); window.location.reload(); }}
        title="Clear All Data?"
        message="This will permanently delete all your transactions, wallets, budgets, goals, and settings. This cannot be undone."
        confirmText="Clear All"
      />
    </PageWrapper>
  );
}
