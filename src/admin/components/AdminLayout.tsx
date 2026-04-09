import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, FileText, Image, Users, Grid3X3,
  Settings, ChevronLeft, ChevronRight, Search, Globe, Bell,
  LogOut, User, MoreVertical, Shield, UserCog
} from "lucide-react";
import { usePermissions } from "../../contexts/PermissionsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover, PopoverTrigger, PopoverContent,
} from "@/components/ui/popover";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const NAV_BASE = [
  { label: "Dashboard", path: "/admin", icon: Home, permission: "view_dashboard" },
  { label: "Segmentos", path: "/admin/segmentos", icon: Grid3X3, permission: "view_segments" },
  { label: "Portfólio", path: "/admin/portfolio", icon: Image, permission: "view_portfolio" },
  { label: "Leads & Orçamentos", path: "/admin/leads", icon: Users, permission: "view_leads" },
  { label: "Usuários", path: "/admin/usuarios", icon: UserCog, permission: "view_users" },
  { label: "Permissões", path: "/admin/permissoes", icon: Shield, permission: "manage_permissions" },
  { label: "Configurações", path: "/admin/configuracoes", icon: Settings, permission: "view_settings" },
];

interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
  permission?: string;
}

interface RecentLead {
  id: number;
  name: string;
  service: string | null;
  createdAt: string;
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const navItems: NavItem[] = NAV_BASE
    .filter((item) => {
      // Se o item tem permissão definida, verificar se o usuário tem essa permissão
      if (item.permission) {
        return hasPermission(item.permission);
      }
      // Se não tem permissão definida, mostrar sempre
      return true;
    })
    .map((item) =>
      item.path === "/admin/leads" && newLeadsCount > 0
        ? { ...item, badge: newLeadsCount }
        : item
    );

  const currentPage = navItems.find(
    (item) => location.pathname === item.path
  )?.label || 
    (location.pathname.includes("/admin/perfil") ? "Meu Perfil" : 
    location.pathname.includes("/admin/usuarios") ? "Usuários" :
    location.pathname.includes("/admin/permissoes") ? "Permissões" :
    location.pathname.includes("/admin/banner") ? "Banner Principal" : "Dashboard");

  // Fetch new leads count for badge + notifications
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    fetch("/api/leads", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: RecentLead[] & { status?: string }[]) => {
        const novo = (data as { status: string; id: number; name: string; service: string | null; createdAt: string }[])
          .filter((l) => l.status === "NOVO");
        setNewLeadsCount(novo.length);
        setRecentLeads(novo.slice(0, 5));
      })
      .catch(() => {});
  }, [location.pathname]);

  // Auth guard: check token and fetch user info
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_logged");
        navigate("/admin/login", { replace: true });
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_logged");
    navigate("/admin/login", { replace: true });
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ${
            collapsed ? "w-[72px]" : "w-[260px]"
          }`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-display font-bold text-lg shrink-0">
              T
            </div>
            {!collapsed && (
              <div>
                <span className="font-display font-bold text-sidebar-foreground text-lg tracking-tight">TOIL</span>
                <p className="text-[11px] text-muted-foreground leading-none">Painel Admin</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const linkContent = (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {item.badge && (
                    <Badge variant="destructive" className={`${collapsed ? "absolute -top-1 -right-1 px-1" : "ml-auto"} text-[10px]`}>
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>

          <Separator className="mx-3" />

          {/* Collapse toggle */}
          <div className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-start gap-3 text-muted-foreground"
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <><ChevronLeft className="w-5 h-5" /><span>Recolher</span></>}
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[260px]"}`}>
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-10 w-64 bg-card"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" target="_blank" className="gap-1.5">
                  <Globe className="w-4 h-4" /> Ver Site
                </Link>
              </Button>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {newLeadsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">
                      Notificações {newLeadsCount > 0 && <span className="text-destructive">({newLeadsCount})</span>}
                    </p>
                    <Separator />
                    {recentLeads.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma notificação nova.</p>
                    ) : (
                      <div className="space-y-2">
                        {recentLeads.map((lead) => (
                          <div key={lead.id} className="flex gap-3 p-2 rounded-md hover:bg-accent/10 cursor-pointer" onClick={() => navigate("/admin/leads")}>
                            <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{lead.name}</p>
                              {lead.service && <p className="text-xs text-muted-foreground">{lead.service}</p>}
                              <p className="text-xs text-muted-foreground">
                                {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Separator orientation="vertical" className="h-6" />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-3 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-primary-foreground text-xs font-bold">{userInitial}</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                      <p className="text-[11px] text-muted-foreground">{user?.email || "admin@toil.com.br"}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin/perfil")}>
                    <User className="mr-2 h-4 w-4" /> Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/configuracoes")}>
                    <Settings className="mr-2 h-4 w-4" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Breadcrumb */}
          <div className="px-6 py-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/admin">Painel</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Page */}
          <main className="px-6 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
