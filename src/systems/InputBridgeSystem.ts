import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import {
  SpinCommand,
  SkipCommand,
  AutoPlayCommand,
  TurboToggleCommand,
  SetPlayerNameCommand,
} from '../components/InputCommands';
import { useGameStore } from '../store/gameStore';

export class InputBridgeSystem extends System {
  private _sessionQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    const store = useGameStore.getState();

    if (store.spinRequested) {
      useGameStore.setState({ spinRequested: false });
      this.world.getComponent(s.entity, SpinCommand).active = true;
    }

    if (store.skipRequested) {
      useGameStore.setState({ skipRequested: false });
      this.world.getComponent(s.entity, SkipCommand).active = true;
    }

    if (store.autoPlayStart !== null) {
      const cmd = this.world.getComponent(s.entity, AutoPlayCommand);
      cmd.startCount = store.autoPlayStart;
      useGameStore.setState({ autoPlayStart: null });
    }

    if (store.autoPlayStop) {
      const cmd = this.world.getComponent(s.entity, AutoPlayCommand);
      cmd.stopRequested = true;
      useGameStore.setState({ autoPlayStop: false });
    }

    if (store.turboToggle) {
      useGameStore.setState({ turboToggle: false });
      this.world.getComponent(s.entity, TurboToggleCommand).active = true;
    }

    if (store.playerNameSet) {
      this.world.getComponent(s.entity, SetPlayerNameCommand).name = store.playerNameSet;
      useGameStore.setState({ playerNameSet: null });
    }
  }
}
