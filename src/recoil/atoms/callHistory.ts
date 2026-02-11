import { create } from 'zustand';

type CallHistoryStore = {
  callHistory: any[];
  setCallHistory: (data: any[]) => void;
};

export const useCallHistory = create<CallHistoryStore>((set) => ({
  callHistory: [],
  setCallHistory: (data) => set({ callHistory: data }),
}));