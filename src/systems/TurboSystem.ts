import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { TurboMode } from '../components/TurboMode';
import { TurboToggleCommand } from '../components/InputCommands';
import { GAME_CONFIG } from '../config/game';

export class TurboSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    const cmd = this.world.getComponent(s.entity, TurboToggleCommand);
    if (!cmd.active) return;
    cmd.active = false;

    if (!this.world.hasComponent(s.entity, TurboMode)) return;
    const turbo = this.world.getComponent(s.entity, TurboMode);

    turbo.active = !turbo.active;
    turbo.speedMultiplier = turbo.active ? GAME_CONFIG.TURBO_MULTIPLIER : 1;
  }
}
