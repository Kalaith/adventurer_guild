import { create } from 'zustand';

interface UIState {
  isModalOpen: boolean;
  toggleModal: () => void;
  setModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));