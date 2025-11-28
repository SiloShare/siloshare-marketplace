import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export default function BuscaAvancada() {
  const [, setLocation] = useLocation();

  const [filtros, setFiltros] = useState({
    cidade: "",
    estado: "MT",
    capacidadeMin: "",
    infraSecagem: false,
    infraLimpeza: false,
    infraAeracao: false,
    infraMonitoramento: false,
  });

  const { data: silos, isLoading, refetch } = trpc.silos.list.useQuery({
    estado: filtros.estado || undefined,
    cidade: filtros.cidade || undefined,
    capacidadeMin: filtros.capacidadeMin ? parseInt(filtros.capacidadeMin) : undefined,
    infraSecagem: filtros.infraSecagem || undefined,
    infraLimpeza: filtros.infraLimpeza || undefined,
    infraAeracao: filtros.infraAeracao || undefined,
    infraMonitoramento: filtros.infraMonitoramento || undefined,
    disponivel: true,
  });

  const handleBuscar = () => {
    refetch();
  };

  const handleLimpar = () => {
    setFiltros({
      cidade: "",
      estado: "MT",
      capacidadeMin: "",
      infraSecagem: false,
      infraLimpeza: false,
      infraAeracao: false,
      infraMonitoramento: false,
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
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

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Busca Avançada</h1>
          <p className="text-gray-600">Encontre o silo ideal com filtros personalizados</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Painel de Filtros */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>Refine sua busca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Localização */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Localização</Label>

                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={filtros.estado}
                      onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                      placeholder="Ex: MT"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={filtros.cidade}
                      onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                      placeholder="Ex: Sorriso"
                    />
                  </div>
                </div>

                {/* Capacidade */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Capacidade</Label>

                  <div>
                    <Label htmlFor="capacidadeMin">Mínima (toneladas)</Label>
                    <Input
                      id="capacidadeMin"
                      type="number"
                      value={filtros.capacidadeMin}
                      onChange={(e) => setFiltros({ ...filtros, capacidadeMin: e.target.value })}
                      placeholder="Ex: 1000"
                    />
                  </div>
                </div>

                {/* Infraestrutura */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Infraestrutura</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraSecagem"
                      checked={filtros.infraSecagem}
                      onCheckedChange={(checked) =>
                        setFiltros({ ...filtros, infraSecagem: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraSecagem">Secagem</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraLimpeza"
                      checked={filtros.infraLimpeza}
                      onCheckedChange={(checked) =>
                        setFiltros({ ...filtros, infraLimpeza: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraLimpeza">Limpeza</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraAeracao"
                      checked={filtros.infraAeracao}
                      onCheckedChange={(checked) =>
                        setFiltros({ ...filtros, infraAeracao: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraAeracao">Aeração</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraMonitoramento"
                      checked={filtros.infraMonitoramento}
                      onCheckedChange={(checked) =>
                        setFiltros({ ...filtros, infraMonitoramento: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraMonitoramento">Monitoramento</Label>
                  </div>
                </div>

                {/* Botões */}
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={handleBuscar}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    Buscar
                  </Button>
                  <Button onClick={handleLimpar} variant="outline" className="w-full">
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {isLoading ? "Carregando..." : `${silos?.length || 0} silos encontrados`}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
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
              <div className="grid md:grid-cols-2 gap-6">
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
                        <Badge variant="default">Disponível</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {silo.descricao && (
                        <p className="text-sm text-gray-600 line-clamp-2">{silo.descricao}</p>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Capacidade Disponível:</span>
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

                      {/* Infraestrutura */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Infraestrutura:</p>
                        <div className="flex flex-wrap gap-2">
                          {silo.infraSecagem && (
                            <Badge variant="outline" className="text-xs">
                              Secagem
                            </Badge>
                          )}
                          {silo.infraLimpeza && (
                            <Badge variant="outline" className="text-xs">
                              Limpeza
                            </Badge>
                          )}
                          {silo.infraAeracao && (
                            <Badge variant="outline" className="text-xs">
                              Aeração
                            </Badge>
                          )}
                          {silo.infraMonitoramento && (
                            <Badge variant="outline" className="text-xs">
                              Monitoramento
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button className="w-full bg-green-700 hover:bg-green-800">
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">Nenhum silo encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros para encontrar mais resultados
                  </p>
                  <Button onClick={handleLimpar} variant="outline">
                    Limpar Filtros
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

