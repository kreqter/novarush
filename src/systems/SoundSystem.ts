import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { Reel } from '../components/Reel';
import { SpinResult } from '../components/SpinResult';
import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/game';
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
    const s = getSession(this.world, this._sessionQuery);
    if (!s) return;

    if (!this._bgMusicStarted && s.session.state === GameState.Idle) {
      this._bgMusicStarted = true;
      SoundManager.startBgMusic();
    }

    if (s.session.state === GameState.Spinning && this._prevGameState !== GameState.Spinning) {
      SoundManager.play('spin', GAME_CONFIG.SOUND_VOLUME_SPIN);
    }

    for (const re of this._reelStoppedQuery.entities) {
      SoundManager.play('reel', GAME_CONFIG.SOUND_VOLUME_REEL);
      this.world.removeTag(re, 'REEL_JUST_STOPPED');
    }

    if (s.session.state === GameState.WinDisplay && this._prevGameState !== GameState.WinDisplay) {
      if (this.world.hasComponent(s.entity, SpinResult)) {
        const result = this.world.getComponent(s.entity, SpinResult);
        if (result.totalWin > 0) {
          SoundManager.play('win', GAME_CONFIG.SOUND_VOLUME_WIN);
        }
      }
    }

    this._prevGameState = s.session.state;
  }
}
