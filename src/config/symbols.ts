import { SymbolType } from '../types/symbols';

export interface SymbolConfig {
  type: SymbolType;
  weight: number;
  multiplier: number;
  frameName: string;
}

export const SYMBOL_CONFIGS: Partial<Record<SymbolType, SymbolConfig>> & Record<string, SymbolConfig> = {
  [SymbolType.Cherry]: { type: SymbolType.Cherry, weight: 25, multiplier: 1, frameName: 'cherry.png' },
  [SymbolType.Lemon]: { type: SymbolType.Lemon, weight: 25, multiplier: 1, frameName: 'lemon.png' },
  [SymbolType.Orange]: { type: SymbolType.Orange, weight: 20, multiplier: 1, frameName: 'orange.png' },
  [SymbolType.Plum]: { type: SymbolType.Plum, weight: 15, multiplier: 2, frameName: 'plum.png' },
  [SymbolType.Watermelon]: { type: SymbolType.Watermelon, weight: 10, multiplier: 2, frameName: 'watermelon.png' },
  [SymbolType.Seven]: { type: SymbolType.Seven, weight: 4, multiplier: 5, frameName: 'seven.png' },
  [SymbolType.Bar]: { type: SymbolType.Bar, weight: 1, multiplier: 10, frameName: 'bar.png' },
};

export const TOTAL_WEIGHT = Object.values(SYMBOL_CONFIGS).reduce((sum, s) => sum + s.weight, 0);

export function getRandomSymbol(): SymbolType {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const config of Object.values(SYMBOL_CONFIGS)) {
    roll -= config.weight;
    if (roll <= 0) return config.type;
  }
  return SymbolType.Cherry;
}
