import { create } from 'zustand';
import { chatData } from './types';

type ChatStore = {
  chatState: chatData;
  setChatState: (
    value: chatData | ((prev: chatData) => chatData)
  ) => void;
};

export const useChatState = create<ChatStore>((set) => ({
  chatState: {
    data: [],
    loading: true,
    unreadMesage: false,
  },

  setChatState: (value) =>
    set((state) => {
      const partial =
        typeof value === 'function'
          ? value(state.chatState)
          : value;

      const newState = {
        ...state.chatState,
        ...partial,
      };

      // console.log("ZUSTAND UPDATED:", newState);

      return { chatState: newState };
    }),
}));

