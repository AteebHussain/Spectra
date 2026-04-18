import { create } from 'zustand';
import type { AudioBands } from '../types/audio';

interface AudioState {
  isPlaying: boolean;
  currentTrackName: string | null;
  bands: AudioBands;
  setPlaying: (isPlaying: boolean) => void;
  setTrackName: (name: string) => void;
  setBands: (bands: AudioBands) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentTrackName: null,
  bands: { bass: 0, mid: 0, treble: 0 },
  setPlaying: (isPlaying) => set({ isPlaying }),
  setTrackName: (name) => set({ currentTrackName: name }),
  setBands: (bands) => set({ bands }),
}));
