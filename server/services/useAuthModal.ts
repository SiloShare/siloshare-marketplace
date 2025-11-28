import { create } from 'zustand';

interface AuthModalStore {
  isOpen: boolean;
  redirectTo?: string;
  openAuthModal: (redirectTo?: string) => void;
  closeAuthModal: () => void;
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  redirectTo: undefined,
  openAuthModal: (redirectTo?: string) => set({ isOpen: true, redirectTo }),
  closeAuthModal: () => set({ isOpen: false, redirectTo: undefined }),
}));

