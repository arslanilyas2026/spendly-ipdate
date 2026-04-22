import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings } from '@/types';
import { storage, DEFAULT_SETTINGS } from '@/store/storage';
import { setLanguage } from '@/utils/translations';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: async () => {},
  loading: true,
});

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const root = document.documentElement;
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    storage.getSettings().then((s) => {
      setSettings(s);
      setLanguage(s.language);
      applyTheme(s.theme);
      setLoading(false);
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      storage.saveSettings(newSettings);
      if (updates.theme) applyTheme(updates.theme);
      if (updates.language) {
        setLanguage(updates.language);
        // Force re-render of entire tree for language change
        forceUpdate(n => n + 1);
      }
      return newSettings;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
