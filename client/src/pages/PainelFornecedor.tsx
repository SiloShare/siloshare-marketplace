import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRequireVerification } from "@/hooks/useRequireVerification";
import { trpc } from "@/lib/trpc";
import {
  Warehouse,
  Plus,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Edit,
  Eye,
  Trash2,
  LogOut,
  Menu
} from "lucide-react";

export default function PainelFornecedor() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { isVerified } = useRequireVerification();
  const [menuAberto, setMenuAberto] = useState(false);

  // Se não estiver verificado, o hook redireciona automaticamente
  if (!isVerified) return null;

  const { data: silos, isLoading } = trpc.silos.listar.useQuery();
  const meusSilos = silos?.filter(s => s.fornecedorId === user?.id) || [];

  const estatisticas = {
    totalSilos: meusSilos.length,
    capacidadeTotal: meusSilos.reduce((acc, s) => acc + s.capacidadeTotal, 0),
    ocupacao: meusSilos.reduce((acc, s) => acc + (s.capacidadeTotal - s.capacidadeDisponivel), 0),
    receitaMensal: meusSilos.reduce((acc, s) => acc + ((s.capacidadeTotal - s.capacidadeDisponivel) * s.precoTonMes), 0),
  };

  const taxaOcupacao = estatisticas.capacidadeTotal > 0 
    ? (estatisticas.ocupacao / estatisticas.capacidadeTotal) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-black">SiloShare</span>
          </div>
          
          <nav className="hidden md:flex gap-6 items-center">
            <button className="text-gray-700 hover:text-black font-medium transition">
              Meus Silos
            </button>
            <button className="text-gray-700 hover:text-black font-medium transition">
              Reservas
            </button>
            <button className="text-gray-700 hover:text-black font-medium transition">
              Estatísticas
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.nome || "Fornecedor"}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={async () => {
                await logout();
                setLocation("/");
              }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Seu Painel</h1>
          <p className="text-xl text-gray-600">Gerencie seus silos e acompanhe suas métricas em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Silos</CardTitle>
                <Warehouse className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{estatisticas.totalSilos}</p>
              <p className="text-xs text-gray-500 mt-1">Silos cadastrados</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Ocupação</CardTitle>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{taxaOcupacao.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{estatisticas.ocupacao.toLocaleString()} de {estatisticas.capacidadeTotal.toLocaleString()} ton</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Receita Mensal</CardTitle>
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">R$ {estatisticas.receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-green-600 mt-1">+12% vs. mês anterior</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Clientes Ativos</CardTitle>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
              <p className="text-xs text-gray-500 mt-1">Contratos ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Pedidos em Processo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Pedidos em Processo</h2>
          {meusSilos.filter(s => s.statusAprovacao === "pendente" || s.statusAprovacao === "reprovado").length === 0 ? (
            <Card className="p-8 text-center bg-gray-50">
              <p className="text-gray-600">Nenhum pedido em processo no momento.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {meusSilos.filter(s => s.statusAprovacao === "pendente" || s.statusAprovacao === "reprovado").map((silo) => (
                <Card key={silo.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">{silo.nome}</h3>
                        <p className="text-sm text-gray-600 mb-3">{silo.cidade}, {silo.estado}</p>
                        
                        {silo.statusAprovacao === "pendente" && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-yellow-700">Em análise pela equipe</span>
                          </div>
                        )}
                        
                        {silo.statusAprovacao === "reprovado" && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium text-red-700">Cadastro reprovado</span>
                            </div>
                            {silo.motivoReprovacao && (
                              <div className="bg-red-50 p-3 rounded mt-2">
                                <p className="text-xs text-red-600 font-medium mb-1">Motivo:</p>
                                <p className="text-sm text-red-800">{silo.motivoReprovacao}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <Badge 
                          className={
                            silo.statusAprovacao === "pendente" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {silo.statusAprovacao === "pendente" ? "Pendente" : "Reprovado"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Meus Silos Aprovados</h2>
          <Button 
            onClick={() => setLocation("/cadastrar-silo")}
            className="bg-black hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Cadastrar Novo Silo
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando seus silos...</p>
          </div>
        ) : meusSilos.length === 0 ? (
          <Card className="p-12 text-center">
            <Warehouse className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold mb-2">Nenhum silo cadastrado ainda</h3>
            <p className="text-gray-600 mb-6">Comece cadastrando seu primeiro silo e atraia produtores da sua região.</p>
            <Button 
              onClick={() => setLocation("/cadastrar-silo")}
              className="bg-black hover:bg-gray-800"
            >
              <Plus className="h-5 w-5 mr-2" />
              Cadastrar Primeiro Silo
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {meusSilos.filter(s => s.statusAprovacao === "aprovado").map((silo) => {
              const ocupacaoSilo = silo.capacidadeTotal > 0 
                ? ((silo.capacidadeTotal - silo.capacidadeDisponivel) / silo.capacidadeTotal) * 100 
                : 0;

              return (
                <Card key={silo.id} className="border-2 hover:shadow-lg transition">
                  <CardHeader className="border-b">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">{silo.nome}</CardTitle>
                        <p className="text-sm text-gray-600">{silo.cidade}, {silo.estado}</p>
                      </div>
                      <Badge variant={silo.ativo ? "default" : "secondary"}>
                        {silo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Capacidade Total</p>
                        <p className="text-lg font-bold">{silo.capacidadeTotal.toLocaleString()} ton</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Disponível</p>
                        <p className="text-lg font-bold text-green-600">{silo.capacidadeDisponivel.toLocaleString()} ton</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Preço</p>
                        <p className="text-lg font-bold">R$ {silo.precoTonMes}/ton/mês</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Ocupação</p>
                        <p className="text-lg font-bold">{ocupacaoSilo.toFixed(0)}%</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Ocupação</span>
                        <span>{ocupacaoSilo.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${ocupacaoSilo}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/detalhes-silo/${silo.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/editar-silo/${silo.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-2">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Desempenho Mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {["Janeiro", "Fevereiro", "Março", "Abril", "Maio"].map((mes, i) => (
                  <div key={mes}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">{mes}</span>
                      <span className="font-semibold">R$ {(12000 + i * 1500).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-black h-2 rounded-full"
                        style={{ width: `${60 + i * 8}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[
                  { cliente: "Fazenda São José", data: "15/10/2025", valor: "R$ 4.500" },
                  { cliente: "Agropecuária Boa Vista", data: "12/10/2025", valor: "R$ 3.200" },
                  { cliente: "Grãos do Cerrado Ltda", data: "08/10/2025", valor: "R$ 6.800" },
                ].map((reserva, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold">{reserva.cliente}</p>
                      <p className="text-xs text-gray-600">{reserva.data}</p>
                    </div>
                    <p className="font-bold text-green-600">{reserva.valor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

