import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, Home } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { usePortfolio, categoryOptions, statusOptions, PortfolioItem } from "@/contexts/PortfolioContext";

interface Segment {
  id: number;
  name: string;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link", "image"],
    ["clean"],
  ],
};

export default function AdminPortfolioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isView = searchParams.get("view") === "true";
  const isEdit = !!id;
  const { addProject, updateProject, getProject } = usePortfolio();

  const [segments, setSegments] = useState<Segment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<Omit<PortfolioItem, "id">>({
    name: "",
    category: categoryOptions[0],
    segment: "",
    segmentId: null,
    date: new Date().toLocaleDateString("pt-BR"),
    status: "Rascunho",
    image: "",
    description: "",
    showOnHome: false,
  });

  // Fetch segments from API
  useEffect(() => {
    fetch("/api/segments")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setSegments(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const project = getProject(parseInt(id));
      if (project) {
        const { id: _, ...rest } = project;
        setForm(rest);
      }
    }
  }, [id, isEdit, getProject]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload?section=portfolio", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token") || ""}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.url }));
      toast.success("Imagem enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Preencha o nome do projeto.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateProject(parseInt(id), form);
        toast.success("Projeto atualizado!");
      } else {
        await addProject(form);
        toast.success("Projeto criado!");
      }
      navigate("/admin/portfolio");
    } catch {
      toast.error("Erro ao salvar projeto");
    } finally {
      setSaving(false);
    }
  };

  const title = isView ? "Visualizar Projeto" : isEdit ? "Editar Projeto" : "Novo Projeto";

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={isView ? "Detalhes do projeto" : isEdit ? "Altere as informações do projeto" : "Preencha os dados do novo projeto"}
        action={
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/portfolio")}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nome do Projeto</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={isView} />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })} disabled={isView}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select
                value={form.segmentId?.toString() || ""}
                onValueChange={(v) => {
                  const seg = segments.find((s) => s.id === parseInt(v));
                  setForm({ ...form, segmentId: parseInt(v), segment: seg?.name || "" });
                }}
                disabled={isView}
              >
                <SelectTrigger><SelectValue placeholder="Selecione um segmento" /></SelectTrigger>
                <SelectContent>
                  {segments.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as PortfolioItem["status"] })} disabled={isView}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} disabled={isView} />
            </div>
            <div className="space-y-2">
              <Label>Imagem</Label>
              {form.image ? (
                <div className="space-y-2">
                  <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                  {!isView && (
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <Button variant="outline" size="sm" asChild disabled={uploading}>
                          <span>{uploading ? "Enviando..." : "Trocar Imagem"}</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isView} />
                  <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" /> : <Upload className="w-6 h-6 text-muted-foreground mb-2" />}
                    <p className="text-sm text-muted-foreground">{uploading ? "Enviando..." : "Clique para enviar imagem"}</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* showOnHome */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Exibir na Home</p>
              <p className="text-xs text-muted-foreground">Mostra este projeto na seção "Projetos que inspiram" da página inicial</p>
            </div>
            <Switch
              checked={form.showOnHome}
              onCheckedChange={(checked) => setForm({ ...form, showOnHome: checked })}
              disabled={isView}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição do Projeto</Label>
            <div className="bg-background rounded-md border border-border [&_.ql-toolbar]:border-border [&_.ql-container]:border-border [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-foreground [&_.ql-toolbar]:bg-muted/30 [&_.ql-picker-label]:text-foreground [&_.ql-stroke]:stroke-foreground [&_.ql-fill]:fill-foreground [&_.ql-picker-options]:bg-popover [&_.ql-picker-options]:border-border [&_.ql-picker-item]:text-foreground">
              <ReactQuill
                theme="snow"
                value={form.description}
                onChange={(value) => setForm({ ...form, description: value })}
                modules={quillModules}
                readOnly={isView}
              />
            </div>
          </div>

          {!isView && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : isEdit ? "Salvar Alterações" : "Criar Projeto"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/admin/portfolio")}>Cancelar</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
