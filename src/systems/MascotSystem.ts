import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { GameSession } from '../components/GameSession';
import { GameState } from '../types/game';
import { getSpine } from '../pixi/AssetLoader';
import { GAME_CONFIG } from '../config/game';
import { Application } from 'pixi.js';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';

export class MascotSystem extends System {
  private _app: Application;
  private _spine: Spine | null = null;
  private _initialized = false;
  private _prevState: GameState = GameState.Init;
  private _sessionQuery: Query;

  constructor(world: World, app: Application) {
    super(world);
    this._app = app;
    this._sessionQuery = world.createQuery([GameSession]);
  }

  update(_dt: number) {
    if (!this._initialized) {
      this._init();
      if (!this._initialized) return;
    }

    const s = getSession(this.world, this._sessionQuery);
    if (!s || !this._spine) return;

    if (s.session.state === this._prevState) return;
    this._prevState = s.session.state;

    if (s.session.state === GameState.WinDisplay) {
      this._spine.state.setAnimation(0, 'jump', false);
      this._spine.state.addAnimation(0, 'run', true, 0);
    }
  }

  private _init() {
    const spine = getSpine();
    if (!spine) return;

    this._spine = spine;

    const availableWidth = GAME_CONFIG.FRAME_X;
    spine.x = availableWidth / 2;
    spine.y = GAME_CONFIG.GAME_HEIGHT - GAME_CONFIG.MASCOT_Y_OFFSET;

    const targetHeight = GAME_CONFIG.FRAME_H * GAME_CONFIG.MASCOT_HEIGHT_RATIO;
    const skeletonHeight = spine.skeleton.data.height || GAME_CONFIG.MASCOT_FALLBACK_HEIGHT;
    const fitScale = targetHeight / skeletonHeight;

    spine.scale.set(fitScale);
    spine.state.timeScale = GAME_CONFIG.MASCOT_TIME_SCALE;
    spine.state.setAnimation(0, 'run', true);

    this._app.stage.addChild(spine);
    this._initialized = true;
  }
}
