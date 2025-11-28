import { useState } from "react";
import { Link, useRoute } from "wouter";
import { Header } from "@/components/Header";
import {
  Heart,
  Star,
  MapPin,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Calendar,
  Package,
  Shield,
  FileCheck,
  TrendingUp,
  Navigation,
  Flame,
  Wind,
  Radio,
  Scale,
  AlertCircle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { SiloAvaliacoes } from "@/components/SiloAvaliacoes";

// Mock data for fallback - can be removed later
const FALLBACK_MOCK = {
  id: 0,
  nome: "Silo não encontrado",
  cidade: "N/A",
  estado: "N/A",
  endereco: "N/A",
  distancia: 0,
  capacidadeTotal: 0,
  capacidadeDisponivel: 0,
  preco: 0,
  avaliacao: 0,
  numAvaliacoes: 0,
  fotos: ["https://via.placeholder.com/800x600.png?text=Foto+Indisponível"],
  descricao: "A descrição para este silo não está disponível.",
  infraestrutura: {},
  graosAceitos: [],
  certificacoes: {},
  proprietario: { nome: "N/A", foto: "", anoEntrada: 0, verificado: false, tempoResposta: "N/A", taxaResposta: "N/A" },
  avaliacoes: [],
};


export default function DetalhesSilo() {
  const [, params] = useRoute("/silo/:id");
  const siloId = params?.id ? parseInt(params.id) : 0;
  
  const { data: siloData, isLoading, error } = trpc.silos.getById.useQuery(
    { id: siloId },
    { 
      enabled: !!siloId,
      // Use mock data as placeholder while loading or on error to prevent crashes
      placeholderData: FALLBACK_MOCK,
     }
  );

  const silo = siloData || FALLBACK_MOCK;

  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const [fotoAtual, setFotoAtual] = useState(0);
  const [mostrarGaleria, setMostrarGaleria] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const [quantidade, setQuantidade] = useState(1000);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const calcularMeses = () => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    return Math.ceil(
      (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
  };

  const calcularTotal = () => {
    const meses = calcularMeses();
    return quantidade * (silo.preco || 0) * meses;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando detalhes do silo...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Erro ao carregar o silo: {error.message}</div>;
  }

  // Helper to parse JSON fields safely
  const parseJson = (jsonString, defaultValue) => {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return defaultValue;
    }
  };

  const fotos = Array.isArray(silo.fotos) ? silo.fotos : parseJson(silo.fotos, FALLBACK_MOCK.fotos);
  const infraestrutura = typeof silo.infraestrutura === 'object' ? silo.infraestrutura : parseJson(silo.infraestrutura, FALLBACK_MOCK.infraestrutura);
  const graosAceitos = Array.isArray(silo.graosAceitos) ? silo.graosAceitos : parseJson(silo.graosAceitos, FALLBACK_MOCK.graosAceitos);
  // Assuming these are not in the DB yet, so we keep the mock structure for now
  const certificacoes = FALLBACK_MOCK.certificacoes;
  const proprietario = FALLBACK_MOCK.proprietario;
  const avaliacoes = FALLBACK_MOCK.avaliacoes;
  const numAvaliacoes = FALLBACK_MOCK.numAvaliacoes;
  const avaliacao = FALLBACK_MOCK.avaliacao;
  const distancia = FALLBACK_MOCK.distancia;


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Galeria de Fotos */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[500px]">
          {/* Foto Principal */}
          <div
            className="col-span-2 row-span-2 cursor-pointer relative group"
            onClick={() => setMostrarGaleria(true)}
          >
            <img
              src={fotos[0]}
              alt="Foto principal"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          </div>

          {/* Fotos Secundárias */}
          {fotos.slice(1, 5).map((foto, index) => (
            <div
              key={index}
              className="cursor-pointer relative group"
              onClick={() => setMostrarGaleria(true)}
            >
              <img
                src={foto}
                alt={`Foto ${index + 2}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              {index === 3 && (
                <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Ver todas as fotos
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Coluna Esquerda - Informações */}
          <div className="lg:col-span-2">
            {/* Título e Informações Principais */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-black mb-3">
                {silo.nome}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{avaliacao}</span>
                  <span className="text-gray-600">
                    ({numAvaliacoes} avaliações)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin size={16} />
                  <span className="font-medium">
                    {silo.cidade}, {silo.estado}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Navigation size={16} />
                  <span className="font-medium">{distancia} km de distância</span>
                </div>
              </div>

              {/* Badges de Certificação */}
              <div className="flex flex-wrap gap-2">
                {certificacoes.conab && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                    <Shield size={14} />
                    Certificado CONAB
                  </span>
                )}
                {certificacoes.licencaAmbiental && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    <FileCheck size={14} />
                    Licença Ambiental
                  </span>
                )}
                {proprietario.verificado && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                    <Check size={14} />
                    Proprietário Verificado
                  </span>
                )}
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Capacidade Disponível - DESTAQUE */}
            <div className="mb-8 bg-white border-2 border-black rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package size={24} className="text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black mb-2">
                    Capacidade Disponível Agora
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mb-2">
                    {silo.capacidadeDisponivel.toLocaleString()} toneladas
                  </p>
                  <p className="text-sm text-gray-700">
                    de {silo.capacidadeTotal.toLocaleString()} toneladas totais
                    (<span className="text-green-600 font-bold">{Math.round((silo.capacidadeDisponivel / silo.capacidadeTotal) * 100)}%</span> disponível)
                  </p>
                </div>
              </div>
            </div>

            {/* Infraestrutura Crítica */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Infraestrutura</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border-2 ${infraestrutura.secagem ? 'bg-white border-black' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Flame size={20} className={infraestrutura.secagem ? 'text-black' : 'text-gray-400'} />
                    <span className="font-bold">Secagem</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {infraestrutura.secagem ? 'Sistema completo de secagem' : 'Não disponível'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${infraestrutura.aeracao ? 'bg-white border-black' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Wind size={20} className={infraestrutura.aeracao ? 'text-black' : 'text-gray-400'} />
                    <span className="font-bold">Aeração</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {infraestrutura.aeracao ? 'Aeração controlada 24/7' : 'Não disponível'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${infraestrutura.monitoramento ? 'bg-white border-black' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Radio size={20} className={infraestrutura.monitoramento ? 'text-black' : 'text-gray-400'} />
                    <span className="font-bold">Monitoramento</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {infraestrutura.monitoramento ? 'Monitoramento em tempo real' : 'Não disponível'}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border-2 ${infraestrutura.balanca ? 'bg-white border-black' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Scale size={20} className={infraestrutura.balanca ? 'text-black' : 'text-gray-400'} />
                    <span className="font-bold">Balança</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {infraestrutura.balanca ? 'Balança rodoviária' : 'Não disponível'}
                  </p>
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Grãos Aceitos */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Grãos aceitos</h2>
              <div className="flex flex-wrap gap-3">
                {graosAceitos.map((grao, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
                  >
                    {grao}
                  </span>
                ))}
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Descrição */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Sobre este silo</h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {silo.descricao}
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Proprietário */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Anunciado por</h2>
              <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                <img
                  src={proprietario.foto}
                  alt={proprietario.nome}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">
                    {proprietario.nome}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Anfitrião desde {proprietario.anoEntrada}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Taxa de resposta</p>
                      <p className="font-bold">{proprietario.taxaResposta}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tempo de resposta</p>
                      <p className="font-bold">{proprietario.tempoResposta}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Avaliações */}
            <div className="mb-8">
              <SiloAvaliacoes siloId={silo.id} />
            </div>

            <hr className="my-8 border-gray-200" />

            {/* Localização */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Localização exata
              </h2>
              <p className="text-gray-700 mb-2 font-medium">
                {silo.endereco}
              </p>
              <p className="text-gray-600 mb-4">
                {silo.cidade} - {silo.estado}
              </p>
              <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
                <p className="text-gray-500">
                  [Mapa interativo com rota será integrado aqui]
                </p>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                <Navigation size={14} className="inline mr-1" />
                Aproximadamente {distancia} km da sua propriedade
              </p>
            </div>
          </div>

          {/* Coluna Direita - Card de Reserva FIXO */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border-2 border-gray-900 rounded-2xl p-6 shadow-xl">
              {/* Preço em Destaque */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">
                    R$ {(silo.preco || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-600 font-medium">por tonelada / mês</p>
                <div className="flex items-center gap-1 text-sm mt-2">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{avaliacao}</span>
                  <span className="text-gray-500">
                    ({numAvaliacoes} avaliações)
                  </span>
                </div>
              </div>

              {/* Formulário de Reserva */}
              <div className="border-2 border-gray-300 rounded-lg mb-4">
                {/* Período */}
                <div className="grid grid-cols-2 border-b-2 border-gray-300">
                  <div className="p-3 border-r-2 border-gray-300">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      INÍCIO
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="w-full text-sm border-none focus:outline-none font-medium"
                    />
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      FIM
                    </label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="w-full text-sm border-none focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Quantidade */}
                <div className="p-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    QUANTIDADE (TONELADAS)
                  </label>
                  <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 0)}
                    min="100"
                    max={silo.capacidadeDisponivel}
                    step="100"
                    className="w-full text-sm border-none focus:outline-none font-bold text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {silo.capacidadeDisponivel.toLocaleString()} ton
                  </p>
                </div>
              </div>

              {/* Botão Contratar */}
              <button 
                onClick={() => {
                  if (!user) {
                    // Salvar URL atual para redirecionar após login
                    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                    setLocation('/login');
                  } else {
                    // Redirecionar para checkout
                    setLocation(`/checkout/${params?.id}`);
                  }
                }}
                className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors mb-3"
              >
                Solicitar Contratação
              </button>

              <p className="text-center text-xs text-gray-600 mb-4">
                Você ainda não será cobrado
              </p>

              {/* Cálculo de Preço Detalhado */}
              {dataInicio && dataFim && quantidade > 0 && (
                <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span>
                      R$ {(silo.preco || 0).toFixed(2)} x {quantidade} ton
                    </span>
                    <span className="font-medium">
                      R$ {(silo.preco * quantidade).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>x {calcularMeses()} meses</span>
                    <span className="font-medium">
                      R$ {calcularTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t-2 border-gray-300">
                    <span>Total Estimado</span>
                    <span>R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Galeria Modal */}
      {mostrarGaleria && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setMostrarGaleria(false)}
            className="absolute top-6 right-6 text-white"
          >
            <X size={32} />
          </button>
          <div className="relative w-full max-w-4xl h-full max-h-[80vh]">
            <img
              src={fotos[fotoAtual]}
              alt={`Foto ${fotoAtual + 1}`}
              className="w-full h-full object-contain"
            />
            <button
              onClick={() =>
                setFotoAtual((prev) => (prev === 0 ? fotos.length - 1 : prev - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() =>
                setFotoAtual((prev) => (prev === fotos.length - 1 ? 0 : prev + 1))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
