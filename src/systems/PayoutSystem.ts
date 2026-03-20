import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/game';
import { useGameStore } from '../store/gameStore';

export class PayoutSystem extends System {
  private _winDisplayTimer: number = 0;
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(dt: number) {
    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);

    if (session.state === GameState.PayingOut) {
      if (!this.world.hasComponent(sessionEntity, SpinResult)) {
        session.state = GameState.Idle;
        return;
      }
      const result = this.world.getComponent(sessionEntity, SpinResult);
      if (!result.processed) {
        session.balance += result.totalWin;
        result.processed = true;

        if (result.totalWin > 0) {
          session.state = GameState.WinDisplay;
          const turbo = useGameStore.getState().turboActive;
          this._winDisplayTimer = GAME_CONFIG.WIN_DISPLAY_DURATION / (turbo ? GAME_CONFIG.TURBO_MULTIPLIER : 1);
        } else {
          session.state = GameState.Idle;
        }
      }
    }

    if (session.state === GameState.WinDisplay) {
      this._winDisplayTimer -= dt;
      if (this._winDisplayTimer <= 0) {
        session.state = GameState.Idle;
      }
    }
  }
}
