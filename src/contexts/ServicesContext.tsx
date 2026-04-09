import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface ServiceItem {
  id: number;
  icon: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  order: number;
  showOnHome?: boolean;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

interface ServicesContextType {
  services: ServiceItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateService: (id: number, data: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  addService: (service: Omit<ServiceItem, "id">) => Promise<void>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addService = async (service: Omit<ServiceItem, "id">) => {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify(service),
    });
    if (!res.ok) throw new Error("Erro ao criar serviço");
    await refresh();
  };

  const updateService = async (id: number, data: Partial<ServiceItem>) => {
    const res = await fetch(`/api/services/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao atualizar serviço");
    await refresh();
  };

  const deleteService = async (id: number) => {
    const res = await fetch(`/api/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Erro ao excluir serviço");
    await refresh();
  };

  return (
    <ServicesContext.Provider value={{ services, loading, refresh, updateService, deleteService, addService }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) throw new Error("useServices must be used within ServicesProvider");
  return context;
}

export const iconOptions = [
  { value: "Layers", label: "Camadas" },
  { value: "Paintbrush", label: "Pincel" },
  { value: "Store", label: "Loja" },
  { value: "Box", label: "Caixa" },
  { value: "PanelTop", label: "Painel" },
  { value: "Wrench", label: "Ferramenta" },
  { value: "Diamond", label: "Diamante" },
  { value: "Gem", label: "Gema" },
  { value: "Hammer", label: "Martelo" },
  { value: "Ruler", label: "Régua" },
  { value: "Scissors", label: "Tesoura" },
  { value: "Palette", label: "Paleta" },
];
