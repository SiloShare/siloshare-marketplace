import { create } from 'zustand';

export interface Silo {
  id: string;
  nome: string;
  proprietario: string;
  localizacao: {
    cidade: string;
    estado: string;
    lat: number;
    lng: number;
  };
  capacidadeTotal: number; // em toneladas
  capacidadeDisponivel: number; // em toneladas
  precoTonelada: number; // R$ por tonelada/mês
  tiposGraos: string[]; // tipos de grãos aceitos
  infraestrutura: {
    secagem: boolean;
    limpeza: boolean;
    aeracao: boolean;
    monitoramento: boolean;
  };
  avaliacaoMedia: number; // 0-5
  totalAvaliacoes: number;
  imagemUrl?: string;
  descricao: string;
  disponivel: boolean;
}

interface SiloStore {
  silos: Silo[];
  silosFiltrados: Silo[];
  filtros: {
    cidade?: string;
    estado?: string;
    tipoGrao?: string;
    capacidadeMinima?: number;
    precoMaximo?: number;
    infraestrutura?: string[];
  };
  
  // Actions
  setSilos: (silos: Silo[]) => void;
  addSilo: (silo: Silo) => void;
  updateSilo: (id: string, silo: Partial<Silo>) => void;
  deleteSilo: (id: string) => void;
  setFiltros: (filtros: SiloStore['filtros']) => void;
  aplicarFiltros: () => void;
  buscarSilosPorLocalizacao: (lat: number, lng: number, raioKm: number) => void;
}

// Dados de exemplo
const silosExemplo: Silo[] = [
  {
    id: '1',
    nome: 'Silo Central Sorriso',
    proprietario: 'Agro Sorriso Ltda',
    localizacao: {
      cidade: 'Sorriso',
      estado: 'MT',
      lat: -12.5414,
      lng: -55.7156,
    },
    capacidadeTotal: 10000,
    capacidadeDisponivel: 4000,
    precoTonelada: 25,
    tiposGraos: ['Soja', 'Milho', 'Arroz'],
    infraestrutura: {
      secagem: true,
      limpeza: true,
      aeracao: true,
      monitoramento: true,
    },
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 45,
    descricao: 'Silo moderno com infraestrutura completa para armazenagem de grãos. Localização estratégica próxima às principais rodovias.',
    disponivel: true,
  },
  {
    id: '2',
    nome: 'Armazém Lucas do Rio Verde',
    proprietario: 'Cooperativa Agrícola LRV',
    localizacao: {
      cidade: 'Lucas do Rio Verde',
      estado: 'MT',
      lat: -13.0537,
      lng: -55.9125,
    },
    capacidadeTotal: 15000,
    capacidadeDisponivel: 8000,
    precoTonelada: 22,
    tiposGraos: ['Soja', 'Milho'],
    infraestrutura: {
      secagem: true,
      limpeza: true,
      aeracao: true,
      monitoramento: false,
    },
    avaliacaoMedia: 4.5,
    totalAvaliacoes: 32,
    descricao: 'Grande capacidade de armazenagem com preço competitivo. Ideal para produtores da região.',
    disponivel: true,
  },
  {
    id: '3',
    nome: 'Silo Sinop Grãos',
    proprietario: 'Sinop Agronegócios S.A.',
    localizacao: {
      cidade: 'Sinop',
      estado: 'MT',
      lat: -11.8609,
      lng: -55.5025,
    },
    capacidadeTotal: 8000,
    capacidadeDisponivel: 2000,
    precoTonelada: 28,
    tiposGraos: ['Soja', 'Milho', 'Feijão'],
    infraestrutura: {
      secagem: true,
      limpeza: true,
      aeracao: false,
      monitoramento: true,
    },
    avaliacaoMedia: 4.2,
    totalAvaliacoes: 18,
    descricao: 'Silo com boa localização e atendimento personalizado.',
    disponivel: true,
  },
];

export const useSiloStore = create<SiloStore>((set, get) => ({
  silos: silosExemplo,
  silosFiltrados: silosExemplo,
  filtros: {},

  setSilos: (silos) => set({ silos, silosFiltrados: silos }),

  addSilo: (silo) => set((state) => ({
    silos: [...state.silos, silo],
    silosFiltrados: [...state.silosFiltrados, silo],
  })),

  updateSilo: (id, siloUpdate) => set((state) => ({
    silos: state.silos.map((s) => (s.id === id ? { ...s, ...siloUpdate } : s)),
    silosFiltrados: state.silosFiltrados.map((s) => (s.id === id ? { ...s, ...siloUpdate } : s)),
  })),

  deleteSilo: (id) => set((state) => ({
    silos: state.silos.filter((s) => s.id !== id),
    silosFiltrados: state.silosFiltrados.filter((s) => s.id !== id),
  })),

  setFiltros: (filtros) => {
    set({ filtros });
    get().aplicarFiltros();
  },

  aplicarFiltros: () => {
    const { silos, filtros } = get();
    let resultado = [...silos];

    if (filtros.cidade) {
      resultado = resultado.filter((s) => 
        s.localizacao.cidade.toLowerCase().includes(filtros.cidade!.toLowerCase())
      );
    }

    if (filtros.estado) {
      resultado = resultado.filter((s) => s.localizacao.estado === filtros.estado);
    }

    if (filtros.tipoGrao) {
      resultado = resultado.filter((s) => s.tiposGraos.includes(filtros.tipoGrao!));
    }

    if (filtros.capacidadeMinima) {
      resultado = resultado.filter((s) => s.capacidadeDisponivel >= filtros.capacidadeMinima!);
    }

    if (filtros.precoMaximo) {
      resultado = resultado.filter((s) => s.precoTonelada <= filtros.precoMaximo!);
    }

    if (filtros.infraestrutura && filtros.infraestrutura.length > 0) {
      resultado = resultado.filter((s) => {
        return filtros.infraestrutura!.every((infra) => {
          return s.infraestrutura[infra as keyof typeof s.infraestrutura];
        });
      });
    }

    set({ silosFiltrados: resultado });
  },

  buscarSilosPorLocalizacao: (lat, lng, raioKm) => {
    const { silos } = get();
    
    // Função para calcular distância entre dois pontos (fórmula de Haversine)
    const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Raio da Terra em km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const silosPorProximidade = silos
      .map((silo) => ({
        ...silo,
        distancia: calcularDistancia(lat, lng, silo.localizacao.lat, silo.localizacao.lng),
      }))
      .filter((silo) => silo.distancia <= raioKm)
      .sort((a, b) => a.distancia - b.distancia);

    set({ silosFiltrados: silosPorProximidade });
  },
}));

