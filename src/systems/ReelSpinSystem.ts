import { System, World, Query } from '../ecs';
import { Reel } from '../components/Reel';
import { GameSession } from '../components/GameSession';
import { GameState } from '../types/game';
import { GAME_CONFIG, CELL_HEIGHT } from '../config/game';
import { getRandomSymbol } from '../config/symbols';
import { useGameStore } from '../store/gameStore';

export class ReelSpinSystem extends System {
  private _sessionQuery: Query;
  private _reelQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
  }

  update(dt: number) {
    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);
    if (session.state !== GameState.Spinning) return;

    const turboActive = useGameStore.getState().turboActive;
    const speedMul = turboActive ? GAME_CONFIG.TURBO_MULTIPLIER : 1;

    let allStopped = true;

    for (const re of this._reelQuery.entities) {
      const reel = this.world.getComponent(re, Reel);

      if (reel.state === 'spinning') {
        allStopped = false;
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

        if (reel.stopTimer > 0) {
          reel.stopTimer -= dt;
          if (reel.stopTimer <= 0) {
            const queue = [];
            for (let i = 0; i < 3; i++) queue.push(getRandomSymbol());
            // Targets in reverse order so they enter from top correctly
            for (let i = GAME_CONFIG.ROWS_COUNT - 1; i >= 0; i--) {
              queue.push(reel.targetSymbols[i]);
            }
            queue.push(getRandomSymbol());
            reel.targetQueue = queue;
          }
        }
      } else if (reel.state === 'bouncing') {
        allStopped = false;
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
          this.world.addTag(re, 'REEL_JUST_STOPPED');
        }
      }

      if (reel.state !== 'stopped') {
        allStopped = false;
      }
    }

    if (allStopped && this._reelQuery.entities.size === GAME_CONFIG.REELS_COUNT) {
      session.state = GameState.Evaluating;
    }
  }
}
