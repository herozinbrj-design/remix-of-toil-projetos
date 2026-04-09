import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  loading: boolean;
  reloadPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissions: [],
  hasPermission: () => false,
  loading: true,
  reloadPermissions: async () => {},
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.permissions) {
          setPermissions(data.permissions);
        }
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const reloadPermissions = async () => {
    setLoading(true);
    await loadPermissions();
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, loading, reloadPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
