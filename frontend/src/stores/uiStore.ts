import { create } from 'zustand';

export type TabId = 'guild-hall' | 'adventurers' | 'quest-board' | 'hiring-hall' | 'treasury';

interface UIState {
  isModalOpen: boolean;
  toggleModal: () => void;
  setModalOpen: (isOpen: boolean) => void;

  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isModalOpen: false,
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
  setModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),

  activeTab: 'guild-hall',
  setActiveTab: (tab: TabId) => set({ activeTab: tab }),
}));
