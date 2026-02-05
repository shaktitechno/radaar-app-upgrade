import { create } from 'zustand';

export const useAuthToken = create<{
  authToken: string;
  setAuthToken: (token: string) => void;
}>(set => ({
  authToken: '',
  setAuthToken: token => set({ authToken: token }),
}));