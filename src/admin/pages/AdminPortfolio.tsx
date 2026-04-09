import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { usePortfolio } from "@/contexts/PortfolioContext";

const statusBadge = (s: string) => {
  if (s === "Publicado") return "success" as const;
  if (s === "Rascunho") return "secondary" as const;
  return "warning" as const;
};

export default function AdminPortfolio() {
  const navigate = useNavigate();
  const { projects, deleteProject } = usePortfolio();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteProject(deleteId);
        toast.success("Projeto excluído com sucesso!");
      } catch {
        toast.error("Erro ao excluir projeto");
      }
      setDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Portfólio"
        subtitle="Gerencie os projetos exibidos no site"
        action={
          <Button size="sm" onClick={() => navigate("/admin/portfolio/novo")}>
            <Plus className="w-4 h-4" /> Novo Projeto
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Segmento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id} className="hover:bg-accent/5">
                <TableCell>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-purple-500/30" />
                  )}
                </TableCell>
                <TableCell className="font-semibold">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.category}</TableCell>
                <TableCell><Badge variant="outline">{p.segment}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{p.date}</TableCell>
                <TableCell><Badge variant={statusBadge(p.status)}>{p.status}</Badge></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate("/portfolio")}>
                        <Eye className="mr-2 h-4 w-4" /> Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/portfolio/${p.id}/editar`)}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(p.id)}>
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

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O projeto será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
