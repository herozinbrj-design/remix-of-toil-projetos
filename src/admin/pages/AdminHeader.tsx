import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, Edit, GripVertical, ChevronRight, ChevronDown,
  Link as LinkIcon, Eye, EyeOff, Save, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface MenuItem {
  id: number;
  label: string;
  link: string | null;
  order: number;
  active: boolean;
  parentId: number | null;
  children?: MenuItem[];
}

interface MenuFormData {
  label: string;
  link: string;
  parentId: number | null;
  order: number;
  active: boolean;
}

export default function AdminHeader() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState<MenuFormData>({
    label: "",
    link: "",
    parentId: null,
    order: 0,
    active: true,
  });

  const getToken = () => localStorage.getItem("admin_token") || "";
  const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

  const loadMenus = async () => {
    try {
      const res = await fetch("/api/header-menu/all", {
        headers: authHeaders(),
      });
      const data = await res.json();
      setMenus(data);
    } catch {
      toast.error("Erro ao carregar menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        label: item.label,
        link: item.link || "",
        parentId: item.parentId,
        order: item.order,
        active: item.active,
      });
    } else {
      setEditingId(null);
      setFormData({
        label: "",
        link: "",
        parentId: null,
        order: 0,
        active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.label.trim()) {
      toast.error("O nome do item é obrigatório");
      return;
    }

    try {
      const url = editingId
        ? `/api/header-menu/${editingId}`
        : "/api/header-menu";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success(
        editingId ? "Item atualizado com sucesso!" : "Item criado com sucesso!"
      );
      handleCloseDialog();
      loadMenus();
    } catch {
      toast.error("Erro ao salvar item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este item? Todos os subitens também serão removidos.")) {
      return;
    }

    try {
      const res = await fetch(`/api/header-menu/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error();

      toast.success("Item deletado com sucesso!");
      loadMenus();
    } catch {
      toast.error("Erro ao deletar item");
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getAllMenusFlat = (items: MenuItem[]): MenuItem[] => {
    let result: MenuItem[] = [];
    items.forEach((item) => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result = result.concat(getAllMenusFlat(item.children));
      }
    });
    return result;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const paddingLeft = level * 32;

    return (
      <div key={item.id}>
        <div
          className="flex items-center gap-3 p-3 border-b hover:bg-accent/5 transition-colors"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />

          {hasChildren && (
            <button
              onClick={() => toggleExpand(item.id)}
              className="p-1 hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-6" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{item.label}</p>
              {!item.active && (
                <Badge variant="secondary" className="text-xs">
                  Inativo
                </Badge>
              )}
              {level > 0 && (
                <Badge variant="outline" className="text-xs">
                  Nível {level}
                </Badge>
              )}
            </div>
            {item.link && (
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {item.link}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDialog(item)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(item.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Menu do Header"
          description="Gerencie os itens do menu de navegação"
        />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const allMenusFlat = getAllMenusFlat(menus);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu do Header"
        description="Gerencie os itens do menu de navegação com suporte a submenus aninhados"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Itens do Menu</CardTitle>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {menus.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhum item no menu ainda.</p>
              <p className="text-sm mt-1">
                Clique em "Novo Item" para começar.
              </p>
            </div>
          ) : (
            <div>{menus.map((item) => renderMenuItem(item))}</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Item" : "Novo Item"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Nome do Item *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Ex: Sobre, Serviços, Contato"
              />
            </div>

            <div>
              <Label htmlFor="link">Link (URL)</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="Ex: /sobre, /servicos, https://..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe vazio se este item for apenas um agrupador de submenus
              </p>
            </div>

            <div>
              <Label htmlFor="parentId">Item Pai (para criar submenu)</Label>
              <Select
                value={formData.parentId?.toString() || "none"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    parentId: value === "none" ? null : parseInt(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum (item principal)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (item principal)</SelectItem>
                  {allMenusFlat
                    .filter((m) => m.id !== editingId)
                    .map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="order">Ordem</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Itens com menor número aparecem primeiro
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Ativo</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
