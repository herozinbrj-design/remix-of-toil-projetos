import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Pencil, Trash2, Loader2, MoreHorizontal, Upload,
  ShoppingBag, Store, Building2, Stethoscope, UtensilsCrossed,
  GraduationCap, Hotel, PartyPopper, Layers, Briefcase, Heart,
  Truck, Wrench, Sparkles, Music, Camera, Palette, Landmark,
  Plane, Zap, Leaf, Globe, Award, Gem, Rocket,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ServiceIcon from "@/components/ServiceIcon";
import { iconOptions } from "@/contexts/ServicesContext";

const AVAILABLE_ICONS: { name: string; icon: React.ElementType }[] = [
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Store", icon: Store },
  { name: "Building2", icon: Building2 },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "UtensilsCrossed", icon: UtensilsCrossed },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Hotel", icon: Hotel },
  { name: "PartyPopper", icon: PartyPopper },
  { name: "Briefcase", icon: Briefcase },
  { name: "Heart", icon: Heart },
  { name: "Truck", icon: Truck },
  { name: "Wrench", icon: Wrench },
  { name: "Sparkles", icon: Sparkles },
  { name: "Music", icon: Music },
  { name: "Camera", icon: Camera },
  { name: "Palette", icon: Palette },
  { name: "Landmark", icon: Landmark },
  { name: "Plane", icon: Plane },
  { name: "Zap", icon: Zap },
  { name: "Leaf", icon: Leaf },
  { name: "Globe", icon: Globe },
  { name: "Award", icon: Award },
  { name: "Gem", icon: Gem },
  { name: "Rocket", icon: Rocket },
  { name: "Layers", icon: Layers },
];

function getIconComponent(name: string): React.ElementType {
  return AVAILABLE_ICONS.find((i) => i.name === name)?.icon || Layers;
}

interface Segment {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  active: boolean;
  order: number;
}

