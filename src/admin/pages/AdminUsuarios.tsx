import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePermissions } from "../../contexts/PermissionsContext";
import PageHeader from "../components/PageHeader";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { UserPlus, Pencil, Trash2, Shield, ShieldCheck, User } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  active: boolean;
  lastLogin: string | null;
  createdAt: string;
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

const roleColors = {
  SUPER_ADMIN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ADMIN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  EDITOR: "bg-green-500/10 text-green-500 border-green-500/20",
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

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR" as "SUPER_ADMIN" | "ADMIN" | "EDITOR",
    active: true,
  });

  // Buscar usuário logado
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data);
        // Verificar se tem permissão para ver usuários
        if (!permissionsLoading && !hasPermission("view_users")) {
          toast.error("Você não tem permissão para acessar esta página");
          navigate("/admin");
        }
      })
      .catch(() => navigate("/admin/login"));
  }, [navigate, hasPermission, permissionsLoading]);

  // Buscar usuários
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Erro ao carregar usuários");
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        active: user.active,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EDITOR",
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Senha é obrigatória para novos usuários");
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        active: formData.active,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingUser ? "Usuário atualizado!" : "Usuário criado!");
        handleCloseDialog();
        loadUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao salvar usuário");
      }
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Usuário removido!");
        setIsDeleteDialogOpen(false);
        setDeletingUser(null);
        loadUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao remover usuário");
      }
    } catch (error) {
      toast.error("Erro ao remover usuário");
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Gerenciar Usuários" subtitle="Gerencie os usuários do sistema" />

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Usuários do Sistema</h3>
              <p className="text-sm text-muted-foreground">Total: {users.length} usuários</p>
            </div>
            {isSuperAdmin && (
              <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            )}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users
                  .filter(user => currentUser && canManageRole(currentUser.role, user.role))
                  .map((user) => {
                  const RoleIcon = roleIcons[user.role];
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role]}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.active ? "default" : "secondary"}>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString("pt-BR")
                          : "Nunca"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {(isSuperAdmin || currentUser?.id === user.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(user)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          )}
                          {isSuperAdmin && user.role !== "SUPER_ADMIN" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Senha {editingUser && "(deixe em branco para manter)"}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>

            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Permissão</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Mostrar apenas cargos que o usuário pode gerenciar */}
                    {currentUser && canManageRole(currentUser.role, "EDITOR") && (
                      <SelectItem value="EDITOR">Editor</SelectItem>
                    )}
                    {currentUser && canManageRole(currentUser.role, "ADMIN") && (
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.role === "SUPER_ADMIN" 
                    ? "Nota: SUPER_ADMIN só pode ser criado diretamente no banco de dados"
                    : "Você só pode atribuir cargos de nível inferior ao seu"}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label>Usuário Ativo</Label>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingUser ? "Salvar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{deletingUser?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingUser(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
