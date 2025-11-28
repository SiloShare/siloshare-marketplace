import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Warehouse, DollarSign, Star, Filter } from "lucide-react";
import { trpc } from "@/_core/trpc";

export default function BuscarArmazenagem() {
  const [, setLocation] = useLocation();
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  const [filtros, setFiltros] = useState({
    cidade: "",
    estado: "MT",
    capacidadeMin: 0,
    capacidadeMax: 10000,
    precoMax: 100,
    infraestrutura: [] as string[],
    ordenarPor: "preco" as "preco" | "distancia" | "avaliacao",
  });

  const { data: silos, isLoading } = trpc.silos.listar.useQuery();

  const infraestruturaOpcoes = [
    { id: "secagem", label: "Secagem", icon: "🔥" },
    { id: "limpeza", label: "Limpeza", icon: "✨" },
    { id: "aeracao", label: "Aeração", icon: "💨" },
    { id: "monitoramento", label: "Monitoramento 24/7", icon: "📡" },
    { id: "balanca", label: "Balança", icon: "⚖️" },
    { id: "laboratorio", label: "Laboratório", icon: "🔬" },
  ];

  const toggleInfraestrutura = (id: string) => {
    setFiltros((prev) => ({
      ...prev,
      infraestrutura: prev.infraestrutura.includes(id)
        ? prev.infraestrutura.filter((i) => i !== id)
        : [...prev.infraestrutura, id],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-black">SiloShare</span>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Buscar Armazenagem</h1>
          <p className="text-xl text-gray-600">Encontre o silo ideal para sua safra</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel de Filtros */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="lg:hidden"
                >
                  {mostrarFiltros ? "Ocultar" : "Mostrar"}
                </Button>
              </div>

              {mostrarFiltros && (
                <div className="space-y-6">
                  {/* Localização */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Localização</Label>
                    <Input
                      placeholder="Cidade"
                      value={filtros.cidade}
                      onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Estado"
                      value={filtros.estado}
                      onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    />
                  </div>

                  {/* Capacidade */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Capacidade Mínima: {filtros.capacidadeMin} toneladas
                    </Label>
                    <Slider
                      value={[filtros.capacidadeMin]}
                      onValueChange={([value]) => setFiltros({ ...filtros, capacidadeMin: value })}
                      max={10000}
                      step={100}
                      className="mb-2"
                    />
                  </div>

                  {/* Preço Máximo */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Preço Máximo: R$ {filtros.precoMax}/t/mês
                    </Label>
                    <Slider
                      value={[filtros.precoMax]}
                      onValueChange={([value]) => setFiltros({ ...filtros, precoMax: value })}
                      max={200}
                      step={5}
                      className="mb-2"
                    />
                  </div>

                  {/* Infraestrutura */}
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Infraestrutura</Label>
                    <div className="space-y-2">
                      {infraestruturaOpcoes.map((opcao) => (
                        <div key={opcao.id} className="flex items-center gap-2">
                          <Checkbox
                            id={opcao.id}
                            checked={filtros.infraestrutura.includes(opcao.id)}
                            onCheckedChange={() => toggleInfraestrutura(opcao.id)}
                          />
                          <label htmlFor={opcao.id} className="text-sm cursor-pointer flex items-center gap-2">
                            <span>{opcao.icon}</span>
                            {opcao.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Ordenar por</Label>
                    <div className="space-y-2">
                      {[
                        { value: "preco", label: "Menor Preço" },
                        { value: "distancia", label: "Proximidade" },
                        { value: "avaliacao", label: "Melhor Avaliação" },
                      ].map((opcao) => (
                        <div key={opcao.value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={opcao.value}
                            name="ordenacao"
                            checked={filtros.ordenarPor === opcao.value}
                            onChange={() =>
                              setFiltros({ ...filtros, ordenarPor: opcao.value as typeof filtros.ordenarPor })
                            }
                            className="cursor-pointer"
                          />
                          <label htmlFor={opcao.value} className="text-sm cursor-pointer">
                            {opcao.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-black hover:bg-gray-800">
                    <Search className="w-4 h-4 mr-2" />
                    Aplicar Filtros
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Lista de Resultados */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {isLoading ? "Carregando..." : `${silos?.length || 0} silos encontrados`}
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Buscando silos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {silos?.map((silo) => (
                  <Card key={silo.id} className="p-6 hover:shadow-lg transition cursor-pointer">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Imagem Placeholder */}
                      <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Warehouse className="w-16 h-16 text-gray-400" />
                      </div>

                      {/* Informações */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-2xl font-bold mb-1">{silo.nome}</h3>
                            <div className="flex items-center gap-1 text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {silo.cidade}, {silo.estado}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-green-600">R$ {silo.precoTonMes}</p>
                            <p className="text-sm text-gray-600">/tonelada/mês</p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{silo.descricao}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-600">Capacidade Total</p>
                            <p className="font-semibold">{silo.capacidadeTotal} t</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Disponível</p>
                            <p className="font-semibold text-green-600">{silo.capacidadeDisponivel} t</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Avaliação</p>
                            <p className="font-semibold flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              4.8
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Distância</p>
                            <p className="font-semibold">45 km</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {silo.secagem && <Badge variant="outline">🔥 Secagem</Badge>}
                          {silo.limpeza && <Badge variant="outline">✨ Limpeza</Badge>}
                          {silo.aeracao && <Badge variant="outline">💨 Aeração</Badge>}
                          {silo.monitoramento && <Badge variant="outline">📡 Monitoramento</Badge>}
                        </div>

                        <div className="flex gap-3">
                          <Button className="bg-black hover:bg-gray-800">Ver Detalhes</Button>
                          <Button variant="outline">Solicitar Cotação</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

