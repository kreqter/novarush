import { create } from 'zustand';
import { GAME_CONFIG } from '../config/game';
import { GameState, type WinLine } from '../types/game';
import type { SymbolType } from '../types/symbols';

export interface GameStore {
  balance: number;
  playerName: string;
  gameState: GameState;
  lastWin: number;
  autoPlayRemaining: number;
  turboActive: boolean;
  winLines: WinLine[];
  grid: SymbolType[][];

  spinRequested: boolean;
  skipRequested: boolean;
  autoPlayStart: number | null;
  autoPlayStop: boolean;
  turboToggle: boolean;
  playerNameSet: string | null;

  requestSpin: () => void;
  requestSkip: () => void;
  startAutoPlay: (count: number) => void;
  stopAutoPlay: () => void;
  toggleTurbo: () => void;
  setPlayerName: (name: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  balance: GAME_CONFIG.INITIAL_BALANCE,
  playerName: '',
  gameState: GameState.Init,
  lastWin: 0,
  autoPlayRemaining: 0,
  turboActive: false,
  winLines: [],
  grid: [],

  spinRequested: false,
  skipRequested: false,
  autoPlayStart: null,
  autoPlayStop: false,
  turboToggle: false,
  playerNameSet: null,

  requestSpin: () => set({ spinRequested: true }),
  requestSkip: () => set({ skipRequested: true }),
  startAutoPlay: (count) => set({ autoPlayStart: count }),
  stopAutoPlay: () => set({ autoPlayStop: true }),
  toggleTurbo: () => set({ turboToggle: true }),
  setPlayerName: (name) => set({ playerNameSet: name }),
}));
