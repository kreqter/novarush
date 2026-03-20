import type { ReelState } from '../types/game';
import { SymbolType } from '../types/symbols';

export class Reel {
  reelIndex: number = 0;
  state: ReelState = 'idle';
  spinSpeed: number = 0;
  scrollY: number = 0;
  stopTimer: number = 0;
  bounceTimer: number = 0;
  targetSymbols: SymbolType[] = [];
  currentStrip: SymbolType[] = [
    SymbolType.Cherry, SymbolType.Cherry,
    SymbolType.Cherry, SymbolType.Cherry,
  ];
  targetQueue: SymbolType[] = [];
}
