import { useState, useEffect, useCallback } from "react";
import {
  Download, CheckCheck, Eye, Trash2, MoreHorizontal,
  Search, Filter, RefreshCw, MessageSquare, Phone, Mail,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { usePermissions } from "../../contexts/PermissionsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type LeadStatus = "NOVO" | "EM_ANALISE" | "RESPONDIDO" | "CONVERTIDO" | "ARQUIVADO";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string | null;
  source: string | null;
  status: LeadStatus;
  createdAt: string;
  client: { id: number; name: string } | null;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em análise",
  RESPONDIDO: "Respondido",
  CONVERTIDO: "Convertido",
  ARQUIVADO: "Arquivado",
};

const STATUS_VARIANT: Record<LeadStatus, "success" | "warning" | "info" | "default" | "secondary"> = {
  NOVO: "success",
  EM_ANALISE: "warning",
  RESPONDIDO: "info",
  CONVERTIDO: "default",
  ARQUIVADO: "secondary",
};

const STATUS_OPTIONS: LeadStatus[] = ["NOVO", "EM_ANALISE", "RESPONDIDO", "CONVERTIDO", "ARQUIVADO"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("admin_token") || "";
  return { Authorization: `Bearer ${token}` };
}

export default function AdminLeads() {
  const { hasPermission } = usePermissions();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "TODOS">("TODOS");
  const [detail, setDetail] = useState<Lead | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", { headers: getAuthHeader() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data);
    } catch {
      toast.error("Erro ao carregar leads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: number, status: LeadStatus) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
      if (detail?.id === id) setDetail((d) => d ? { ...d, status } : d);
      toast.success("Status atualizado.");
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Excluir este lead permanentemente?")) return;
    try {
      await fetch(`/api/leads/${id}`, { method: "DELETE", headers: getAuthHeader() });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelected((prev) => prev.filter((i) => i !== id));
      if (detail?.id === id) setDetail(null);
      toast.success("Lead excluído.");
    } catch {
      toast.error("Erro ao excluir lead.");
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Excluir ${selected.length} lead(s) selecionado(s)?`)) return;
    await Promise.all(selected.map((id) =>
      fetch(`/api/leads/${id}`, { method: "DELETE", headers: getAuthHeader() })
    ));
    setLeads((prev) => prev.filter((l) => !selected.includes(l.id)));
    setSelected([]);
    toast.success(`${selected.length} lead(s) excluído(s).`);
  };

  const markSelectedAs = async (status: LeadStatus) => {
    await Promise.all(selected.map((id) =>
      fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status }),
      })
    ));
    setLeads((prev) => prev.map((l) => selected.includes(l.id) ? { ...l, status } : l));
    setSelected([]);
    toast.success(`${selected.length} lead(s) marcados como ${STATUS_LABELS[status]}.`);
  };

  const exportCSV = () => {
    const rows = [
      ["ID", "Nome", "E-mail", "Telefone", "Serviço", "Mensagem", "Origem", "Status", "Data"],
      ...filtered.map((l) => [
        l.id, l.name, l.email, l.phone || "", l.service || "",
        (l.message || "").replace(/\n/g, " "), l.source || "",
        STATUS_LABELS[l.status], formatDate(l.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((l) => {
    const matchStatus = filterStatus === "TODOS" || l.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || (l.service || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((l) => l.id));

  const newCount = leads.filter((l) => l.status === "NOVO").length;

  return (
    <div>
      <PageHeader
        title="Leads & Orçamentos"
        subtitle={`${leads.length} contato(s) recebido(s)${newCount > 0 ? ` — ${newCount} novo(s)` : ""}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
          </div>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, e-mail ou serviço…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as LeadStatus | "TODOS")}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ação em lote */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <span className="text-sm font-medium">{selected.length} selecionado(s)</span>
          {hasPermission("edit_leads") && (
            <>
              <Button variant="outline" size="sm" onClick={() => markSelectedAs("RESPONDIDO")}>
                <CheckCheck className="w-4 h-4" /> Marcar Respondido
              </Button>
              <Button variant="outline" size="sm" onClick={() => markSelectedAs("EM_ANALISE")}>Marcar Em análise</Button>
            </>
          )}
          {hasPermission("delete_leads") && (
            <Button variant="destructive" size="sm" onClick={deleteSelected}>Excluir Selecionados</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>Cancelar</Button>
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando leads…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p className="text-sm">{leads.length === 0 ? "Nenhum lead recebido ainda." : "Nenhum lead corresponde ao filtro."}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow
                  key={l.id}
                  className="hover:bg-accent/5 cursor-pointer"
                  data-state={selected.includes(l.id) ? "selected" : undefined}
                  onClick={() => setDetail(l)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={selected.includes(l.id)} onCheckedChange={() => toggleSelect(l.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{l.name}</div>
                    {l.message && (
                      <div className="text-xs text-muted-foreground truncate max-w-40 hidden sm:block">{l.message}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{l.email}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{l.phone || "—"}</TableCell>
                  <TableCell>
                    {l.service ? <Badge variant="info">{l.service}</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{formatDate(l.createdAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v as LeadStatus)}>
                      <SelectTrigger className="h-7 text-xs w-32 border-0 p-0 focus:ring-0">
                        <Badge variant={STATUS_VARIANT[l.status]}>{STATUS_LABELS[l.status]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetail(l)}>
                          <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                        </DropdownMenuItem>
                        {l.email && (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${l.email}`} target="_blank" rel="noopener noreferrer">
                              <Mail className="mr-2 h-4 w-4" /> Enviar E-mail
                            </a>
                          </DropdownMenuItem>
                        )}
                        {l.phone && (
                          <DropdownMenuItem asChild>
                            <a href={`https://wa.me/55${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                              <Phone className="mr-2 h-4 w-4" /> WhatsApp
                            </a>
                          </DropdownMenuItem>
                        )}
                        {hasPermission("delete_leads") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteLead(l.id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{detail.name}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(detail.createdAt)}</p>
                </div>
                <Select value={detail.status} onValueChange={(v) => updateStatus(detail.id, v as LeadStatus)}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">E-mail</p>
                  <a href={`mailto:${detail.email}`} className="text-primary hover:underline">{detail.email}</a>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Telefone</p>
                  {detail.phone ? (
                    <a href={`https://wa.me/55${detail.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {detail.phone}
                    </a>
                  ) : <span className="text-muted-foreground">—</span>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Serviço de interesse</p>
                  <p>{detail.service || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Origem</p>
                  <p>{detail.source || "site"}</p>
                </div>
              </div>

              {detail.message && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Mensagem</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted/40 rounded-lg p-3">{detail.message}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex gap-2 justify-end flex-wrap">
                {detail.email && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${detail.email}`}><Mail className="w-4 h-4" /> Enviar E-mail</a>
                  </Button>
                )}
                {detail.phone && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`https://wa.me/55${detail.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                      <Phone className="w-4 h-4" /> WhatsApp
                    </a>
                  </Button>
                )}
                {hasPermission("delete_leads") && (
                  <Button size="sm" variant="destructive" onClick={() => deleteLead(detail.id)}>
                    <Trash2 className="w-4 h-4" /> Excluir
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
