import { SymbolType } from './symbols';

export enum GameState {
  Init = 'init',
  NameEntry = 'name_entry',
  Idle = 'idle',
  Spinning = 'spinning',
  Evaluating = 'evaluating',
  PayingOut = 'paying_out',
  WinDisplay = 'win_display',
}

export type ReelState = 'idle' | 'spinning' | 'stopping' | 'bouncing' | 'stopped';

export interface WinLine {
  lineIndex: number;
  symbolType: SymbolType;
  count: number;
  payout: number;
  positions: [number, number][];
}

export enum AnimationType {
  Spin = 'spin',
  Stop = 'stop',
  Bounce = 'bounce',
  Win = 'win',
}
