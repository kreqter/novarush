import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { AutoPlay } from '../components/AutoPlay';
import { TurboMode } from '../components/TurboMode';
import { useGameStore, type GameStore } from '../store/gameStore';

export class UIBridgeSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    const current = useGameStore.getState();
    const update: Partial<GameStore> = {};
    let changed = false;

    if (current.balance !== s.session.balance) {
      update.balance = s.session.balance;
      changed = true;
    }
    if (current.playerName !== s.session.playerName) {
      update.playerName = s.session.playerName;
      changed = true;
    }
    if (current.gameState !== s.session.state) {
      update.gameState = s.session.state;
      changed = true;
    }

    if (this.world.hasComponent(s.entity, SpinResult)) {
      const result = this.world.getComponent(s.entity, SpinResult);
      if (current.lastWin !== result.totalWin) {
        update.lastWin = result.totalWin;
        changed = true;
      }
      if (current.winLines !== result.winLines) {
        update.winLines = result.winLines;
        changed = true;
      }
      if (current.grid !== result.grid) {
        update.grid = result.grid;
        changed = true;
      }
    }

    if (this.world.hasComponent(s.entity, AutoPlay)) {
      const autoPlay = this.world.getComponent(s.entity, AutoPlay);
      if (current.autoPlayRemaining !== autoPlay.remaining) {
        update.autoPlayRemaining = autoPlay.remaining;
        changed = true;
      }
    }

    if (this.world.hasComponent(s.entity, TurboMode)) {
      const turbo = this.world.getComponent(s.entity, TurboMode);
      if (current.turboActive !== turbo.active) {
        update.turboActive = turbo.active;
        changed = true;
      }
    }

    if (changed) {
      useGameStore.setState(update);
    }
  }
}
