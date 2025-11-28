import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function MeusSilos() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const { data: silos, isLoading, refetch } = trpc.silos.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteSilo = trpc.silos.delete.useMutation({
    onSuccess: () => {
      toast.success("Silo removido com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao remover silo: " + error.message);
    },
  });

  const updateSilo = trpc.silos.update.useMutation({
    onSuccess: () => {
      toast.success("Silo atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar silo: " + error.message);
    },
  });

  const handleToggleDisponibilidade = (id: number, disponivel: boolean | null) => {
    updateSilo.mutate({ id, disponivel: !disponivel });
  };

  const handleDelete = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja remover o silo "${nome}"?`)) {
      deleteSilo.mutate({ id });
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(price));
  };

  const parseTiposGraos = (tiposGraosJson: string): string[] => {
    try {
      return JSON.parse(tiposGraosJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
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
          <h1 className="text-4xl font-bold mb-2">Meus Silos</h1>
          <p className="text-gray-600">Gerencie seus anúncios de armazenagem</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : silos && silos.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {silos.map((silo) => (
              <Card key={silo.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{silo.nome}</CardTitle>
                      <CardDescription>
                        {silo.cidade}, {silo.estado}
                      </CardDescription>
                    </div>
                    <Badge variant={silo.disponivel ? "default" : "secondary"}>
                      {silo.disponivel ? "Disponível" : "Indisponível"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {silo.descricao && (
                    <p className="text-sm text-gray-600 line-clamp-2">{silo.descricao}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacidade Total:</span>
                      <span className="font-semibold">{silo.capacidadeTotal.toLocaleString()} t</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Disponível:</span>
                      <span className="font-semibold text-green-700">
                        {silo.capacidadeDisponivel.toLocaleString()} t
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-semibold">{formatPrice(silo.precoTonelada)}/t/mês</span>
                    </div>
                  </div>

                  {/* Tipos de Grãos */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Grãos aceitos:</p>
                    <div className="flex flex-wrap gap-2">
                      {parseTiposGraos(silo.tiposGraos).map((grao) => (
                        <Badge key={grao} variant="secondary" className="text-xs">
                          {grao}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="space-y-2 pt-4">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-green-700 hover:bg-green-800"
                      onClick={() => setLocation(`/editar-silo/${silo.id}`)}
                    >
                      Editar
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleDisponibilidade(silo.id, silo.disponivel)}
                        disabled={updateSilo.isPending}
                      >
                        {silo.disponivel ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(silo.id, silo.nome)}
                        disabled={deleteSilo.isPending}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum silo cadastrado</h3>
              <p className="text-gray-600 mb-6">
                Comece cadastrando seu primeiro silo para disponibilizar no marketplace
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

