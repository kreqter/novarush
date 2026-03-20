import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { AutoPlay } from '../components/AutoPlay';
import { TurboMode } from '../components/TurboMode';
import { useGameStore } from '../store/gameStore';

export class UIBridgeSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);

    const current = useGameStore.getState();
    const update: Record<string, any> = {};
    let changed = false;

    if (current.balance !== session.balance) { update.balance = session.balance; changed = true; }
    if (current.playerName !== session.playerName) { update.playerName = session.playerName; changed = true; }
    if (current.gameState !== session.state) { update.gameState = session.state; changed = true; }

    if (this.world.hasComponent(sessionEntity, SpinResult)) {
      const result = this.world.getComponent(sessionEntity, SpinResult);
      if (current.lastWin !== result.totalWin) { update.lastWin = result.totalWin; changed = true; }
      if (current.winLines !== result.winLines) { update.winLines = result.winLines; changed = true; }
      if (current.grid !== result.grid) { update.grid = result.grid; changed = true; }
    }

    if (this.world.hasComponent(sessionEntity, AutoPlay)) {
      const autoPlay = this.world.getComponent(sessionEntity, AutoPlay);
      if (current.autoPlayRemaining !== autoPlay.remaining) { update.autoPlayRemaining = autoPlay.remaining; changed = true; }
    }

    if (this.world.hasComponent(sessionEntity, TurboMode)) {
      const turbo = this.world.getComponent(sessionEntity, TurboMode);
      if (current.turboActive !== turbo.active) { update.turboActive = turbo.active; changed = true; }
    }

    if (changed) {
      useGameStore.setState(update);
    }
  }
}
