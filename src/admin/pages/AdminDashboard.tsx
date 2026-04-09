import { Globe, Users, Image } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Portfolio {
  id: number;
  name: string;
  category: string;
  status: string;
  image: string;
}

interface Stats {
  totalLeads: number;
  activeProjects: number;
  visitors: number;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface ChartDataPoint {
  month: string;
  leads: number;
}

const statusBadge = (s: string) => {
  if (s === "Novo" || s === "Publicado") return "success" as const;
  if (s === "Em análise" || s === "Em revisão") return "warning" as const;
  return "secondary" as const;
};

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

function StatCardItem({ label, value, change, icon: Icon }: StatCardProps) {
  const positive = change >= 0;
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ 
    totalLeads: 0, 
    activeProjects: 0,
    visitors: 0,
    pageviews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentProjects, setRecentProjects] = useState<Portfolio[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [chartPeriod, setChartPeriod] = useState<"5h" | "7d" | "30d" | "12m">("7d");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (allLeads.length > 0) {
      generateChartData(allLeads, chartPeriod);
    }
  }, [chartPeriod, allLeads]);

  const getAuthHeader = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token") || "";
    return { Authorization: `Bearer ${token}` };
  };

  const fetchDashboardData = async () => {
    try {
      const [leadsRes, portfolioRes, analyticsRes] = await Promise.all([
        fetch("/api/leads", { headers: getAuthHeader() }),
        fetch("/api/portfolio", { headers: getAuthHeader() }),
        fetch("/api/analytics/stats", { headers: getAuthHeader() }),
      ]);

      if (leadsRes.ok) {
        const leads = await leadsRes.json();
        setAllLeads(leads);
        setStats((prev) => ({ ...prev, totalLeads: leads.length }));
        setRecentLeads(leads.slice(0, 5));
        
        // Gerar dados do gráfico baseado nos leads reais
        generateChartData(leads, chartPeriod);
      } else {
        console.error("Erro ao buscar leads:", leadsRes.status);
      }

      if (portfolioRes.ok) {
        const portfolio = await portfolioRes.json();
        const activeProjects = portfolio.filter((p: Portfolio) => p.status === "PUBLICADO").length;
        setStats((prev) => ({ ...prev, activeProjects }));
        setRecentProjects(portfolio.slice(0, 4));
      } else {
        console.error("Erro ao buscar portfolio:", portfolioRes.status);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.stats) {
          setStats((prev) => ({
            ...prev,
            visitors: analyticsData.stats.visitors,
            pageviews: analyticsData.stats.pageviews,
            sessions: analyticsData.stats.sessions,
            bounceRate: analyticsData.stats.bounceRate,
            avgSessionDuration: analyticsData.stats.avgSessionDuration,
          }));
        }
      } else {
        console.error("Erro ao buscar analytics:", analyticsRes.status);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (leads: Lead[], period: "5h" | "7d" | "30d" | "12m") => {
    const now = new Date();
    let data: ChartDataPoint[] = [];

    if (period === "5h") {
      // Últimas 5 horas
      for (let i = 4; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return (
            leadDate.getHours() === hour.getHours() &&
            leadDate.getDate() === hour.getDate() &&
            leadDate.getMonth() === hour.getMonth() &&
            leadDate.getFullYear() === hour.getFullYear()
          );
        });
        
        data.push({
          month: `${hour.getHours()}h`,
          leads: hourLeads.length,
        });
      }
    } else if (period === "7d") {
      // Últimos 7 dias
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return (
            leadDate.getDate() === day.getDate() &&
            leadDate.getMonth() === day.getMonth() &&
            leadDate.getFullYear() === day.getFullYear()
          );
        });
        
        data.push({
          month: days[day.getDay()],
          leads: dayLeads.length,
        });
      }
    } else if (period === "30d") {
      // Últimos 30 dias (agrupado por semana)
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        
        const weekLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return leadDate >= weekStart && leadDate <= weekEnd;
        });
        
        data.push({
          month: `Sem ${4 - i}`,
          leads: weekLeads.length,
        });
      }
    } else {
      // Últimos 12 meses
      const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const currentYear = now.getFullYear();
      
      data = months.map((month, index) => {
        const monthLeads = leads.filter((lead) => {
          const leadDate = new Date(lead.createdAt);
          return leadDate.getMonth() === index && leadDate.getFullYear() === currentYear;
        });
        
        return {
          month,
          leads: monthLeads.length,
        };
      });
    }
    
    setChartData(data);
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      NOVO: "Novo",
      EM_ANALISE: "Em análise",
      RESPONDIDO: "Respondido",
      CONVERTIDO: "Convertido",
      ARQUIVADO: "Arquivado",
      PUBLICADO: "Publicado",
      RASCUNHO: "Rascunho",
      EM_REVISAO: "Em revisão",
    };
    return statusMap[status] || status;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do seu site e negócio" />

      {/* Stats - Linha 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCardItem label="Leads / Orçamentos" value={stats.totalLeads.toString()} change={0} icon={Users} />
            <StatCardItem label="Projetos no Portfólio Ativos" value={stats.activeProjects.toString()} change={0} icon={Image} />
            <StatCardItem label="Visitantes (mês)" value={stats.visitors > 0 ? formatNumber(stats.visitors) : "—"} change={0} icon={Globe} />
            <StatCardItem label="Visualizações de Página" value={stats.pageviews > 0 ? formatNumber(stats.pageviews) : "—"} change={0} icon={Globe} />
            <StatCardItem label="Taxa de Rejeição" value={stats.bounceRate > 0 ? `${stats.bounceRate}%` : "—"} change={0} icon={Globe} />
          </>
        )}
      </div>

      {/* Stats - Linha 2 (Google Analytics) */}
      {!loading && stats.sessions > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCardItem label="Sessões" value={formatNumber(stats.sessions)} change={0} icon={Globe} />
          <StatCardItem label="Duração Média da Sessão" value={formatDuration(stats.avgSessionDuration)} change={0} icon={Globe} />
          <StatCardItem label="Páginas por Sessão" value={stats.sessions > 0 ? (stats.pageviews / stats.sessions).toFixed(2) : "—"} change={0} icon={Globe} />
        </div>
      )}

      {!loading && stats.visitors === 0 && (
        <div className="mb-8">
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <p className="text-sm text-amber-600">
                ℹ️ Configure o Google Analytics em <a href="/admin/configuracoes?secao=google" className="underline font-medium">Configurações → Google</a> para ver dados reais de visitantes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Leads por Período</CardTitle>
              <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as any)}>
                <TabsList className="h-8">
                  <TabsTrigger value="5h" className="text-xs px-2 h-6">5 horas</TabsTrigger>
                  <TabsTrigger value="7d" className="text-xs px-2 h-6">7 dias</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs px-2 h-6">30 dias</TabsTrigger>
                  <TabsTrigger value="12m" className="text-xs px-2 h-6">12 meses</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 30% 18%)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "hsl(215 20% 53%)", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: "hsl(215 20% 53%)", fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(221 39% 11%)", 
                      border: "1px solid hsl(220 30% 18%)", 
                      borderRadius: 8, 
                      color: "hsl(210 40% 96%)" 
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="hsl(160 84% 39%)" 
                    strokeWidth={2} 
                    dot={false} 
                    name="Leads"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Últimos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum lead encontrado</p>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-4">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/15 text-primary text-xs">
                            {lead.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{lead.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{lead.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={statusBadge(getStatusLabel(lead.status))}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">{getTimeAgo(lead.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <h3 className="text-sm font-semibold mb-4">Últimos Projetos do Portfólio</h3>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : recentProjects.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground text-center">Nenhum projeto encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentProjects.map((p) => (
            <Card
              key={p.id}
              className="hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate("/admin/portfolio")}
            >
              <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={p.image || "/images/portfolio/placeholder.svg"}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{p.category}</p>
                  <Badge variant={statusBadge(getStatusLabel(p.status))}>
                    {getStatusLabel(p.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
