import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { AutoPlay } from '../components/AutoPlay';
import { GameState } from '../types/game';
import { useGameStore } from '../store/gameStore';

export class AutoPlaySystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const store = useGameStore.getState();
    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);

    if (!this.world.hasComponent(sessionEntity, AutoPlay)) return;
    const autoPlay = this.world.getComponent(sessionEntity, AutoPlay);

    if (store.autoPlayStart !== null) {
      autoPlay.active = true;
      autoPlay.remaining = store.autoPlayStart;
      useGameStore.setState({ autoPlayStart: null });
    }

    if (store.autoPlayStop) {
      autoPlay.active = false;
      autoPlay.remaining = 0;
      useGameStore.setState({ autoPlayStop: false });
    }

    if (autoPlay.active && session.state === GameState.Idle) {
      if (autoPlay.remaining <= 0 || session.balance < session.bet) {
        autoPlay.active = false;
        autoPlay.remaining = 0;
        return;
      }

      autoPlay.remaining--;
      useGameStore.setState({ spinRequested: true });
    }
  }
}
