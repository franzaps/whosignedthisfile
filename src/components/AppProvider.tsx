import { ReactNode, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AppContext, type AppConfig, type AppContextType, type Theme } from '@/contexts/AppContext';

interface AppProviderProps {
  children: ReactNode;
  /** Application storage key */
  storageKey: string;
  /** Default app configuration */
  defaultConfig: AppConfig;
  /** Optional list of preset relays to display in the RelaySelector */
  presetRelays?: { name: string; url: string }[];
}

export function AppProvider(props: AppProviderProps) {
  const {
    children,
    storageKey,
    defaultConfig,
    presetRelays,
  } = props;

  // App configuration state with localStorage persistence
  const [config, setConfig] = useLocalStorage<AppConfig>(storageKey, defaultConfig);
  
  // Force dark theme - override any stored theme preference
  const forcedConfig = { ...config, theme: "dark" as Theme };

  // Generic config updater with callback pattern (theme is always forced to dark)
  const updateConfig = (updater: (currentConfig: AppConfig) => AppConfig) => {
    const newConfig = updater(forcedConfig);
    // Always force dark theme regardless of updates
    setConfig({ ...newConfig, theme: "dark" as Theme });
  };

  const appContextValue: AppContextType = {
    config: forcedConfig,
    updateConfig,
    presetRelays,
  };

  // Apply theme effects to document (always dark)
  useApplyTheme(forcedConfig.theme);

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook to force dark theme on the document root
 */
function useApplyTheme(theme: Theme) {
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Always force dark theme
    root.classList.remove('light', 'dark');
    root.classList.add('dark');
  }, [theme]);
}