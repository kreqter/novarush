import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { Reel } from '../components/Reel';
import { GameSession } from '../components/GameSession';
import { TurboMode } from '../components/TurboMode';
import { GameState } from '../types/game';
import { GAME_CONFIG, CELL_HEIGHT } from '../config/game';
import { getRandomSymbol } from '../config/symbols';

export class ReelSpinSystem extends System {
  private _sessionQuery: Query;
  private _reelQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
  }

  update(dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;
    if (s.session.state !== GameState.Spinning) return;

    const turbo = this.world.getComponent(s.entity, TurboMode);
    const speedMul = turbo.active ? GAME_CONFIG.TURBO_MULTIPLIER : 1;

    let allStopped = true;

    for (const re of this._reelQuery.entities) {
      const reel = this.world.getComponent(re, Reel);

      if (reel.state === 'spinning') {
        allStopped = false;
        this._advanceSpinning(reel, dt, speedMul);
      } else if (reel.state === 'bouncing') {
        allStopped = false;
        this._advanceBounce(reel, re, dt, speedMul);
      }

      if (reel.state !== 'stopped') {
        allStopped = false;
      }
    }

    if (allStopped && this._reelQuery.entities.size === GAME_CONFIG.REELS_COUNT) {
      s.session.state = GameState.Evaluating;
    }
  }

  private _advanceSpinning(reel: Reel, dt: number, speedMul: number) {
    reel.spinSpeed = GAME_CONFIG.SPIN_SPEED * speedMul;
    reel.scrollY += reel.spinSpeed * dt;

    while (reel.scrollY >= CELL_HEIGHT) {
      reel.scrollY -= CELL_HEIGHT;

      if (reel.targetQueue.length > 0) {
        reel.currentStrip.pop();
        reel.currentStrip.unshift(reel.targetQueue.shift()!);

        if (reel.targetQueue.length === 0) {
          reel.scrollY = 0;
          reel.spinSpeed = 0;
          reel.state = 'bouncing';
          reel.bounceTimer = 0;
          break;
        }
      } else {
        reel.currentStrip.pop();
        reel.currentStrip.unshift(getRandomSymbol());
      }
    }

    this._checkStopTimer(reel, dt);
  }

  private _checkStopTimer(reel: Reel, dt: number) {
    if (reel.stopTimer <= 0) return;

    reel.stopTimer -= dt;
    if (reel.stopTimer > 0) return;

    const queue = [];
    for (let i = 0; i < GAME_CONFIG.REEL_STOP_QUEUE_PADDING; i++) {
      queue.push(getRandomSymbol());
    }
    for (let i = GAME_CONFIG.ROWS_COUNT - 1; i >= 0; i--) {
      queue.push(reel.targetSymbols[i]);
    }
    queue.push(getRandomSymbol());
    reel.targetQueue = queue;
  }

  private _advanceBounce(reel: Reel, entity: number, dt: number, speedMul: number) {
    const duration = GAME_CONFIG.BOUNCE_DURATION / speedMul;
    reel.bounceTimer += dt;
    const progress = Math.min(reel.bounceTimer / duration, 1);

    if (progress < 0.5) {
      reel.scrollY = GAME_CONFIG.BOUNCE_DISTANCE * (progress * 2);
    } else if (progress < 1) {
      reel.scrollY = GAME_CONFIG.BOUNCE_DISTANCE * (1 - (progress - 0.5) * 2);
    } else {
      reel.scrollY = 0;
      reel.state = 'stopped';
      this.world.addTag(entity, 'REEL_JUST_STOPPED');
    }
  }
}
