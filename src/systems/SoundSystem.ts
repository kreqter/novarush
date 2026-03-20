import { System, World, Query } from '../ecs';
import { GameSession } from '../components/GameSession';
import { Reel } from '../components/Reel';
import { SpinResult } from '../components/SpinResult';
import { GameState } from '../types/game';
import { SoundManager } from '../pixi/SoundManager';

export class SoundSystem extends System {
  private _prevGameState: GameState = GameState.Init;
  private _bgMusicStarted: boolean = false;
  private _sessionQuery: Query;
  private _reelStoppedQuery: Query;

  constructor(world: World) {
    super(world);
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelStoppedQuery = world.createQuery([Reel, 'REEL_JUST_STOPPED']);
  }

  update(_dt: number) {
    if (this._sessionQuery.entities.size === 0) return;
    const sessionEntity = this._sessionQuery.entities.values().next().value!;
    const session = this.world.getComponent(sessionEntity, GameSession);

    if (!this._bgMusicStarted && session.state === GameState.Idle) {
      this._bgMusicStarted = true;
      SoundManager.startBgMusic();
    }

    if (session.state === GameState.Spinning && this._prevGameState !== GameState.Spinning) {
      SoundManager.play('spin', 0.5);
    }

    for (const re of this._reelStoppedQuery.entities) {
      SoundManager.play('reel', 0.6);
      this.world.removeTag(re, 'REEL_JUST_STOPPED');
    }

    if (session.state === GameState.WinDisplay && this._prevGameState !== GameState.WinDisplay) {
      if (this.world.hasComponent(sessionEntity, SpinResult)) {
        const result = this.world.getComponent(sessionEntity, SpinResult);
        if (result.totalWin > 0) {
          SoundManager.play('win', 0.7);
        }
      }
    }

    this._prevGameState = session.state;
  }
}
