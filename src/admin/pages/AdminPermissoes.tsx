import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePermissions } from "../../contexts/PermissionsContext";
import PageHeader from "../components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Search, Shield, ShieldCheck, User, Save, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
}

interface Permission {
  id: number;
  key: string;
  name: string;
  description: string | null;
  category: string;
}

interface UserPermission {
  permissionId: number;
  granted: boolean;
}

interface RolePermission {
  permissionId: number;
  granted: boolean;
}

const roleLabels = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  EDITOR: "Editor",
};

const roleIcons = {
  SUPER_ADMIN: ShieldCheck,
  ADMIN: Shield,
  EDITOR: User,
};

// Hierarquia de cargos (maior número = mais poder)
const roleHierarchy = {
  SUPER_ADMIN: 3,
  ADMIN: 2,
  EDITOR: 1,
};

// Função para verificar se pode gerenciar outro cargo
const canManageRole = (userRole: string, targetRole: string): boolean => {
  return roleHierarchy[userRole as keyof typeof roleHierarchy] > roleHierarchy[targetRole as keyof typeof roleHierarchy];
};

const categoryLabels: Record<string, string> = {
  dashboard: "Dashboard",
  portfolio: "Portfólio",
  segments: "Segmentos",
  leads: "Leads & Orçamentos",
  settings: "Configurações",
  users: "Usuários",
  permissions: "Permissões",
};

