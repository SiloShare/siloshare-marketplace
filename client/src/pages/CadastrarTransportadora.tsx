import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Truck, MapPin, DollarSign, Camera } from "lucide-react";

export default function CadastrarTransportadora() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const [etapa, setEtapa] = useState(1);
  const totalEtapas = 6;

  const [dados, setDados] = useState({
    tipoFrota: "",
    localizacao: "",
    quantidadeCaminhoes: 0,
    servicos: [] as string[],
    preco: "",
    descricao: "",
  });

  const handleChange = (campo: string, valor: any) => {
    setDados({ ...dados, [campo]: valor });
  };

  const handleProxima = () => {
    if (etapa < totalEtapas) {
      setEtapa(etapa + 1);
    }
  };

  const handleVoltar = () => {
    if (etapa > 1) {
      setEtapa(etapa - 1);
    }
  };

  const handleSubmit = () => {
    toast.success("Transportadora cadastrada com sucesso!");
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <span className="text-3xl">🌾</span>
              <span className="text-2xl font-bold text-black">SiloShare</span>
            </div>
            <Button onClick={() => setLocation("/")} variant="outline">
              Voltar
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-8">Você precisa estar logado para cadastrar uma transportadora.</p>
          <Button onClick={() => setLocation("/")} className="bg-black hover:bg-gray-800">
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-black">SiloShare</span>
          </div>
          <Button onClick={() => setLocation("/")} variant="ghost" className="text-base">
            Salvar e sair
          </Button>
        </div>
      </header>

      {/* Progress Bar Minimalista */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-black h-1 rounded-full transition-all duration-300"
              style={{ width: `${(etapa / totalEtapas) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        {/* Etapa 1: Tipo de Frota */}
        {etapa === 1 && (
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl font-semibold mb-3">Que tipo de frota você possui?</h1>
              <p className="text-xl text-gray-600">Escolha a opção principal</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { tipo: "Truck", icon: "🚛", desc: "Até 23 toneladas" },
                { tipo: "Carreta", icon: "🚚", desc: "Até 40 toneladas" },
                { tipo: "Bitrem", icon: "🚜", desc: "Até 50 toneladas" },
                { tipo: "Rodotrem", icon: "🚐", desc: "Até 74 toneladas" },
              ].map((item) => (
                <Card
                  key={item.tipo}
                  className={`p-6 cursor-pointer hover:border-black transition ${
                    dados.tipoFrota === item.tipo ? "border-2 border-black bg-gray-50" : "border"
                  }`}
                  onClick={() => handleChange("tipoFrota", item.tipo)}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-1">{item.tipo}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 2: Localização */}
        {etapa === 2 && (
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl font-semibold mb-3">Onde fica sua sede?</h1>
              <p className="text-xl text-gray-600">Localização da empresa</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="localizacao" className="text-base font-medium mb-2 block">
                  Endereço completo
                </Label>
                <Input
                  id="localizacao"
                  placeholder="Cidade, Estado, CEP"
                  className="text-lg py-6"
                  value={dados.localizacao}
                  onChange={(e) => handleChange("localizacao", e.target.value)}
                />
              </div>

              {/* Mapa placeholder */}
              <Card className="h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>Mapa será exibido aqui</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Etapa 3: Quantidade de Caminhões */}
        {etapa === 3 && (
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl font-semibold mb-3">Compartilhe algumas informações básicas</h1>
              <p className="text-xl text-gray-600">Tamanho da frota</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between py-6 border-b">
                <div>
                  <h3 className="text-xl font-medium">Caminhões</h3>
                  <p className="text-gray-600">Quantidade total</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => handleChange("quantidadeCaminhoes", Math.max(0, dados.quantidadeCaminhoes - 1))}
                  >
                    −
                  </Button>
                  <span className="text-2xl font-medium w-20 text-center">{dados.quantidadeCaminhoes}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => handleChange("quantidadeCaminhoes", dados.quantidadeCaminhoes + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 4: Serviços */}
        {etapa === 4 && (
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl font-semibold mb-3">Informe os serviços que você oferece</h1>
              <p className="text-xl text-gray-600">Você pode adicionar mais depois</p>
            </div>

            <div className="space-y-3">
              {[
                { id: "rastreamento", label: "Rastreamento em tempo real", icon: "📍" },
                { id: "seguro", label: "Seguro de carga", icon: "🛡️" },
                { id: "urgente", label: "Entrega urgente", icon: "⚡" },
                { id: "carga-descarga", label: "Carga e descarga", icon: "📦" },
                { id: "armazenagem", label: "Armazenagem temporária", icon: "🏭" },
                { id: "logistica", label: "Logística completa", icon: "🚀" },
              ].map((item) => (
                <Card
                  key={item.id}
                  className={`p-6 cursor-pointer hover:border-black transition flex items-center justify-between ${
                    dados.servicos.includes(item.id) ? "border-2 border-black bg-gray-50" : "border"
                  }`}
                  onClick={() => {
                    const novosServicos = dados.servicos.includes(item.id)
                      ? dados.servicos.filter((s) => s !== item.id)
                      : [...dados.servicos, item.id];
                    handleChange("servicos", novosServicos);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-lg font-medium">{item.label}</span>
                  </div>
                  {dados.servicos.includes(item.id) && <span className="text-2xl">✓</span>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Etapa 5: Fotos */}
        {etapa === 5 && (
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl font-semibold mb-3">Adicione algumas fotos da sua frota</h1>
              <p className="text-xl text-gray-600">Você precisará de cinco fotos para começar. Você pode adicionar outras ou fazer alterações mais tarde.</p>
            </div>

            <Card className="border-2 border-dashed border-gray-300 p-16 text-center cursor-pointer hover:border-black transition">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">Adicione fotos</h3>
              <p className="text-gray-600">Arraste ou clique para fazer upload</p>
            </Card>
          </div>
        )}

        {/* Etapa 6: Preço e Descrição */}
        {etapa === 6 && (
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl font-semibold mb-3">Agora, defina seu preço</h1>
              <p className="text-xl text-gray-600">Você pode alterá-lo a qualquer momento</p>
            </div>

            <div className="space-y-8">
              <div>
                <Label htmlFor="preco" className="text-base font-medium mb-2 block">
                  Preço por quilômetro
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-600">R$</span>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="text-2xl py-8 pl-14"
                    value={dados.preco}
                    onChange={(e) => handleChange("preco", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao" className="text-base font-medium mb-2 block">
                  Descrição da empresa
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a experiência, diferenciais, certificações..."
                  rows={6}
                  className="text-lg"
                  value={dados.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navegação Fixa no Rodapé */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-4">
          <div className="container mx-auto px-6 flex items-center justify-between max-w-3xl">
            {etapa > 1 ? (
              <Button onClick={handleVoltar} variant="ghost" className="text-base font-semibold underline">
                Voltar
              </Button>
            ) : (
              <div></div>
            )}
            {etapa < totalEtapas ? (
              <Button onClick={handleProxima} className="bg-black hover:bg-gray-800 px-8 py-6 text-base">
                Avançar
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-black hover:bg-gray-800 px-8 py-6 text-base">
                Publicar
              </Button>
            )}
          </div>
        </div>

        {/* Espaço para o rodapé fixo */}
        <div className="h-24"></div>
      </div>
    </div>
  );
}

