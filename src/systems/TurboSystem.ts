import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { TurboMode } from '../components/TurboMode';
import { GAME_CONFIG } from '../config/game';
import { useGameStore } from '../store/gameStore';

export class TurboSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const store = useGameStore.getState();

    if (!store.turboToggle) return;
    useGameStore.setState({ turboToggle: false });

    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;

    if (!this.world.hasComponent(sessionEntity, TurboMode)) return;
    const turbo = this.world.getComponent(sessionEntity, TurboMode);

    turbo.active = !turbo.active;
    turbo.speedMultiplier = turbo.active ? GAME_CONFIG.TURBO_MULTIPLIER : 1;
  }
}
