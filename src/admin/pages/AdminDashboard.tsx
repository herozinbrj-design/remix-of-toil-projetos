import { Globe, Users, Image, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageHeader from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";

const chartData = [
  { month: "Jan", visitantes: 3200, leads: 28 },
  { month: "Fev", visitantes: 3800, leads: 35 },
  { month: "Mar", visitantes: 3500, leads: 30 },
  { month: "Abr", visitantes: 4100, leads: 38 },
  { month: "Mai", visitantes: 3900, leads: 33 },
  { month: "Jun", visitantes: 4500, leads: 42 },
  { month: "Jul", visitantes: 4200, leads: 40 },
  { month: "Ago", visitantes: 4700, leads: 44 },
  { month: "Set", visitantes: 4400, leads: 39 },
  { month: "Out", visitantes: 4900, leads: 46 },
  { month: "Nov", visitantes: 4600, leads: 43 },
  { month: "Dez", visitantes: 4832, leads: 47 },
];

const recentLeads = [
  { name: "João Silva", project: "Loja Conceito", status: "Novo", time: "2h atrás" },
  { name: "Maria Costa", project: "Fachada", status: "Novo", time: "5h atrás" },
  { name: "Carlos Souza", project: "Mobiliário", status: "Em análise", time: "1 dia" },
  { name: "Ana Rodrigues", project: "Comunicação Visual", status: "Respondido", time: "2 dias" },
  { name: "Pedro Lima", project: "Peças Acrílico", status: "Respondido", time: "3 dias" },
];

const recentProjects = [
  { name: "Loja Conceito Premium", category: "Marcenaria", status: "Publicado", emoji: "🏪" },
  { name: "Shopping Franklin", category: "Comunicação Visual", status: "Publicado", emoji: "🎨" },
  { name: "Fachada Corporativa XYZ", category: "Acrílico", status: "Rascunho", emoji: "💎" },
  { name: "Mobiliário Restaurante", category: "Marcenaria", status: "Em revisão", emoji: "🪵" },
];

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
            <div className="flex items-center gap-1 mt-2">
              {positive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              )}
              <span className={`text-xs font-medium ${positive ? "text-emerald-500" : "text-destructive"}`}>
                {positive ? "+" : ""}{change}%
              </span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
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
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral do seu site e negócio" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCardItem label="Visitantes (mês)" value="4.832" change={12} icon={Globe} />
        <StatCardItem label="Leads / Orçamentos" value="47" change={23} icon={Users} />
        <StatCardItem label="Projetos Ativos" value="12" change={-5} icon={Image} />
        <StatCardItem label="Taxa de Conversão" value="3.8%" change={8} icon={CheckCircle} />
      </div>

      {/* Charts & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Visitantes & Leads</CardTitle>
              <Tabs defaultValue="12m">
                <TabsList className="h-8">
                  <TabsTrigger value="7d" className="text-xs px-2 h-6">7 dias</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs px-2 h-6">30 dias</TabsTrigger>
                  <TabsTrigger value="12m" className="text-xs px-2 h-6">12 meses</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 30% 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 53%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 20% 53%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(221 39% 11%)", border: "1px solid hsl(220 30% 18%)", borderRadius: 8, color: "hsl(210 40% 96%)" }} />
                <Legend />
                <Line type="monotone" dataKey="visitantes" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leads" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Últimos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead.name} className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs">{lead.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.project}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusBadge(lead.status)}>{lead.status}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{lead.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <h3 className="text-sm font-semibold mb-4">Projetos Recentes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentProjects.map((p) => (
          <Card key={p.name} className="hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <div className="text-3xl mb-3">{p.emoji}</div>
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground mb-3">{p.category}</p>
              <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
