import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { Reel } from '../components/Reel';
import { GameState } from '../types/game';
import { useGameStore } from '../store/gameStore';

export class SkipSystem extends System {
  private _sessionQuery: Query;
  private _reelQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
  }

  update(_dt: number) {
    const store = useGameStore.getState();
    if (!store.skipRequested) return;
    useGameStore.setState({ skipRequested: false });

    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);

    if (session.state === GameState.Spinning) {
      for (const re of this._reelQuery.entities) {
        const reel = this.world.getComponent(re, Reel);
        if (reel.state === 'spinning' || reel.state === 'stopping' || reel.state === 'bouncing') {
          reel.currentStrip = [reel.targetSymbols[0] || reel.currentStrip[0], ...reel.targetSymbols];
          reel.scrollY = 0;
          reel.spinSpeed = 0;
          reel.bounceTimer = 0;
          reel.targetQueue = [];
          reel.state = 'stopped';
        }
      }
      session.state = GameState.Evaluating;
    } else if (session.state === GameState.WinDisplay) {
      session.state = GameState.Idle;
    }
  }
}
