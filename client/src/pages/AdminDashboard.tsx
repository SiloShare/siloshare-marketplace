import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MapPin,
  Gauge,
  DollarSign,
  Eye,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuthStore } from "@/stores/authStore";

interface Silo {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
  capacidadeTotal: number;
  capacidadeDisponivel: number;
  precoTonMes: string;
  status: "pendente" | "aprovado" | "recusado";
  createdAt: Date;
  userId: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { usuario, isAuthenticated } = useAuthStore();
  const [filtro, setFiltro] = useState("");
  const [siloSelecionado, setSiloSelecionado] = useState<Silo | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [acaoModal, setAcaoModal] = useState<"aprovar" | "recusar" | null>(null);

  // Queries tRPC
  const { data: silos = [], refetch } = trpc.silos.listarParaAprovacao.useQuery();
  const aprovarMutation = trpc.silos.aprovar.useMutation();
  const reprovarMutation = trpc.silos.reprovar.useMutation();

  // Verificar se é admin
  if (!isAuthenticated || usuario?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Apenas administradores podem acessar esta página.
          </p>
          <Button onClick={() => setLocation("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  // Filtrar silos
  const silosFiltrados = silos.filter((silo: Silo) =>
    silo.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    silo.cidade.toLowerCase().includes(filtro.toLowerCase()) ||
    silo.estado.toLowerCase().includes(filtro.toLowerCase())
  );

  // Estatísticas
  const stats = {
    pendentes: silos.filter((s: Silo) => s.status === "pendente").length,
    aprovados: silos.filter((s: Silo) => s.status === "aprovado").length,
    recusados: silos.filter((s: Silo) => s.status === "recusado").length,
  };

  // Aprovar silo
  const handleAprovar = async (siloId: number) => {
    try {
      await aprovarMutation.mutateAsync({ siloId });
      toast.success("Silo aprovado com sucesso!");
      refetch();
      setMostrarModal(false);
      setSiloSelecionado(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao aprovar silo");
    }
  };

  // Recusar silo
  const handleRecusar = async (siloId: number) => {
    if (!motivoRecusa.trim()) {
      toast.error("Por favor, informe o motivo da recusa");
      return;
    }

    try {
      await reprovarMutation.mutateAsync({ siloId, motivo: motivoRecusa });
      toast.success("Silo recusado");
      refetch();
      setMostrarModal(false);
      setSiloSelecionado(null);
      setMotivoRecusa("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao recusar silo");
    }
  };

  // Abrir modal de confirmação
  const abrirModal = (silo: Silo, acao: "aprovar" | "recusar") => {
    setSiloSelecionado(silo);
    setAcaoModal(acao);
    setMostrarModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Admin: {usuario?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
            >
              Voltar para Home
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">
            Gerencie as solicitações de cadastro de silos
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-yellow-600" strokeWidth={1.5} />
              <h3 className="font-semibold text-gray-900">Pendentes</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={1.5} />
              <h3 className="font-semibold text-gray-900">Aprovados</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.aprovados}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-600" strokeWidth={1.5} />
              <h3 className="font-semibold text-gray-900">Recusados</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.recusados}</p>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              strokeWidth={1.5}
            />
            <Input
              type="text"
              placeholder="Buscar por nome, cidade ou estado..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Silos */}
        <div className="space-y-4">
          {silosFiltrados.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border text-center">
              <p className="text-gray-500">Nenhum silo encontrado</p>
            </div>
          ) : (
            silosFiltrados.map((silo: Silo) => (
              <div
                key={silo.id}
                className="bg-white p-6 rounded-lg border-2 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  {/* Informações do Silo */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold">{silo.nome}</h3>
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${
                            silo.status === "pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : silo.status === "aprovado"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        `}
                      >
                        {silo.status === "pendente"
                          ? "Pendente"
                          : silo.status === "aprovado"
                          ? "Aprovado"
                          : "Recusado"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm">
                          {silo.cidade}, {silo.estado}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Gauge className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm">
                          {silo.capacidadeTotal} ton (
                          {silo.capacidadeDisponivel} ton disponível)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm">
                          R$ {silo.precoTonMes}/ton/mês
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Cadastrado em{" "}
                      {new Date(silo.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Ações */}
                  {silo.status === "pendente" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSiloSelecionado(silo)}
                      >
                        <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Ver Detalhes
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => abrirModal(silo, "aprovar")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => abrirModal(silo, "recusar")}
                      >
                        <XCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Recusar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      {mostrarModal && siloSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {acaoModal === "aprovar" ? "Aprovar Silo" : "Recusar Silo"}
              </h3>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setMotivoRecusa("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Silo: <strong>{siloSelecionado.nome}</strong>
            </p>

            {acaoModal === "recusar" && (
              <div className="mb-4">
                <Label htmlFor="motivo">Motivo da Recusa *</Label>
                <Textarea
                  id="motivo"
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  placeholder="Explique o motivo da recusa..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModal(false);
                  setMotivoRecusa("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  acaoModal === "aprovar"
                    ? handleAprovar(siloSelecionado.id)
                    : handleRecusar(siloSelecionado.id)
                }
                className={
                  acaoModal === "aprovar"
                    ? "flex-1 bg-green-600 hover:bg-green-700"
                    : "flex-1 bg-red-600 hover:bg-red-700"
                }
              >
                {acaoModal === "aprovar" ? "Confirmar Aprovação" : "Confirmar Recusa"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

