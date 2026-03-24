import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { Reel } from '../components/Reel';
import { SlotSymbol } from '../components/SlotSymbol';
import { TallSymbol } from '../components/TallSymbol';
import { SymbolType } from '../types/symbols';
import { GAME_CONFIG } from '../config/game';
import { getRandomSymbol } from '../config/symbols';

interface GeneratedGrid {
  grid: SymbolType[][];
  tallStarts: Map<number, number>;
}

export class SymbolGeneratorSystem extends System {
  private _sessionQuery: Query;
  private _reelQuery: Query;
  private _symbolQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
    this._symbolQuery = world.createQuery([SlotSymbol]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    if (!this.world.hasTag(s.entity, 'SPIN_REQUESTED')) return;
    this.world.removeTag(s.entity, 'SPIN_REQUESTED');

    const { grid, tallStarts } = this._generateGrid();
    this._applyReelTargets(grid, tallStarts);
    this._updateSpinResult(s.entity, grid);
    this._updateSymbolEntities(grid, tallStarts);
  }

  private _generateGrid(): GeneratedGrid {
    const grid: SymbolType[][] = [];
    const tallStarts: Map<number, number> = new Map();

    for (let r = 0; r < GAME_CONFIG.REELS_COUNT; r++) {
      const reelSymbols: SymbolType[] = [];
      let row = 0;
      while (row < GAME_CONFIG.ROWS_COUNT) {
        const sym = getRandomSymbol();
        if (
          sym === SymbolType.Bar &&
          row < GAME_CONFIG.ROWS_COUNT - 1 &&
          Math.random() < GAME_CONFIG.TALL_BAR_CHANCE
        ) {
          reelSymbols.push(SymbolType.Bar, SymbolType.Bar);
          tallStarts.set(r, row);
          row += 2;
        } else {
          reelSymbols.push(sym);
          row++;
        }
      }
      grid.push(reelSymbols.slice(0, GAME_CONFIG.ROWS_COUNT));
    }

    return { grid, tallStarts };
  }

  private _applyReelTargets(grid: SymbolType[][], tallStarts: Map<number, number>) {
    for (const re of this._reelQuery.entities) {
      const reel = this.world.getComponent(re, Reel);
      const reelGrid = grid[reel.reelIndex] || [];
      const tallStart = tallStarts.get(reel.reelIndex);

      const targets: SymbolType[] = [];
      for (let row = 0; row < reelGrid.length; row++) {
        if (tallStart !== undefined && row === tallStart) {
          targets.push(SymbolType.BarTallTop);
        } else if (tallStart !== undefined && row === tallStart + 1) {
          targets.push(SymbolType.BarTallBottom);
        } else {
          targets.push(reelGrid[row]);
        }
      }
      reel.targetSymbols = targets;
    }
  }

  private _updateSpinResult(sessionEntity: number, grid: SymbolType[][]) {
    if (!this.world.hasComponent(sessionEntity, SpinResult)) {
      this.world.addComponent(sessionEntity, new SpinResult());
    }
    const result = this.world.getComponent(sessionEntity, SpinResult);
    result.grid = grid;
    result.winLines = [];
    result.totalWin = 0;
    result.processed = false;
  }

  private _updateSymbolEntities(grid: SymbolType[][], tallStarts: Map<number, number>) {
    for (const se of this._symbolQuery.entities) {
      const sym = this.world.getComponent(se, SlotSymbol);
      if (grid[sym.col] && grid[sym.col][sym.row] !== undefined) {
        sym.type = grid[sym.col][sym.row];
      }

      const tallStart = tallStarts.get(sym.col);
      const isTall =
        tallStart !== undefined && (sym.row === tallStart || sym.row === tallStart + 1);

      if (isTall) {
        if (!this.world.hasComponent(se, TallSymbol)) {
          const tall = new TallSymbol();
          tall.occupiedRows = [tallStart, tallStart + 1];
          this.world.addComponent(se, tall);
        }
      } else if (this.world.hasComponent(se, TallSymbol)) {
        this.world.removeComponent(se, TallSymbol);
      }
    }
  }
}
