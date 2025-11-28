import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: loading } = trpc.auth.me.useQuery();
  const isAuthenticated = !!user;
  const utils = trpc.useUtils();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/");
    },
  });
  const { data: silos, isLoading } = trpc.silos.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Calcular estatísticas
  const stats = silos
    ? {
        totalSilos: silos.length,
        silosAtivos: silos.filter((s) => s.disponivel).length,
        silosInativos: silos.filter((s) => !s.disponivel).length,
        capacidadeTotal: silos.reduce((acc, s) => acc + s.capacidadeTotal, 0),
        capacidadeDisponivel: silos.reduce((acc, s) => acc + s.capacidadeDisponivel, 0),
        capacidadeOcupada: silos.reduce(
          (acc, s) => acc + (s.capacidadeTotal - s.capacidadeDisponivel),
          0
        ),
        receitaPotencial: silos.reduce(
          (acc, s) => acc + s.capacidadeDisponivel * parseFloat(s.precoTonelada),
          0
        ),
      }
    : null;

  const taxaOcupacao = stats
    ? ((stats.capacidadeOcupada / stats.capacidadeTotal) * 100).toFixed(1)
    : "0";

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <span className="text-3xl">🌾</span>
              <span className="text-2xl font-bold text-green-700">SiloShare</span>
            </div>
            <Button onClick={() => setLocation("/")} variant="outline">
              Voltar
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-8">Você precisa estar logado para acessar esta página.</p>
          <Button onClick={() => setLocation("/")} className="bg-green-700 hover:bg-green-800">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <Header />

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral dos seus silos e estatísticas</p>
        </div>

        {stats && stats.totalSilos > 0 ? (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total de Silos */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total de Silos</CardDescription>
                  <CardTitle className="text-4xl">{stats.totalSilos}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {stats.silosAtivos} ativos • {stats.silosInativos} inativos
                  </div>
                </CardContent>
              </Card>

              {/* Capacidade Total */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Capacidade Total</CardDescription>
                  <CardTitle className="text-4xl">
                    {(stats.capacidadeTotal / 1000).toFixed(1)}k
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">toneladas</div>
                </CardContent>
              </Card>

              {/* Taxa de Ocupação */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Taxa de Ocupação</CardDescription>
                  <CardTitle className="text-4xl">{taxaOcupacao}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {stats.capacidadeOcupada.toLocaleString()} t ocupadas
                  </div>
                </CardContent>
              </Card>

              {/* Receita Potencial */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Receita Potencial</CardDescription>
                  <CardTitle className="text-4xl">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.receitaPotencial)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">por mês (capacidade disponível)</div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhamento */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Capacidade por Silo */}
              <Card>
                <CardHeader>
                  <CardTitle>Capacidade por Silo</CardTitle>
                  <CardDescription>Distribuição da capacidade total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {silos?.map((silo) => {
                      const percentual = (
                        (silo.capacidadeTotal / stats.capacidadeTotal) *
                        100
                      ).toFixed(1);
                      return (
                        <div key={silo.id}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{silo.nome}</span>
                            <span className="text-sm text-gray-600">{percentual}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-700 h-2 rounded-full"
                              style={{ width: `${percentual}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Disponibilidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Disponibilidade</CardTitle>
                  <CardDescription>Capacidade disponível vs ocupada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Disponível</span>
                        <span className="text-sm font-medium text-green-700">
                          {stats.capacidadeDisponivel.toLocaleString()} t
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-700 h-3 rounded-full"
                          style={{
                            width: `${(stats.capacidadeDisponivel / stats.capacidadeTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Ocupada</span>
                        <span className="text-sm font-medium text-orange-600">
                          {stats.capacidadeOcupada.toLocaleString()} t
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-600 h-3 rounded-full"
                          style={{
                            width: `${(stats.capacidadeOcupada / stats.capacidadeTotal) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setLocation("/cadastrar-silo")}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    + Cadastrar Novo Silo
                  </Button>
                  <Button onClick={() => setLocation("/meus-silos")} variant="outline">
                    Gerenciar Silos
                  </Button>
                  <Button onClick={() => setLocation("/buscar-armazenagem")} variant="outline">
                    Ver Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum dado disponível</h3>
              <p className="text-gray-600 mb-6">
                Cadastre seu primeiro silo para visualizar estatísticas
              </p>
              <Button
                onClick={() => setLocation("/cadastrar-silo")}
                className="bg-green-700 hover:bg-green-800"
              >
                Cadastrar Primeiro Silo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

