import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { Reel } from '../components/Reel';
import { SkipCommand } from '../components/InputCommands';
import { GameState } from '../types/game';

export class SkipSystem extends System {
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

    const cmd = this.world.getComponent(s.entity, SkipCommand);
    if (!cmd.active) return;
    cmd.active = false;

    if (s.session.state === GameState.Spinning) {
      for (const re of this._reelQuery.entities) {
        const reel = this.world.getComponent(re, Reel);
        if (reel.state === 'spinning' || reel.state === 'stopping' || reel.state === 'bouncing') {
          reel.currentStrip = [
            reel.targetSymbols[0] || reel.currentStrip[0],
            ...reel.targetSymbols,
          ];
          reel.scrollY = 0;
          reel.spinSpeed = 0;
          reel.bounceTimer = 0;
          reel.targetQueue = [];
          reel.state = 'stopped';
        }
      }
      s.session.state = GameState.Evaluating;
    } else if (s.session.state === GameState.WinDisplay) {
      s.session.state = GameState.Idle;
    }
  }
}
