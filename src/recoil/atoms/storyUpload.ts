import { create } from 'zustand';

type StoryUploadState = {
  storyUpload: boolean;
  setStoryUpload: (value: boolean) => void;
};

export const useStoryUploadStore = create<StoryUploadState>(set => ({
  storyUpload: false,
  setStoryUpload: (value: boolean) => set({ storyUpload: value }),
}));