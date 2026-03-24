import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { AutoPlay } from '../components/AutoPlay';
import { SpinCommand, AutoPlayCommand } from '../components/InputCommands';
import { GameState } from '../types/game';

export class AutoPlaySystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    if (!this.world.hasComponent(s.entity, AutoPlay)) return;
    const autoPlay = this.world.getComponent(s.entity, AutoPlay);
    const cmd = this.world.getComponent(s.entity, AutoPlayCommand);

    if (cmd.startCount !== null) {
      autoPlay.active = true;
      autoPlay.remaining = cmd.startCount;
      cmd.startCount = null;
    }

    if (cmd.stopRequested) {
      autoPlay.active = false;
      autoPlay.remaining = 0;
      cmd.stopRequested = false;
    }

    if (autoPlay.active && s.session.state === GameState.Idle) {
      if (autoPlay.remaining <= 0 || s.session.balance < s.session.bet) {
        autoPlay.active = false;
        autoPlay.remaining = 0;
        return;
      }

      autoPlay.remaining--;
      this.world.getComponent(s.entity, SpinCommand).active = true;
    }
  }
}
