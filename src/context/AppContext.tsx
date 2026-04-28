import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Screen } from '../types';
import { getOrCreateDeviceToken } from '../utils';

interface AppContextType {
  activeScreen: Screen;
  anonMode: boolean;
  deviceToken: string;
  setActiveScreen: (screen: Screen) => void;
  toggleAnonMode: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<Screen>('report');
  const [anonMode, setAnonMode] = useState<boolean>(true);
  const [deviceToken] = useState<string>(() => getOrCreateDeviceToken());

  const toggleAnonMode = () => {
    setAnonMode(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        anonMode,
        deviceToken,
        setActiveScreen,
        toggleAnonMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
