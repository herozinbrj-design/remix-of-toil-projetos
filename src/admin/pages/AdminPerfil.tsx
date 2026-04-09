import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, KeyRound } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

export default function AdminPerfil() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
      })
      .catch(() => toast.error("Erro ao carregar perfil"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${profile?.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error();
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch(`/api/users/${profile?.id}/password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Erro ao alterar senha");
      }
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações pessoais e senha" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Input value={profile?.role || ""} disabled className="opacity-60" />
            </div>
            <Separator />
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Salvando...</> : <><Save className="w-4 h-4 mr-2" /> Salvar Perfil</>}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alterar Senha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" />
            </div>
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Digite a nova senha" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" />
            </div>
            <Separator />
            <Button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword}>
              {changingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Alterando...</> : <><KeyRound className="w-4 h-4 mr-2" /> Alterar Senha</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
