import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { TurboMode } from '../components/TurboMode';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/game';

export class PayoutSystem extends System {
  private _winDisplayTimer: number = 0;
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    if (s.session.state === GameState.PayingOut) {
      if (!this.world.hasComponent(s.entity, SpinResult)) {
        s.session.state = GameState.Idle;
        return;
      }
      const result = this.world.getComponent(s.entity, SpinResult);
      if (!result.processed) {
        s.session.balance += result.totalWin;
        result.processed = true;

        if (result.totalWin > 0) {
          s.session.state = GameState.WinDisplay;
          const turbo = this.world.getComponent(s.entity, TurboMode);
          this._winDisplayTimer =
            GAME_CONFIG.WIN_DISPLAY_DURATION / (turbo.active ? GAME_CONFIG.TURBO_MULTIPLIER : 1);
        } else {
          s.session.state = GameState.Idle;
        }
      }
    }

    if (s.session.state === GameState.WinDisplay) {
      this._winDisplayTimer -= dt;
      if (this._winDisplayTimer <= 0) {
        s.session.state = GameState.Idle;
      }
    }
  }
}
