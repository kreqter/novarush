import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { Reel } from '../components/Reel';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/game';
import { useGameStore } from '../store/gameStore';

export class SpinSystem extends System {
  private _gameSessionEntity: number = -1;
  private _sessionQuery: Query;
  private _reelQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
  }

  update(_dt: number) {
    const store = useGameStore.getState();

    if (store.playerNameSet) {
      const name = store.playerNameSet;
      useGameStore.setState({ playerNameSet: null });

      if (this._sessionQuery.entities.size > 0) {
        this._gameSessionEntity = this._sessionQuery.entities.values().next().value!;
        const session = this.world.getComponent(this._gameSessionEntity, GameSession);
        session.playerName = name;
        session.state = GameState.Idle;
      }
    }

    if (!store.spinRequested) return;
    useGameStore.setState({ spinRequested: false });

    if (this._gameSessionEntity < 0) {
      if (this._sessionQuery.entities.size === 0) return;
      this._gameSessionEntity = this._sessionQuery.entities.values().next().value!;
    }

    const session = this.world.getComponent(this._gameSessionEntity, GameSession);
    if (session.state !== GameState.Idle) return;
    if (session.balance < session.bet) return;

    session.balance -= session.bet;
    session.state = GameState.Spinning;

    if (this.world.hasComponent(this._gameSessionEntity, SpinResult)) {
      const result = this.world.getComponent(this._gameSessionEntity, SpinResult);
      result.grid = [];
      result.winLines = [];
      result.totalWin = 0;
      result.processed = false;
    }

    this.world.addTag(this._gameSessionEntity, 'SPIN_REQUESTED');

    for (const re of this._reelQuery.entities) {
      const reel = this.world.getComponent(re, Reel);
      const turboMultiplier = store.turboActive ? GAME_CONFIG.TURBO_MULTIPLIER : 1;
      reel.state = 'spinning';
      reel.spinSpeed = GAME_CONFIG.SPIN_SPEED * turboMultiplier;
      reel.scrollY = 0;
      reel.bounceTimer = 0;
      reel.stopTimer = GAME_CONFIG.REEL_STOP_BASE_DELAY + reel.reelIndex * GAME_CONFIG.REEL_STOP_INCREMENT;
      reel.stopTimer /= turboMultiplier;
    }
  }
}
