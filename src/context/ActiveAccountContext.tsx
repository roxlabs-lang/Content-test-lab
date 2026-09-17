import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TestAccount } from '../types';
import {
  getTestAccounts,
  getActiveAccount,
  setActiveAccount as persistActiveAccount,
  saveTestAccount,
  deleteTestAccount as persistDeleteAccount,
} from '../services/accountService';

interface ActiveAccountContextValue {
  activeAccount: TestAccount | null;
  accounts: TestAccount[];
  loading: boolean;
  setActiveAccount: (account: TestAccount | null) => Promise<void>;
  switchAccountById: (id: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  saveAccount: (account: TestAccount) => Promise<TestAccount>;
  deleteAccount: (id: string) => Promise<void>;
}

const ActiveAccountContext = createContext<ActiveAccountContextValue | undefined>(undefined);

export const ActiveAccountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeAccount, setActiveAccountState] = useState<TestAccount | null>(null);
  const [accounts, setAccounts] = useState<TestAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = async () => {
    setLoading(true);
    try {
      const all = await getTestAccounts();
      const current = await getActiveAccount();
      setAccounts(all);
      setActiveAccountState(current);
    } catch (err) {
      console.error('Error in ActiveAccountProvider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAccounts();
  }, []);

  const handleSetActiveAccount = async (account: TestAccount | null) => {
    if (account) {
      await persistActiveAccount(account.id);
      setActiveAccountState(account);
    } else {
      setActiveAccountState(null);
    }
    const all = await getTestAccounts();
    setAccounts(all);
  };

  const handleSwitchAccountById = async (id: string) => {
    await persistActiveAccount(id);
    const updatedActive = await getActiveAccount();
    setActiveAccountState(updatedActive);
    const all = await getTestAccounts();
    setAccounts(all);
  };

  const handleSaveAccount = async (account: TestAccount): Promise<TestAccount> => {
    const saved = await saveTestAccount(account);
    await refreshAccounts();
    return saved;
  };

  const handleDeleteAccount = async (id: string): Promise<void> => {
    await persistDeleteAccount(id);
    await refreshAccounts();
  };

  return (
    <ActiveAccountContext.Provider
      value={{
        activeAccount,
        accounts,
        loading,
        setActiveAccount: handleSetActiveAccount,
        switchAccountById: handleSwitchAccountById,
        refreshAccounts,
        saveAccount: handleSaveAccount,
        deleteAccount: handleDeleteAccount,
      }}
    >
      {children}
    </ActiveAccountContext.Provider>
  );
};

export function useActiveAccount(): ActiveAccountContextValue {
  const context = useContext(ActiveAccountContext);
  if (!context) {
    throw new Error('useActiveAccount must be used within an ActiveAccountProvider');
  }
  return context;
}
