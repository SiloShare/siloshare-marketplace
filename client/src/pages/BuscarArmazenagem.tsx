import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star, MapPin, Filter } from "lucide-react";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";

// Mock data - será substituído por dados reais do backend
const SILOS_MOCK = [
  {
    id: 1,
    nome: "Silo Premium Agronegócio",
    cidade: "Primavera do Leste",
    estado: "MT",
    capacidade: 6500,
    preco: 28.5,
    avaliacao: 4.5,
    numAvaliacoes: 65,
    foto: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600",
    certificadoCONAB: true,
  },
  {
    id: 2,
    nome: "Cooperativa Agrícola Central",
    cidade: "Cascavel",
    estado: "PR",
    capacidade: 12000,
    preco: 25.0,
    avaliacao: 4.9,
    numAvaliacoes: 54,
    foto: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600",
    certificadoCONAB: false,
  },
  {
    id: 3,
    nome: "Silo Boa Vista",
    cidade: "Dourados",
    estado: "MS",
    capacidade: 3500,
    preco: 30.0,
    avaliacao: 4.8,
    numAvaliacoes: 53,
    foto: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600",
    certificadoCONAB: false,
  },
  {
    id: 4,
    nome: "Armazém Grãos do Norte",
    cidade: "Sorriso",
    estado: "MT",
    capacidade: 8000,
    preco: 27.0,
    avaliacao: 4.7,
    numAvaliacoes: 48,
    foto: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600",
    certificadoCONAB: true,
  },
  {
    id: 5,
    nome: "Silo Fazenda São José",
    cidade: "Rio Verde",
    estado: "GO",
    capacidade: 5000,
    preco: 26.5,
    avaliacao: 4.6,
    numAvaliacoes: 42,
    foto: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600",
    certificadoCONAB: false,
  },
  {
    id: 6,
    nome: "Cooperativa Agrícola Sul",
    cidade: "Passo Fundo",
    estado: "RS",
    capacidade: 10000,
    preco: 24.0,
    avaliacao: 4.9,
    numAvaliacoes: 71,
    foto: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600",
    certificadoCONAB: true,
  },
];

export default function BuscarArmazenagem() {
  // Buscar silos reais do banco de dados
  const { data: silosReais, isLoading } = trpc.silos.list.useQuery();
  
  // Usar dados reais se disponíveis, senão usar mock
  const silos = silosReais && silosReais.length > 0 ? silosReais.map(silo => ({
    id: silo.id,
    nome: silo.nome,
    cidade: silo.cidade,
    estado: silo.estado,
    capacidade: silo.capacidadeDisponivel || 0,
    preco: parseFloat(silo.precoTonMes || "0"),
    avaliacao: 4.5, // Mock - implementar sistema de avaliação depois
    numAvaliacoes: 0, // Mock
    foto: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600",
    certificadoCONAB: false, // Mock
  })) : SILOS_MOCK;
  
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [filtros, setFiltros] = useState({
    localizacao: "",
    capacidadeMin: 1000,
    precoMax: 50,
    infraestrutura: {
      secagem: false,
      limpeza: false,
      aeracao: false,
      monitoramento: false,
      balanca: false,
      laboratorio: false,
    },
    ordenacao: "proximidade",
  });

  const toggleFavorito = (siloId: number) => {
    setFavoritos((prev) =>
      prev.includes(siloId)
        ? prev.filter((id) => id !== siloId)
        : [...prev, siloId]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="border-b border-gray-200 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-black mb-3">
            Encontre o Silo Certo para Sua Safra
          </h1>
          <p className="text-lg text-gray-600">
            Segurança e economia para seus grãos, a um clique de distância.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar de Filtros */}
          <aside className="w-80 flex-shrink-0">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 bg-white">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} strokeWidth={1.5} />
                <h2 className="text-xl font-bold">Refinar Busca</h2>
              </div>

              {/* Localização */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localização
                </label>
                <input
                  type="text"
                  placeholder="Cidade ou Região"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  value={filtros.localizacao}
                  onChange={(e) =>
                    setFiltros({ ...filtros, localizacao: e.target.value })
                  }
                />
              </div>

              {/* Capacidade Desejada */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidade Desejada: {filtros.capacidadeMin.toLocaleString()} ton
                </label>
                <input
                  type="range"
                  min="500"
                  max="20000"
                  step="500"
                  value={filtros.capacidadeMin}
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,
                      capacidadeMin: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Preço Máximo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Máximo: R$ {filtros.precoMax}/ton/mês
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={filtros.precoMax}
                  onChange={(e) =>
                    setFiltros({ ...filtros, precoMax: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Infraestrutura Essencial */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Infraestrutura Essencial
                </label>
                <div className="space-y-2">
                  {[
                    { key: "secagem", label: "Secagem Completa" },
                    { key: "limpeza", label: "Limpeza de Grãos" },
                    { key: "aeracao", label: "Aeração Controlada" },
                    { key: "monitoramento", label: "Monitoramento 24/7" },
                    { key: "balanca", label: "Balança Rodoviária" },
                    { key: "laboratorio", label: "Laboratório de Análise" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filtros.infraestrutura[item.key as keyof typeof filtros.infraestrutura]}
                        onChange={(e) =>
                          setFiltros({
                            ...filtros,
                            infraestrutura: {
                              ...filtros.infraestrutura,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ordenar por */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ordenar por
                </label>
                <div className="space-y-2">
                  {[
                    { value: "proximidade", label: "Proximidade" },
                    { value: "preco", label: "Menor Preço" },
                    { value: "avaliacao", label: "Melhor Avaliação" },
                  ].map((item) => (
                    <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ordenacao"
                        value={item.value}
                        checked={filtros.ordenacao === item.value}
                        onChange={(e) =>
                          setFiltros({ ...filtros, ordenacao: e.target.value })
                        }
                        className="w-4 h-4 border-gray-300 text-black focus:ring-black"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botão Buscar */}
              <button className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Buscar Silos
              </button>
            </div>
          </aside>

          {/* Grid de Silos */}
          <main className="flex-1">
            <p className="text-sm text-gray-600 mb-6">
              {isLoading ? "Carregando..." : `${silos.length} silos encontrados para você`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {silos.map((silo) => (
                <Link key={silo.id} href={`/silo/${silo.id}`}>
                  <a className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                      {/* Foto */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={silo.foto}
                          alt={silo.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Botão Favoritar */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorito(silo.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Heart
                            size={18}
                            className={
                              favoritos.includes(silo.id)
                                ? "fill-red-500 text-red-500"
                                : "text-gray-700"
                            }
                          />
                        </button>
                        {/* Badge CONAB */}
                        {silo.certificadoCONAB && (
                          <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-green-700 flex items-center gap-1">
                            <span className="text-green-500">✓</span>
                            Certificado CONAB
                          </div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="p-4">
                        {/* Nome e Localização */}
                        <h3 className="font-bold text-lg text-black mb-1 line-clamp-1">
                          {silo.nome}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 mb-2">
                          <MapPin size={14} strokeWidth={1.5} />
                          <span className="text-sm">
                            {silo.cidade}, {silo.estado}
                          </span>
                        </div>

                        {/* Avaliação */}
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{silo.avaliacao}</span>
                          <span className="text-sm text-gray-500">
                            ({silo.numAvaliacoes} avaliações)
                          </span>
                        </div>

                        {/* Capacidade */}
                        <p className="text-sm text-gray-600 mb-3">
                          Capacidade: {silo.capacidade.toLocaleString()} ton
                        </p>

                        {/* Preço */}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-green-600">
                            R$ {silo.preco.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">/ ton / mês</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

