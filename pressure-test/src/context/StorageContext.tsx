import { createContext, useState, useMemo, type ReactNode } from 'react';
import { isLocalStorageAvailable } from '../utils/storageCheck';

export interface StorageContextValue {
  storageAvailable: boolean;
  quotaExceeded: boolean;
  setQuotaExceeded: (v: boolean) => void;
}

export const StorageContext = createContext<StorageContextValue>({
  storageAvailable: true,
  quotaExceeded: false,
  setQuotaExceeded: () => {},
});

export function StorageProvider({ children }: { children: ReactNode }) {
  const storageAvailable = useMemo(() => isLocalStorageAvailable(), []);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  return (
    <StorageContext.Provider value={{ storageAvailable, quotaExceeded, setQuotaExceeded }}>
      {children}
    </StorageContext.Provider>
  );
}
