import { create } from 'zustand';

type SearchUiState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const useSearchUi = create<SearchUiState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