interface Service {
  id: number;
  icon: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  order: number;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

export default function AdminSegmentos() {
  // Services (Section 1) state
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [editServiceDialog, setEditServiceDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [uploadingService, setUploadingService] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState<number | null>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);

  // Segments (Section 2) state
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [editSegmentDialog, setEditSegmentDialog] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("Layers");
  const [savingSegment, setSavingSegment] = useState(false);
  const [deleteSegmentId, setDeleteSegmentId] = useState<number | null>(null);

  // Fetch services (Section 1)
  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (Array.isArray(data)) setServices(data);
    } catch {
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Fetch segments (Section 2)
  const fetchSegments = useCallback(async () => {
    setLoadingSegments(true);
    try {
      const res = await fetch("/api/segments");
      const data = await res.json();
      if (Array.isArray(data)) setSegments(data);
    } catch {
      toast.error("Erro ao carregar segmentos");
    } finally {
      setLoadingSegments(false);
    }
  }, []);

  useEffect(() => { 
    fetchServices();
    fetchSegments();
  }, [fetchServices, fetchSegments]);

  // ========== SECTION 1: SERVICES (Full table with images) ==========

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingService) return;
    setUploadingService(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=services", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEditingService((prev) => prev ? { ...prev, image: data.url } : prev);
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingService(false);
      if (serviceFileInputRef.current) serviceFileInputRef.current.value = "";
    }
  };

  const openCreateService = () => {
    setIsNewService(true);
    setEditingService({
      id: 0,
      icon: "Layers",
      name: "",
      description: "",
      image: "",
      active: true,
      order: services.length + 1,
    });
    setEditServiceDialog(true);
  };

  const openEditService = (service: Service) => {
    setIsNewService(false);
    setEditingService({ ...service });
    setEditServiceDialog(true);
  };

  const handleSaveService = async () => {
    if (!editingService || !editingService.name.trim()) {
      toast.error("Preencha o nome do serviço.");
      return;
    }
    setSavingService(true);
    try {
      const body = {
        icon: editingService.icon,
        name: editingService.name,
        description: editingService.description,
        image: editingService.image,
        active: editingService.active,
        order: editingService.order,
      };
      if (isNewService) {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Serviço criado!");
      } else {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Serviço atualizado!");
      }
      setEditServiceDialog(false);
      setEditingService(null);
      await fetchServices();
    } catch {
      toast.error("Erro ao salvar serviço");
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async () => {
    if (deleteServiceId === null) return;
    try {
      const res = await fetch(`/api/services/${deleteServiceId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      toast.success("Serviço excluído!");
      await fetchServices();
    } catch {
      toast.error("Erro ao excluir serviço");
    }
    setDeleteServiceId(null);
  };

  // ========== SECTION 2: SEGMENTS (Simple cards with icons) ==========

  const toggleSegmentActive = async (segment: Segment) => {
    try {
      const res = await fetch(`/api/segments/${segment.id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ active: !segment.active }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Segmento ${!segment.active ? "ativado" : "desativado"}`);
      await fetchSegments();
    } catch {
      toast.error("Erro ao atualizar segmento");
    }
  };

  const openCreateSegment = () => {
    setEditingSegment(null);
    setEditName("");
    setEditDescription("");
    setEditIcon("Layers");
    setEditSegmentDialog(true);
  };

  const openEditSegment = (segment: Segment) => {
    setEditingSegment(segment);
    setEditName(segment.name);
    setEditDescription(segment.description || "");
    setEditIcon(segment.image || "Layers");
    setEditSegmentDialog(true);
  };

  const handleSaveSegment = async () => {
    if (!editName.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSavingSegment(true);
    try {
      const body = { name: editName, description: editDescription || null, image: editIcon };
      if (editingSegment) {
        const res = await fetch(`/api/segments/${editingSegment.id}`, {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
        toast.success("Segmento atualizado!");
      } else {
        const res = await fetch("/api/segments", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ ...body, active: true, order: segments.length }),
        });
        if (!res.ok) throw new Error();
        toast.success("Segmento criado!");
      }
      setEditSegmentDialog(false);
      await fetchSegments();
    } catch {
      toast.error("Erro ao salvar segmento");
    } finally {
      setSavingSegment(false);
    }
  };

  const handleDeleteSegment = async () => {
    if (deleteSegmentId === null) return;
    try {
      const res = await fetch(`/api/segments/${deleteSegmentId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      toast.success("Segmento excluído!");
      await fetchSegments();
    } catch {
      toast.error("Erro ao excluir segmento");
    }
    setDeleteSegmentId(null);
  };

  const loading = loadingServices || loadingSegments;

  if (loading) {
    return (
      <div>
        <PageHeader title="Segmentos" subtitle="Gerencie os segmentos e serviços da empresa" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const sortedServices = [...services].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-12">
      {/* ========== SECTION 1: SERVICES TABLE ========== */}
      <div>
        <PageHeader
          title="Segmentos"
          subtitle="Serviços exibidos na página /segmentos"
          action={
            <Button size="sm" onClick={openCreateService}>
              <Plus className="w-4 h-4" /> Novo Serviço
            </Button>
          }
        />

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ícone</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="w-20">Imagem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Ordem</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedServices.map((s) => (
                <TableRow key={s.id} className="hover:bg-accent/5">
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <ServiceIcon name={s.icon} className="w-5 h-5 text-accent" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{s.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">{s.description}</TableCell>
                  <TableCell>
                    {s.image && <img src={s.image} alt={s.name} className="w-16 h-12 object-cover rounded-md" />}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.active ? "success" : "secondary"}>{s.active ? "Ativo" : "Inativo"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.order}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditService(s)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteServiceId(s.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* ========== SECTION 2: SEGMENTS CARDS ========== */}
      <div>
        <PageHeader
          title="Segmentos que aparecem na Home"
          subtitle="Cards simples com ícones exibidos na seção de setores"
          action={
            <Button size="sm" onClick={openCreateSegment}>
              <Plus className="w-4 h-4" /> Novo Segmento
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map((s) => {
            const Icon = getIconComponent(s.image || "");
            return (
              <Card
                key={s.id}
                className={`transition-colors ${s.active ? "hover:border-primary/30" : "opacity-60"}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditSegment(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteSegmentId(s.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={s.active ? "success" : "secondary"}>{s.active ? "Ativo" : "Inativo"}</Badge>
                    <Switch checked={s.active} onCheckedChange={() => toggleSegmentActive(s)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {segments.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="mb-4">Nenhum segmento cadastrado.</p>
            <Button onClick={openCreateSegment}><Plus className="w-4 h-4" /> Criar primeiro segmento</Button>
          </div>
        )}
      </div>

      {/* ========== SERVICE EDIT/CREATE DIALOG ========== */}
      <Dialog open={editServiceDialog} onOpenChange={(open) => { setEditServiceDialog(open); if (!open) setEditingService(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewService ? "Novo Serviço" : "Editar Serviço"}</DialogTitle>
          </DialogHeader>
          {editingService && (
            <div className="space-y-4">
              <div>
                <Label>Ícone</Label>
                <Select value={editingService.icon} onValueChange={(value) => setEditingService({ ...editingService, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <ServiceIcon name={opt.value} className="w-4 h-4 text-accent" />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nome</Label>
                <Input value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={editingService.description} onChange={(e) => setEditingService({ ...editingService, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Imagem</Label>
                <input ref={serviceFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleServiceImageUpload} />
                {editingService.image ? (
                  <div className="mt-2 space-y-2">
                    <div className="relative rounded-xl overflow-hidden aspect-video border border-border group">
                      <img src={editingService.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" onClick={() => serviceFileInputRef.current?.click()} disabled={uploadingService}>
                          {uploadingService ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...</> : "Alterar Imagem"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => serviceFileInputRef.current?.click()}
                    className="mt-2 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    {uploadingService ? <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" /> : <Upload className="w-6 h-6 text-muted-foreground mb-2" />}
                    <p className="text-sm text-muted-foreground">{uploadingService ? "Enviando..." : "Clique para enviar imagem"}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingService.active} onCheckedChange={(checked) => setEditingService({ ...editingService, active: checked })} />
                <Label>Ativo</Label>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input type="number" value={editingService.order} onChange={(e) => setEditingService({ ...editingService, order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditServiceDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveService} disabled={savingService}>
              {savingService ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : isNewService ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== SEGMENT EDIT/CREATE DIALOG ========== */}
      <Dialog open={editSegmentDialog} onOpenChange={setEditSegmentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSegment ? "Editar Segmento" : "Novo Segmento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ex: Varejo & Franquias" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Breve descrição do segmento..." />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-8 gap-2 max-h-[200px] overflow-y-auto p-1">
                {AVAILABLE_ICONS.map(({ name, icon: IconComp }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setEditIcon(name)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      editIcon === name
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                    }`}
                    title={name}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSegmentDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveSegment} disabled={savingSegment}>
              {savingSegment ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========== SERVICE DELETE CONFIRMATION ========== */}
      <AlertDialog open={deleteServiceId !== null} onOpenChange={(open) => !open && setDeleteServiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O serviço será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== SEGMENT DELETE CONFIRMATION ========== */}
      <AlertDialog open={deleteSegmentId !== null} onOpenChange={(open) => !open && setDeleteSegmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir segmento?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSegment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
