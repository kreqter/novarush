import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { GameState, type WinLine } from '../types/game';
import { SymbolType } from '../types/symbols';
import { PAYLINES } from '../config/paylines';
import { PAYTABLE } from '../config/paytable';
import { SYMBOL_CONFIGS } from '../config/symbols';
import { GAME_CONFIG } from '../config/game';

export class EvaluationSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);

    if (session.state !== GameState.Evaluating) return;

    if (!this.world.hasComponent(sessionEntity, SpinResult)) return;
    const result = this.world.getComponent(sessionEntity, SpinResult);
    if (result.grid.length === 0) return;

    const winLines: WinLine[] = [];
    let totalWin = 0;

    for (let lineIdx = 0; lineIdx < PAYLINES.length; lineIdx++) {
      const payline = PAYLINES[lineIdx];
      const firstSymbol = result.grid[0]?.[payline[0]];
      if (!firstSymbol) continue;

      let matchCount = 1;
      const positions: [number, number][] = [[0, payline[0]]];

      for (let reel = 1; reel < GAME_CONFIG.REELS_COUNT; reel++) {
        const sym = result.grid[reel]?.[payline[reel]];
        if (sym === firstSymbol) {
          matchCount++;
          positions.push([reel, payline[reel]]);
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const baseMul = PAYTABLE[matchCount] || 0;
        const symMul = SYMBOL_CONFIGS[firstSymbol as SymbolType]?.multiplier || 1;
        const payout = session.bet * baseMul * symMul;

        winLines.push({
          lineIndex: lineIdx,
          symbolType: firstSymbol as SymbolType,
          count: matchCount,
          payout,
          positions,
        });

        totalWin += payout;
      }
    }

    result.winLines = winLines;
    result.totalWin = totalWin;

    session.state = GameState.PayingOut;
  }
}
