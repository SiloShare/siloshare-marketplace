import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoUsuario = 'produtor' | 'dono_silo' | 'transportadora';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  tipo: TipoUsuario;
  verificado: boolean;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  dataCadastro: Date;
  
  // Dados específicos por tipo
  dadosProdutor?: {
    propriedades: Array<{
      nome: string;
      cidade: string;
      estado: string;
      area: number; // em hectares
      lat: number;
      lng: number;
    }>;
    graosProducao: string[];
  };
  
  dadosSilo?: {
    silosIds: string[]; // IDs dos silos cadastrados
  };
  
  dadosTransportadora?: {
    frota: Array<{
      tipo: string;
      placa: string;
      capacidade: number;
    }>;
    areasAtuacao: string[]; // estados
  };
}

interface AuthStore {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  register: (dados: Partial<Usuario>, senha: string) => Promise<boolean>;
  updateUsuario: (dados: Partial<Usuario>) => void;
  setUsuario: (usuario: Usuario | null) => void;
}

// Usuário de exemplo para desenvolvimento
const usuarioExemplo: Usuario = {
  id: 'prod1',
  nome: 'João Silva',
  email: 'joao.silva@email.com',
  telefone: '(65) 99999-9999',
  cpfCnpj: '123.456.789-00',
  tipo: 'produtor',
  verificado: true,
  avaliacaoMedia: 4.8,
  totalAvaliacoes: 12,
  dataCadastro: new Date('2025-01-15'),
  dadosProdutor: {
    propriedades: [
      {
        nome: 'Fazenda Boa Esperança',
        cidade: 'Sorriso',
        estado: 'MT',
        area: 2500,
        lat: -12.5414,
        lng: -55.7156,
      },
    ],
    graosProducao: ['Soja', 'Milho'],
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, senha: string) => {
        set({ isLoading: true });
        
        // Simula chamada API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Em desenvolvimento, aceita qualquer login
        if (email && senha) {
          set({ 
            usuario: usuarioExemplo, 
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({ 
          usuario: null, 
          isAuthenticated: false,
        });
      },

      register: async (dados: Partial<Usuario>, senha: string) => {
        set({ isLoading: true });
        
        // Simula chamada API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const novoUsuario: Usuario = {
          id: Math.random().toString(36).substr(2, 9),
          nome: dados.nome || '',
          email: dados.email || '',
          telefone: dados.telefone || '',
          cpfCnpj: dados.cpfCnpj || '',
          tipo: dados.tipo || 'produtor',
          verificado: false,
          avaliacaoMedia: 0,
          totalAvaliacoes: 0,
          dataCadastro: new Date(),
          ...dados,
        };
        
        set({ 
          usuario: novoUsuario, 
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      },

      updateUsuario: (dados: Partial<Usuario>) => {
        set((state) => ({
          usuario: state.usuario ? { ...state.usuario, ...dados } : null,
        }));
      },

      setUsuario: (usuario: Usuario | null) => {
        set({ 
          usuario, 
          isAuthenticated: !!usuario,
        });
      },
    }),
    {
      name: 'siloshare-auth',
      partialize: (state) => ({
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

