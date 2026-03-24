import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { SetPlayerNameCommand } from '../components/InputCommands';
import { GameState } from '../types/game';

export class PlayerInitSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    const cmd = this.world.getComponent(s.entity, SetPlayerNameCommand);
    if (!cmd.name) return;

    s.session.playerName = cmd.name;
    s.session.state = GameState.Idle;
    cmd.name = null;
  }
}
