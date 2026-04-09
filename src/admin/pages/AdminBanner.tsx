import { useState, useEffect, useRef } from "react";
import { Upload, Eye, Plus, Trash2, ChevronLeft, ChevronRight, Copy, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Banner {
  id: number | null;
  subtitle: string;
  title: string;
  description: string;
  ctaPrimary: string;
  ctaPrimaryLink: string;
  ctaSecondary: string;
  ctaSecondaryLink: string;
  imageUrl: string;
  overlayColor: string;
  overlayOpacity: number;
  order: number;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders(extra?: Record<string, string>) {
  return { Authorization: `Bearer ${getToken()}`, ...extra };
}

function mapApiBanner(b: Record<string, unknown>): Banner {
  return {
    id: b.id as number,
    subtitle: (b.subtitle as string) || "",
    title: (b.title as string) || "",
    description: (b.description as string) || "",
    ctaPrimary: (b.ctaPrimary as string) || "Solicitar Orçamento",
    ctaPrimaryLink: (b.ctaPrimaryLink as string) || "/contato",
    ctaSecondary: (b.ctaSecondary as string) || "Ver Portfólio",
    ctaSecondaryLink: (b.ctaSecondaryLink as string) || "/portfolio",
    imageUrl: (b.image as string) || "",
    overlayColor: (b.overlayColor as string) || "#0a1628",
    overlayOpacity: (b.overlayOpacity as number) ?? 70,
    order: (b.order as number) ?? 0,
  };
}

export default function AdminBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSlide, setPreviewSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const active = banners[activeIndex];

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setBanners(data.map(mapApiBanner));
      } else {
        setBanners([]);
      }
    } catch {
      toast.error("Erro ao carregar banners");
    } finally {
      setLoading(false);
    }
  }

  const updateBanner = (field: keyof Banner, value: string | number) => {
    setBanners((prev) =>
      prev.map((b, i) => (i === activeIndex ? { ...b, [field]: value } : b))
    );
  };

  const addBanner = () => {
    const newBanner: Banner = {
      id: null,
      subtitle: "NOVO BANNER",
      title: "Título do novo banner",
      description: "Descrição do novo banner.",
      ctaPrimary: "Solicitar Orçamento",
      ctaPrimaryLink: "/contato",
      ctaSecondary: "Ver Portfólio",
      ctaSecondaryLink: "/portfolio",
      imageUrl: "",
      overlayColor: "#0a1628",
      overlayOpacity: 70,
      order: banners.length,
    };
    setBanners((prev) => [...prev, newBanner]);
    setActiveIndex(banners.length);
    toast.success("Novo banner adicionado! Salve para persistir.");
  };

  const duplicateBanner = (index: number) => {
    const source = banners[index];
    const dup: Banner = { ...source, id: null, title: source.title + " (cópia)", order: banners.length };
    const next = [...banners];
    next.splice(index + 1, 0, dup);
    setBanners(next);
    setActiveIndex(index + 1);
    toast.success("Banner duplicado! Salve para persistir.");
  };

  const removeBanner = async (index: number) => {
    if (banners.length <= 1) {
      toast.error("É necessário pelo menos 1 banner.");
      return;
    }
    const banner = banners[index];
    if (banner.id) {
      try {
        const res = await fetch(`/api/banners/${banner.id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error();
      } catch {
        toast.error("Erro ao remover banner");
        return;
      }
    }
    setBanners((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((prev) => Math.min(prev, banners.length - 2));
    toast.success("Banner removido.");
  };

  const moveBanner = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= banners.length) return;
    const next = [...banners];
    [next[from], next[to]] = [next[to], next[from]];
    setBanners(next);
    setActiveIndex(to);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload?section=banners", {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Erro no upload");
      }

      const data = await res.json();
      updateBanner("imageUrl", data.url);
      toast.success("Imagem enviada com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (let i = 0; i < banners.length; i++) {
        const b = banners[i];
        const body = {
          title: b.title,
          subtitle: b.subtitle,
          description: b.description,
          image: b.imageUrl,
          ctaPrimary: b.ctaPrimary,
          ctaPrimaryLink: b.ctaPrimaryLink,
          ctaSecondary: b.ctaSecondary,
          ctaSecondaryLink: b.ctaSecondaryLink,
          overlayColor: b.overlayColor,
          overlayOpacity: b.overlayOpacity,
          order: i,
          active: true,
        };

        if (b.id) {
          const res = await fetch(`/api/banners/${b.id}`, {
            method: "PUT",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("Erro ao atualizar banner");
        } else {
          const res = await fetch("/api/banners", {
            method: "POST",
            headers: authHeaders({ "Content-Type": "application/json" }),
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("Erro ao criar banner");
        }
      }

      toast.success("Banners salvos com sucesso!");
      await fetchBanners();
    } catch {
      toast.error("Erro ao salvar banners. Verifique se está logado.");
    } finally {
      setSaving(false);
    }
  };

  const nextPreview = () => setPreviewSlide((p) => (p + 1) % banners.length);
  const prevPreview = () => setPreviewSlide((p) => (p - 1 + banners.length) % banners.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Banner Principal</h3>
          <p className="text-sm text-muted-foreground">{banners.length} banner{banners.length !== 1 ? "s" : ""} cadastrado{banners.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setPreviewMode(!previewMode); setPreviewSlide(0); }} disabled={banners.length === 0}>
            <Eye className="w-4 h-4" /> {previewMode ? "Fechar" : "Preview"}
          </Button>
          <Button size="sm" onClick={addBanner}>
            <Plus className="w-4 h-4" /> Novo Banner
          </Button>
        </div>
      </div>

      {/* Preview Slider */}
      <AnimatePresence>
        {previewMode && banners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="relative rounded-xl overflow-hidden aspect-[16/6] bg-card border border-border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {banners[previewSlide]?.imageUrl && (
                    <img src={banners[previewSlide].imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 1 - (banners[previewSlide]?.overlayOpacity || 70) / 100 }} />
                  )}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${banners[previewSlide]?.overlayColor || '#0a1628'}cc, ${banners[previewSlide]?.overlayColor || '#0a1628'}40)` }} />
                  <div className="relative z-10 flex flex-col justify-center h-full px-10 max-w-2xl">
                    <span className="text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-2">{banners[previewSlide]?.subtitle}</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3 leading-tight">{banners[previewSlide]?.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{banners[previewSlide]?.description}</p>
                    <div className="flex gap-3 mt-5">
                      <span className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">{banners[previewSlide]?.ctaPrimary}</span>
                      <span className="px-4 py-2 border border-border text-foreground text-xs font-semibold rounded-lg">{banners[previewSlide]?.ctaSecondary}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <Button variant="ghost" size="icon" onClick={prevPreview} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-foreground hover:bg-black/70"><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={nextPreview} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/50 text-foreground hover:bg-black/70"><ChevronRight className="w-4 h-4" /></Button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setPreviewSlide(i)} className={`w-2 h-2 rounded-full transition-all ${i === previewSlide ? "bg-primary w-6" : "bg-foreground/40"}`} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {banners.length === 0 && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">Nenhum banner cadastrado.</p>
          <Button onClick={addBanner}><Plus className="w-4 h-4" /> Criar primeiro banner</Button>
        </div>
      )}

      {/* Banner tabs */}
      {banners.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {banners.map((b, i) => (
            <Button key={b.id ?? `new-${i}`} variant={i === activeIndex ? "default" : "outline"} size="sm" onClick={() => setActiveIndex(i)} className="gap-2">
              <span className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
              <span className="max-w-[150px] truncate">{b.title}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Editor */}
      {active && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Banner {activeIndex + 1} de {banners.length}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => moveBanner(activeIndex, -1)} disabled={activeIndex === 0}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveBanner(activeIndex, 1)} disabled={activeIndex === banners.length - 1}><ChevronRight className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => duplicateBanner(activeIndex)}><Copy className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => removeBanner(activeIndex)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input value={active.subtitle} onChange={(e) => updateBanner("subtitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Título Principal</Label>
                <Textarea rows={3} value={active.title} onChange={(e) => updateBanner("title", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea rows={4} value={active.description} onChange={(e) => updateBanner("description", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>Imagem de Fundo</Label>
                {active.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-border group">
                    <img src={active.imageUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm" onClick={triggerFileInput} disabled={uploading}>
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...</> : "Alterar Imagem"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div onClick={triggerFileInput} className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer">
                    {uploading ? <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" /> : <Upload className="w-8 h-8 text-muted-foreground mb-3" />}
                    <p className="text-sm text-muted-foreground">{uploading ? "Enviando imagem..." : "Clique para adicionar imagem"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Recomendado: 1920x800px</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input value={active.imageUrl} onChange={(e) => updateBanner("imageUrl", e.target.value)} placeholder="https://..." />
              </div>

              {/* CTA Buttons with Links */}
              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Botões CTA</Label>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border space-y-2">
                    <Label className="text-xs text-muted-foreground">Botão 1 (Primário)</Label>
                    <Input value={active.ctaPrimary} onChange={(e) => updateBanner("ctaPrimary", e.target.value)} placeholder="Texto do botão" />
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={active.ctaPrimaryLink} onChange={(e) => updateBanner("ctaPrimaryLink", e.target.value)} placeholder="/contato" className="text-xs" />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-border space-y-2">
                    <Label className="text-xs text-muted-foreground">Botão 2 (Secundário)</Label>
                    <Input value={active.ctaSecondary} onChange={(e) => updateBanner("ctaSecondary", e.target.value)} placeholder="Texto do botão" />
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Input value={active.ctaSecondaryLink} onChange={(e) => updateBanner("ctaSecondaryLink", e.target.value)} placeholder="/portfolio" className="text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Cor de Sobreposição</Label>
                <div className="flex items-center gap-4">
                  <input type="color" value={active.overlayColor} onChange={(e) => updateBanner("overlayColor", e.target.value)} className="w-12 h-12 rounded-lg border border-border cursor-pointer bg-transparent" />
                  <Input value={active.overlayColor} onChange={(e) => updateBanner("overlayColor", e.target.value)} className="flex-1 font-mono text-xs" placeholder="#0a1628" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Opacidade</Label>
                    <span className="text-xs text-muted-foreground font-mono">{active.overlayOpacity}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={active.overlayOpacity} onChange={(e) => updateBanner("overlayOpacity", Number(e.target.value))} className="w-full accent-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      {banners.length > 0 && (
        <>
          <Separator className="mt-8" />
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={fetchBanners} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : "Salvar Alterações"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
