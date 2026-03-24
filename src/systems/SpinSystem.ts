import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { Reel } from '../components/Reel';
import { TurboMode } from '../components/TurboMode';
import { SpinCommand } from '../components/InputCommands';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/game';

export class SpinSystem extends System {
  private _sessionQuery: Query;
  private _reelQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    const cmd = this.world.getComponent(s.entity, SpinCommand);
    if (!cmd.active) return;
    cmd.active = false;

    if (s.session.state !== GameState.Idle) return;
    if (s.session.balance < s.session.bet) return;

    s.session.balance -= s.session.bet;
    s.session.state = GameState.Spinning;

    if (this.world.hasComponent(s.entity, SpinResult)) {
      const result = this.world.getComponent(s.entity, SpinResult);
      result.grid = [];
      result.winLines = [];
      result.totalWin = 0;
      result.processed = false;
    }

    this.world.addTag(s.entity, 'SPIN_REQUESTED');

    const turbo = this.world.getComponent(s.entity, TurboMode);
    const turboMultiplier = turbo.active ? GAME_CONFIG.TURBO_MULTIPLIER : 1;

    for (const re of this._reelQuery.entities) {
      const reel = this.world.getComponent(re, Reel);
      reel.state = 'spinning';
      reel.spinSpeed = GAME_CONFIG.SPIN_SPEED * turboMultiplier;
      reel.scrollY = 0;
      reel.bounceTimer = 0;
      reel.stopTimer =
        GAME_CONFIG.REEL_STOP_BASE_DELAY + reel.reelIndex * GAME_CONFIG.REEL_STOP_INCREMENT;
      reel.stopTimer /= turboMultiplier;
    }
  }
}
