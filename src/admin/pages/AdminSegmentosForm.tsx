import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, Save, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ServiceIcon from "@/components/ServiceIcon";
import { iconOptions } from "@/contexts/ServicesContext";
import RichTextEditor from "@/components/RichTextEditor";

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminSegmentosForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Layers");
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (isEdit) {
      fetchSegment();
    }
  }, [id]);

  const fetchSegment = async () => {
    try {
      const res = await fetch(`/api/seo-segments/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setName(data.name);
      setSlug(data.slug || "");
      setSubtitle(data.subtitle || "");
      setDescription(data.description || "");
      setIcon(data.icon || "Layers");
      setImage(data.image || "");
      setGallery(data.gallery ? JSON.parse(data.gallery) : []);
      setActive(data.active);
      setOrder(data.order);
    } catch {
      toast.error("Erro ao carregar segmento");
      navigate("/admin/segmentos");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit || !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=segments", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImage(data.url);
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);
        const res = await fetch("/api/upload?section=segments", {
          method: "POST",
          headers: authHeaders(),
          body: formData,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      
      setGallery([...gallery, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} imagem(ns) adicionada(s) à galeria!`);
    } catch {
      toast.error("Erro ao enviar imagens");
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
    toast.success("Imagem removida da galeria");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    // Gera slug automaticamente se estiver vazio
    const finalSlug = slug.trim() || generateSlug(name);

    setSaving(true);
    try {
      const body = {
        name,
        slug: finalSlug,
        subtitle: subtitle || null,
        description: description || null,
        icon: icon,
        image: image || null,
        gallery: gallery.length > 0 ? JSON.stringify(gallery) : null,
        active,
        order,
      };

      if (isEdit) {
        const res = await fetch(`/api/seo-segments/${id}`, {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Erro ao atualizar");
        }
        toast.success("Segmento atualizado!");
      } else {
        const res = await fetch("/api/seo-segments", {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Erro ao criar");
        }
        toast.success("Segmento criado!");
      }
      navigate("/admin/segmentos");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar segmento");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={isEdit ? "Editar Segmento" : "Novo Segmento"} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Editar Segmento" : "Novo Segmento"}
        subtitle="Preencha os dados do segmento/serviço"
        action={
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/segmentos")}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Segmento *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Peças em Acrílico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug (URL)
                  <span className="text-xs text-muted-foreground ml-2">
                    Gerado automaticamente a partir do nome
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/segmentos/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="pecas-em-acrilico"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtítulo</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Soluções personalizadas em acrílico"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição Completa (Rich Text)</Label>
                <RichTextEditor value={description} onChange={setDescription} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={active} onCheckedChange={setActive} />
                  <span className="text-sm">{active ? "Ativo" : "Inativo"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Ordem de Exibição</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select value={icon} onValueChange={setIcon}>
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

              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {image ? (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-video border border-border group">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...
                            </>
                          ) : (
                            "Alterar Imagem"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {uploading ? "Enviando..." : "Clique para enviar"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Galeria de Imagens */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Galeria de Imagens</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Imagens
                </Button>
              </div>
              
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleGalleryUpload}
              />

              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {gallery.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                  Nenhuma imagem na galeria
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> {isEdit ? "Atualizar" : "Criar"} Segmento
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
