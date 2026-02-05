import { create } from 'zustand';
import { chatData } from './types';

export const useChatState = create<{ chatState: chatData }>(() => ({
  chatState: {
    data: [],
    loading: true,
    unreadMesage: false,
  },
}));
