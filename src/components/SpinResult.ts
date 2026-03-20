import type { WinLine } from '../types/game';
import type { SymbolType } from '../types/symbols';

export class SpinResult {
  grid: SymbolType[][] = [];
  winLines: WinLine[] = [];
  totalWin: number = 0;
  processed: boolean = false;
}
