import { create } from 'zustand';

type ImageToggleStore = {
  showOfficialPhoto: boolean;
  toggleImage: () => void;
};

export const useImageToggleStore = create<ImageToggleStore>((set) => ({
  showOfficialPhoto: true,
  toggleImage: () => set((state) => ({ showOfficialPhoto: !state.showOfficialPhoto })),
}));