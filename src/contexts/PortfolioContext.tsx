import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface PortfolioItem {
  id: number;
  name: string;
  category: string;
  segment: string;
  segmentId: number | null;
  date: string;
  status: "Publicado" | "Rascunho" | "Em revisão";
  image: string;
  description: string;
  showOnHome: boolean;
}

export const categoryOptions = ["Acrílico", "Marcenaria", "Comunicação Visual", "Lojas"];
export const statusOptions: PortfolioItem["status"][] = ["Publicado", "Rascunho", "Em revisão"];

const statusMap: Record<string, PortfolioItem["status"]> = {
  PUBLICADO: "Publicado",
  RASCUNHO: "Rascunho",
  EM_REVISAO: "Em revisão",
};

const statusReverseMap: Record<string, string> = {
  "Publicado": "PUBLICADO",
  "Rascunho": "RASCUNHO",
  "Em revisão": "EM_REVISAO",
};

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

function mapApiProject(p: Record<string, unknown>): PortfolioItem {
  return {
    id: p.id as number,
    name: (p.name as string) || "",
    category: (p.category as string) || "",
    segment: (p.segment as { name: string } | null)?.name || "",
    segmentId: (p.segmentId as number) || null,
    date: formatDate(p.date as string),
    status: statusMap[(p.status as string)] || "Rascunho",
    image: (p.image as string) || "",
    description: (p.description as string) || "",
    showOnHome: (p.showOnHome as boolean) ?? false,
  };
}

interface PortfolioContextType {
  projects: PortfolioItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateProject: (id: number, data: Partial<PortfolioItem>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  addProject: (project: Omit<PortfolioItem, "id">) => Promise<void>;
  getProject: (id: number) => PortfolioItem | undefined;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data.map(mapApiProject));
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addProject = async (project: Omit<PortfolioItem, "id">) => {
    const body = {
      name: project.name,
      category: project.category,
      date: new Date().toISOString(),
      status: statusReverseMap[project.status] || "RASCUNHO",
      image: project.image,
      description: project.description,
      segmentId: project.segmentId || null,
      showOnHome: project.showOnHome ?? false,
    };
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Erro ao criar projeto");
    await refresh();
  };

  const updateProject = async (id: number, data: Partial<PortfolioItem>) => {
    const body: Record<string, unknown> = {};
    if (data.name !== undefined) body.name = data.name;
    if (data.category !== undefined) body.category = data.category;
    if (data.status !== undefined) body.status = statusReverseMap[data.status] || "RASCUNHO";
    if (data.image !== undefined) body.image = data.image;
    if (data.description !== undefined) body.description = data.description;
    if (data.segmentId !== undefined) body.segmentId = data.segmentId;
    if (data.showOnHome !== undefined) body.showOnHome = data.showOnHome;
    if (data.date !== undefined) {
      const parts = data.date.split("/");
      if (parts.length === 3) body.date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString();
    }
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Erro ao atualizar projeto");
    await refresh();
  };

  const deleteProject = async (id: number) => {
    const res = await fetch(`/api/portfolio/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Erro ao excluir projeto");
    await refresh();
  };

  const getProject = (id: number) => projects.find(p => p.id === id);

  return (
    <PortfolioContext.Provider value={{ projects, loading, refresh, updateProject, deleteProject, addProject, getProject }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error("usePortfolio must be used within PortfolioProvider");
  return context;
}
