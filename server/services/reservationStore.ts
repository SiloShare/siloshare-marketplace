import { create } from 'zustand';

export type StatusReserva = 'pendente' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface CotacaoTransporte {
  id: string;
  transportadoraId: string;
  transportadoraNome: string;
  valorFrete: number;
  prazoEntrega: number; // em dias
  tipoVeiculo: string;
  avaliacaoMedia: number;
  status: 'pendente' | 'aceita' | 'recusada';
}

export interface Reserva {
  id: string;
  siloId: string;
  siloNome: string;
  produtorId: string;
  produtorNome: string;
  tipoGrao: string;
  quantidade: number; // em toneladas
  dataInicio: Date;
  dataFim: Date;
  valorTotal: number;
  status: StatusReserva;
  necessitaTransporte: boolean;
  cotacoesTransporte?: CotacaoTransporte[];
  cotacaoSelecionada?: string; // ID da cotação selecionada
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReservationStore {
  reservas: Reserva[];
  reservaAtual: Reserva | null;
  
  // Actions
  setReservas: (reservas: Reserva[]) => void;
  addReserva: (reserva: Reserva) => void;
  updateReserva: (id: string, reserva: Partial<Reserva>) => void;
  deleteReserva: (id: string) => void;
  setReservaAtual: (reserva: Reserva | null) => void;
  
  // Ações específicas de reserva
  confirmarReserva: (id: string) => void;
  cancelarReserva: (id: string) => void;
  concluirReserva: (id: string) => void;
  
  // Ações de transporte
  solicitarCotacoesTransporte: (reservaId: string) => void;
  addCotacaoTransporte: (reservaId: string, cotacao: CotacaoTransporte) => void;
  selecionarCotacaoTransporte: (reservaId: string, cotacaoId: string) => void;
  
  // Filtros e buscas
  getReservasPorProdutor: (produtorId: string) => Reserva[];
  getReservasPorSilo: (siloId: string) => Reserva[];
  getReservasPorStatus: (status: StatusReserva) => Reserva[];
}

// Dados de exemplo
const reservasExemplo: Reserva[] = [
  {
    id: '1',
    siloId: '1',
    siloNome: 'Silo Central Sorriso',
    produtorId: 'prod1',
    produtorNome: 'João Silva',
    tipoGrao: 'Soja',
    quantidade: 500,
    dataInicio: new Date('2025-11-01'),
    dataFim: new Date('2026-02-28'),
    valorTotal: 12500,
    status: 'confirmada',
    necessitaTransporte: true,
    cotacoesTransporte: [
      {
        id: 'cot1',
        transportadoraId: 'trans1',
        transportadoraNome: 'Transportes MT Ltda',
        valorFrete: 3500,
        prazoEntrega: 2,
        tipoVeiculo: 'Carreta Graneleira',
        avaliacaoMedia: 4.7,
        status: 'aceita',
      },
      {
        id: 'cot2',
        transportadoraId: 'trans2',
        transportadoraNome: 'Frete Rápido Grãos',
        valorFrete: 3200,
        prazoEntrega: 3,
        tipoVeiculo: 'Bitrem',
        avaliacaoMedia: 4.5,
        status: 'pendente',
      },
    ],
    cotacaoSelecionada: 'cot1',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-16'),
  },
  {
    id: '2',
    siloId: '2',
    siloNome: 'Armazém Lucas do Rio Verde',
    produtorId: 'prod2',
    produtorNome: 'Maria Santos',
    tipoGrao: 'Milho',
    quantidade: 1000,
    dataInicio: new Date('2025-12-01'),
    dataFim: new Date('2026-04-30'),
    valorTotal: 22000,
    status: 'pendente',
    necessitaTransporte: false,
    createdAt: new Date('2025-10-14'),
    updatedAt: new Date('2025-10-14'),
  },
];

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservas: reservasExemplo,
  reservaAtual: null,

  setReservas: (reservas) => set({ reservas }),

  addReserva: (reserva) => set((state) => ({
    reservas: [...state.reservas, reserva],
  })),

  updateReserva: (id, reservaUpdate) => set((state) => ({
    reservas: state.reservas.map((r) => 
      r.id === id ? { ...r, ...reservaUpdate, updatedAt: new Date() } : r
    ),
  })),

  deleteReserva: (id) => set((state) => ({
    reservas: state.reservas.filter((r) => r.id !== id),
  })),

  setReservaAtual: (reserva) => set({ reservaAtual: reserva }),

  confirmarReserva: (id) => set((state) => ({
    reservas: state.reservas.map((r) => 
      r.id === id ? { ...r, status: 'confirmada', updatedAt: new Date() } : r
    ),
  })),

  cancelarReserva: (id) => set((state) => ({
    reservas: state.reservas.map((r) => 
      r.id === id ? { ...r, status: 'cancelada', updatedAt: new Date() } : r
    ),
  })),

  concluirReserva: (id) => set((state) => ({
    reservas: state.reservas.map((r) => 
      r.id === id ? { ...r, status: 'concluida', updatedAt: new Date() } : r
    ),
  })),

  solicitarCotacoesTransporte: (reservaId) => {
    // Simula envio de solicitação para transportadoras
    console.log(`Solicitando cotações de transporte para reserva ${reservaId}`);
    // Em produção, aqui seria feita uma chamada API
  },

  addCotacaoTransporte: (reservaId, cotacao) => set((state) => ({
    reservas: state.reservas.map((r) => 
      r.id === reservaId 
        ? { 
            ...r, 
            cotacoesTransporte: [...(r.cotacoesTransporte || []), cotacao],
            updatedAt: new Date(),
          } 
        : r
    ),
  })),

  selecionarCotacaoTransporte: (reservaId, cotacaoId) => set((state) => ({
    reservas: state.reservas.map((r) => 
      r.id === reservaId 
        ? { 
            ...r, 
            cotacaoSelecionada: cotacaoId,
            cotacoesTransporte: r.cotacoesTransporte?.map((c) => 
              c.id === cotacaoId ? { ...c, status: 'aceita' } : c
            ),
            updatedAt: new Date(),
          } 
        : r
    ),
  })),

  getReservasPorProdutor: (produtorId) => {
    return get().reservas.filter((r) => r.produtorId === produtorId);
  },

  getReservasPorSilo: (siloId) => {
    return get().reservas.filter((r) => r.siloId === siloId);
  },

  getReservasPorStatus: (status) => {
    return get().reservas.filter((r) => r.status === status);
  },
}));