export default function AdminPermissoes() {
  const navigate = useNavigate();
  const { hasPermission, permissions: userOwnPermissions, loading: permissionsLoading } = usePermissions();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<Record<number, boolean>>({});
  const [userRolePermissions, setUserRolePermissions] = useState<Record<number, boolean>>({});
  const [userSpecificPermissions, setUserSpecificPermissions] = useState<Set<number>>(new Set());
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "EDITOR">("ADMIN");
  const [rolePermissions, setRolePermissions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Buscar usuário logado
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data);
      })
      .catch(() => navigate("/admin/login"));

    // Buscar usuários
    fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => toast.error("Erro ao carregar usuários"));

    // Buscar permissões
    fetch("/api/permissions", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Garantir que data é um array
        if (Array.isArray(data)) {
          setPermissions(data);
        } else {
          console.error("Permissions response is not an array:", data);
          setPermissions([]);
          if (data.error) {
            toast.error(data.error);
          }
        }
      })
      .catch((error) => {
        console.error("Error loading permissions:", error);
        toast.error("Erro ao carregar permissões");
        setPermissions([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Verificar permissão após carregar
  useEffect(() => {
    if (!loading && !permissionsLoading && currentUser) {
      if (!hasPermission("manage_permissions")) {
        toast.error("Acesso negado. Apenas usuários com permissão podem acessar esta página.");
        navigate("/admin");
      }
    }
  }, [loading, permissionsLoading, currentUser, hasPermission, navigate]);

  // Ajustar cargo selecionado baseado nas permissões do usuário
  useEffect(() => {
    if (currentUser && !loading) {
      // Se não pode gerenciar ADMIN, selecionar EDITOR
      if (!canManageRole(currentUser.role, "ADMIN") && canManageRole(currentUser.role, "EDITOR")) {
        setSelectedRole("EDITOR");
        loadRolePermissions("EDITOR");
      } else if (canManageRole(currentUser.role, "ADMIN")) {
        loadRolePermissions("ADMIN");
      }
    }
  }, [currentUser, loading]);

  const loadUserPermissions = async (userId: number) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      // Buscar o usuário para saber seu cargo
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      // Buscar permissões específicas do usuário
      const userRes = await fetch(`/api/users/${userId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Buscar permissões do cargo
      const roleRes = await fetch(`/api/roles/${user.role}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userRes.ok && roleRes.ok) {
        const userData = await userRes.json();
        const roleData = await roleRes.json();

        // Criar mapa de permissões do cargo
        const rolePermsMap: Record<number, boolean> = {};
        roleData.forEach((p: RolePermission) => {
          rolePermsMap[p.permissionId] = p.granted;
        });
        setUserRolePermissions(rolePermsMap);

        // Criar mapa de permissões finais (cargo + específicas)
        const permsMap: Record<number, boolean> = { ...rolePermsMap };

        // Identificar permissões específicas do usuário
        const specificPerms = new Set<number>();
        userData.forEach((p: UserPermission) => {
          permsMap[p.permissionId] = p.granted;
          specificPerms.add(p.permissionId);
        });

        setSelectedUserPermissions(permsMap);
        setUserSpecificPermissions(specificPerms);
      }
    } catch (error) {
      toast.error("Erro ao carregar permissões do usuário");
    }
  };

  const loadRolePermissions = async (role: "ADMIN" | "EDITOR") => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/roles/${role}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const permsMap: Record<number, boolean> = {};
        data.forEach((p: RolePermission) => {
          permsMap[p.permissionId] = p.granted;
        });
        setRolePermissions(permsMap);
      }
    } catch (error) {
      toast.error("Erro ao carregar permissões do cargo");
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.id === Number(userId));
    setSelectedUser(user || null);
    
    if (user) {
      loadUserPermissions(user.id);
    }
  };

  const handleRoleSelect = (role: "ADMIN" | "EDITOR") => {
    setSelectedRole(role);
    loadRolePermissions(role);
  };

  const handlePermissionToggle = (permissionId: number, granted: boolean) => {
    setSelectedUserPermissions((prev) => ({
      ...prev,
      [permissionId]: granted,
    }));
  };

  const handleRolePermissionToggle = (permissionId: number, granted: boolean) => {
    setRolePermissions((prev) => ({
      ...prev,
      [permissionId]: granted,
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setSaving(true);

    try {
      // Enviar TODAS as permissões que foram modificadas pelo usuário
      // Isso inclui permissões que diferem do cargo
      const permissionsToSave: Record<number, boolean> = {};
      
      Object.entries(selectedUserPermissions).forEach(([permId, granted]) => {
        const permIdNum = Number(permId);
        const rolePermission = userRolePermissions[permIdNum] || false;
        
        // Se a permissão é diferente da do cargo, incluir
        if (granted !== rolePermission) {
          permissionsToSave[permIdNum] = granted;
        }
      });

      console.log("Saving user permissions:", permissionsToSave);

      const res = await fetch(`/api/users/${selectedUser.id}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: permissionsToSave }),
      });

      if (res.ok) {
        toast.success("Permissões do usuário atualizadas!");
        // Recarregar permissões para atualizar a visualização
        await loadUserPermissions(selectedUser.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar permissões");
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRole = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setSaving(true);

    try {
      console.log("Saving role permissions:", rolePermissions);

      const res = await fetch(`/api/roles/${selectedRole}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: rolePermissions }),
      });

      if (res.ok) {
        toast.success(`Permissões do cargo ${roleLabels[selectedRole]} atualizadas!`);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar permissões");
      }
    } catch (error) {
      console.error("Error saving role permissions:", error);
      toast.error("Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (user) => {
      // Filtrar por busca
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por hierarquia: só pode gerenciar usuários de cargo inferior
      const canManage = currentUser && canManageRole(currentUser.role, user.role);
      
      return matchesSearch && canManage;
    }
  );

  // Filtrar permissões: usuário só pode ver permissões que ele possui
  const filteredPermissions = permissions.filter(perm => 
    currentUser?.role === "SUPER_ADMIN" || userOwnPermissions.includes(perm.key)
  );

  // Agrupar permissões filtradas por categoria
  const permissionsByCategory = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const RoleIcon = selectedUser ? roleIcons[selectedUser.role] : User;
  const SelectedRoleIcon = roleIcons[selectedRole];

  return (
    <>
      <PageHeader
        title="Gerenciar Permissões"
        subtitle="Configure permissões por usuário ou por cargo"
      />

      <Tabs defaultValue="user" className="space-y-6">
        <TabsList>
          <TabsTrigger value="user">
            <User className="w-4 h-4 mr-2" />
            Por Usuário
          </TabsTrigger>
          <TabsTrigger value="role">
            <Users className="w-4 h-4 mr-2" />
            Por Cargo
          </TabsTrigger>
        </TabsList>

        {/* ABA: POR USUÁRIO */}
        <TabsContent value="user">
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            {/* Seletor de Usuário */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selecionar Usuário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={selectedUserId} onValueChange={handleUserSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => {
                      const Icon = roleIcons[user.role];
                      return (
                        <SelectItem key={user.id} value={String(user.id)}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{user.name}</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {roleLabels[user.role]}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {selectedUser && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <RoleIcon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">{selectedUser.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedUser.email}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {roleLabels[selectedUser.role]}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Permissões do Usuário */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Permissões Específicas</CardTitle>
                  {selectedUser && (
                    <Button onClick={handleSaveUser} disabled={saving} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedUser ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Selecione um usuário para gerenciar suas permissões</p>
                  </div>
                ) : selectedUser.role === "SUPER_ADMIN" ? (
                  <div className="text-center py-12">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-purple-500" />
                    <p className="font-medium mb-2">Super Administrador</p>
                    <p className="text-sm text-muted-foreground">
                      SUPER_ADMIN tem acesso total e não pode ter permissões modificadas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm space-y-2">
                      <p className="text-blue-600 dark:text-blue-400">
                        <strong>Como funciona:</strong>
                      </p>
                      <ul className="text-blue-600 dark:text-blue-400 space-y-1 ml-4 list-disc">
                        <li>Permissões marcadas como "Do cargo" vêm do cargo {selectedUser && roleLabels[selectedUser.role]}</li>
                        <li>Você pode sobrescrever qualquer permissão do cargo</li>
                        <li>Permissões modificadas serão marcadas como "Específica"</li>
                        <li>Para voltar ao padrão do cargo, basta ativar/desativar conforme o cargo</li>
                        {currentUser?.role !== "SUPER_ADMIN" && (
                          <li className="text-amber-600 dark:text-amber-400">
                            <strong>Nota:</strong> Você só pode gerenciar permissões que você possui
                          </li>
                        )}
                      </ul>
                    </div>
                    {Object.keys(permissionsByCategory).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhuma permissão disponível para gerenciar.</p>
                        <p className="text-sm mt-2">Você só pode gerenciar permissões que você possui.</p>
                      </div>
                    )}
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          {categoryLabels[category] || category}
                          <Badge variant="secondary" className="text-xs">
                            {perms.length}
                          </Badge>
                        </h3>
                        <div className="space-y-3">
                          {perms.map((perm) => {
                            const isSpecific = userSpecificPermissions.has(perm.id);
                            const isFromRole = userRolePermissions[perm.id] === true;
                            
                            return (
                              <div
                                key={perm.id}
                                className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${
                                  isSpecific
                                    ? "bg-blue-500/5 border-blue-500/20"
                                    : "bg-card hover:bg-accent/5"
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor={`user-perm-${perm.id}`} className="font-medium cursor-pointer">
                                      {perm.name}
                                    </Label>
                                    {isSpecific && (
                                      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                                        Específica
                                      </Badge>
                                    )}
                                    {!isSpecific && isFromRole && (
                                      <Badge variant="outline" className="text-xs">
                                        Do cargo
                                      </Badge>
                                    )}
                                  </div>
                                  {perm.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                                <Switch
                                  id={`user-perm-${perm.id}`}
                                  checked={selectedUserPermissions[perm.id] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionToggle(perm.id, checked)
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                        {Object.keys(permissionsByCategory).indexOf(category) <
                          Object.keys(permissionsByCategory).length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: POR CARGO */}
        <TabsContent value="role">
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            {/* Seletor de Cargo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selecionar Cargo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedRole} onValueChange={(value: any) => handleRoleSelect(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Mostrar apenas cargos que o usuário pode gerenciar */}
                    {currentUser && canManageRole(currentUser.role, "ADMIN") && (
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Administrador
                        </div>
                      </SelectItem>
                    )}
                    {currentUser && canManageRole(currentUser.role, "EDITOR") && (
                      <SelectItem value="EDITOR">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Editor
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <SelectedRoleIcon className="w-5 h-5 text-primary" />
                    <div className="font-medium">{roleLabels[selectedRole]}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedRole === "ADMIN"
                      ? "Gerenciamento completo de conteúdo e leads"
                      : "Criação e edição de conteúdo básico"}
                  </p>
                  <div className="pt-2">
                    <p className="text-xs font-medium mb-1">Usuários com este cargo:</p>
                    <div className="flex flex-wrap gap-1">
                      {users
                        .filter((u) => u.role === selectedRole)
                        .map((u) => (
                          <Badge key={u.id} variant="secondary" className="text-xs">
                            {u.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissões do Cargo */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Permissões do Cargo</CardTitle>
                  <Button onClick={handleSaveRole} disabled={saving} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm space-y-2">
                    <p className="text-amber-600 dark:text-amber-400">
                      <strong>Atenção:</strong> Alterações nas permissões do cargo afetarão todos os usuários
                      com este cargo, a menos que tenham permissões específicas configuradas.
                    </p>
                    {currentUser?.role !== "SUPER_ADMIN" && (
                      <p className="text-amber-600 dark:text-amber-400">
                        <strong>Nota:</strong> Você só pode gerenciar permissões que você possui.
                      </p>
                    )}
                  </div>
                  {Object.keys(permissionsByCategory).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhuma permissão disponível para gerenciar.</p>
                      <p className="text-sm mt-2">Você só pode gerenciar permissões que você possui.</p>
                    </div>
                  )}
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        {categoryLabels[category] || category}
                        <Badge variant="secondary" className="text-xs">
                          {perms.length}
                        </Badge>
                      </h3>
                      <div className="space-y-3">
                        {perms.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex-1">
                              <Label htmlFor={`role-perm-${perm.id}`} className="font-medium cursor-pointer">
                                {perm.name}
                              </Label>
                              {perm.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {perm.description}
                                </p>
                              )}
                            </div>
                            <Switch
                              id={`role-perm-${perm.id}`}
                              checked={rolePermissions[perm.id] || false}
                              onCheckedChange={(checked) =>
                                handleRolePermissionToggle(perm.id, checked)
                              }
                            />
                          </div>
                        ))}
                      </div>
                      {Object.keys(permissionsByCategory).indexOf(category) <
                        Object.keys(permissionsByCategory).length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
