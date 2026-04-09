import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const SettingsContext = createContext<Record<string, string>>({});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return <SettingsContext.Provider value={data}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
