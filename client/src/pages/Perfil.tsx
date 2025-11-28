import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Lock,
  Camera,
  Save,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Perfil() {
  const { data: user, refetch } = trpc.auth.me.useQuery();
  const updateProfileMutation = trpc.profile.update.useMutation();
  const changePasswordMutation = trpc.profile.changePassword.useMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Dados do perfil
  const [name, setName] = useState(user?.name || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  // Dados de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: name || undefined,
        telefone: telefone || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      await refetch();
      setIsEditing(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setTelefone(user?.telefone || "");
    setAvatarUrl(user?.avatarUrl || "");
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada com sucesso!");
    } catch (error: any) {
      if (error.message?.includes("incorreta")) {
        toast.error("Senha atual incorreta");
      } else {
        toast.error("Erro ao alterar senha");
      }
      console.error(error);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-2">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card do Avatar */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || user.avatarUrl} alt={user.name || "Usuário"} />
                  <AvatarFallback className="bg-green-600 text-white text-3xl">
                    {getInitials(user.name || "US")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500">
                {user.tipoUsuario === 'proprietario' ? 'Proprietário' : 'Produtor'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Membro desde</span>
                <span className="font-medium">
                  {user.createdAt && new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {user.avaliacaoMedia > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avaliação</span>
                  <span className="font-medium">
                    ⭐ {user.avaliacaoMedia.toFixed(1)} ({user.totalAvaliacoes} avaliações)
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Informações Pessoais */}
        <Card className="lg:col-span-2 border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Informações Pessoais
              </CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Seu nome completo"
                />
              </div>

              {/* E-mail (não editável) */}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={user.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  O e-mail não pode ser alterado
                </p>
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  disabled={!isEditing}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* CPF/CNPJ (não editável) */}
              {user.cpfCnpj && (
                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={user.cpfCnpj}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    O CPF/CNPJ não pode ser alterado
                  </p>
                </div>
              )}

              {/* URL do Avatar (apenas em modo de edição) */}
              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">URL da Foto de Perfil</Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <p className="text-xs text-gray-500">
                    Cole o link de uma imagem hospedada na internet
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Segurança */}
        <Card className="lg:col-span-3 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Senha</p>
                <p className="text-sm text-gray-500">
                  Última alteração: {user.lastSignedIn && new Date(user.lastSignedIn).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                Alterar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Alterar Senha */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha que deseja usar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a nova senha novamente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangingPassword(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
