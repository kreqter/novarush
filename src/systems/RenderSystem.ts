import { System, World, Query } from '../ecs';
import { getSession } from '../ecs/session';
import { Reel } from '../components/Reel';
import { GameSession } from '../components/GameSession';
import { SpinResult } from '../components/SpinResult';
import { GameState } from '../types/game';
import { GAME_CONFIG, CELL_HEIGHT, REELS_LEFT, REELS_TOP } from '../config/game';
import { SYMBOL_CONFIGS } from '../config/symbols';
import { PAYLINE_COLORS } from '../config/paylines';
import { SymbolType } from '../types/symbols';
import { getSymbolTexture, getBgTexture, getLogoTexture } from '../pixi/AssetLoader';
import { Application, Container, Sprite, Graphics } from 'pixi.js';

interface ReelView {
  container: Container;
  sprites: Sprite[];
  cachedSymbols: (SymbolType | null)[];
  baseScales: [number, number][];
}

export class RenderSystem extends System {
  private _app: Application;
  private _initialized = false;
  private _reelViews: ReelView[] = [];
  private _winLinesGraphics!: Graphics;
  private _winTime: number = 0;
  private _lastWinLinesDrawn: number = -1;
  private _sessionQuery: Query;
  private _reelQuery: Query;

  constructor(world: World, app: Application) {
    super(world);
    this._app = app;
    this._sessionQuery = world.createQuery([GameSession]);
    this._reelQuery = world.createQuery([Reel]);
  }

  update(dt: number) {
    if (!this._initialized) this._init();

    const { winMask, showingWin } = this._computeWinMask();

    if (showingWin) {
      this._winTime += dt;
    } else {
      this._winTime = 0;
    }

    const pulseScale = showingWin
      ? 1 + GAME_CONFIG.WIN_PULSE_AMPLITUDE * Math.sin(this._winTime * GAME_CONFIG.WIN_PULSE_SPEED)
      : 1;

    this._updateReelSprites(winMask, showingWin, pulseScale);
    this._drawWinLines(showingWin, winMask);
  }

  private _init() {
    const stage = this._app.stage;
    this._initBackground(stage);
    this._initLogo(stage);
    this._initReels(stage);

    this._winLinesGraphics = new Graphics();
    stage.addChild(this._winLinesGraphics);

    this._initialized = true;
  }

  private _initBackground(stage: Container) {
    const bgTex = getBgTexture();
    if (bgTex) {
      const bg = new Sprite(bgTex);
      bg.width = GAME_CONFIG.GAME_WIDTH;
      bg.height = GAME_CONFIG.GAME_HEIGHT;
      stage.addChild(bg);
    } else {
      const bg = new Graphics();
      bg.rect(0, 0, GAME_CONFIG.GAME_WIDTH, GAME_CONFIG.GAME_HEIGHT);
      bg.fill(GAME_CONFIG.FALLBACK_BG_COLOR);
      stage.addChild(bg);
    }
  }

  private _initLogo(stage: Container) {
    const logoTex = getLogoTexture();
    if (!logoTex) return;

    const logo = new Sprite(logoTex);
    logo.anchor.set(0.5, 0);
    logo.x = GAME_CONFIG.GAME_WIDTH / 2;
    logo.y = GAME_CONFIG.LOGO_Y;
    logo.scale.set(GAME_CONFIG.LOGO_SCALE);
    logo.blendMode = 'add';
    stage.addChild(logo);
  }

  private _initReels(stage: Container) {
    const fp = GAME_CONFIG.FRAME_PADDING;

    const reelsContainer = new Container();
    reelsContainer.x = REELS_LEFT;
    reelsContainer.y = REELS_TOP;
    stage.addChild(reelsContainer);

    const mask = new Graphics();
    mask.rect(-fp, -fp, GAME_CONFIG.FRAME_W, GAME_CONFIG.FRAME_H);
    mask.fill(0xffffff);
    reelsContainer.addChild(mask);
    reelsContainer.mask = mask;

    for (let r = 0; r < GAME_CONFIG.REELS_COUNT; r++) {
      this._reelViews.push(this._createReelView(reelsContainer, r));
    }
  }

  private _createReelView(parent: Container, reelIndex: number): ReelView {
    const reelContainer = new Container();
    reelContainer.x = reelIndex * GAME_CONFIG.REEL_WIDTH;
    parent.addChild(reelContainer);

    const sprites: Sprite[] = [];
    const cachedSymbols: (SymbolType | null)[] = [];
    const baseScales: [number, number][] = [];

    for (let i = 0; i < GAME_CONFIG.SPRITES_PER_REEL; i++) {
      const sprite = this._makeSymbolSprite(SymbolType.Cherry);
      sprite.x = GAME_CONFIG.REEL_WIDTH / 2;
      sprite.y = (i - 1) * CELL_HEIGHT + GAME_CONFIG.SYMBOL_SIZE / 2;
      sprite.anchor.set(0.5);
      reelContainer.addChild(sprite);
      sprites.push(sprite);
      cachedSymbols.push(null);
      baseScales.push([1, 1]);
    }

    return { container: reelContainer, sprites, cachedSymbols, baseScales };
  }

  private _makeSymbolSprite(type: SymbolType): Sprite {
    const config = SYMBOL_CONFIGS[type];
    if (!config) return new Sprite();
    const tex = getSymbolTexture(config.frameName);
    if (tex) {
      const s = new Sprite(tex);
      this._fitSpriteToCell(s);
      return s;
    }
    const g = new Graphics();
    g.roundRect(
      0,
      0,
      GAME_CONFIG.SYMBOL_SIZE,
      GAME_CONFIG.SYMBOL_SIZE,
      GAME_CONFIG.SYMBOL_BORDER_RADIUS,
    );
    g.fill(this._symColor(type));
    const t = this._app.renderer.generateTexture(g);
    return new Sprite(t);
  }

  private _setSymbolTexture(sprite: Sprite, type: SymbolType) {
    const config = SYMBOL_CONFIGS[type];
    if (!config) return;
    const tex = getSymbolTexture(config.frameName);
    if (tex) {
      sprite.texture = tex;
      this._fitSpriteToCell(sprite);
    }
  }

  private _fitSpriteToCell(sprite: Sprite) {
    const tex = sprite.texture;
    const scale = GAME_CONFIG.SYMBOL_SIZE / tex.height;
    sprite.height = GAME_CONFIG.SYMBOL_SIZE;
    sprite.width = tex.width * scale;
  }

  private _symColor(type: SymbolType): number {
    const c: Record<string, number> = {
      cherry: 0xff2244,
      lemon: 0xffee00,
      orange: 0xff8800,
      plum: 0x8844cc,
      watermelon: 0x22cc44,
      seven: 0xff0000,
      bar: 0xdddddd,
    };
    return c[type] ?? 0xffffff;
  }

  private _computeWinMask(): { winMask: number; showingWin: boolean } {
    let winMask = 0;
    let showingWin = false;

    const s = getSession(this.world, this._sessionQuery);
    if (!s) return { winMask, showingWin };

    const isWinState =
      s.session.state === GameState.WinDisplay || s.session.state === GameState.Idle;
    if (!isWinState || !this.world.hasComponent(s.entity, SpinResult))
      return { winMask, showingWin };

    const result = this.world.getComponent(s.entity, SpinResult);
    if (result.winLines.length === 0) return { winMask, showingWin };

    showingWin = true;
    for (const wl of result.winLines) {
      for (const [r, row] of wl.positions) {
        winMask |= 1 << (r * GAME_CONFIG.ROWS_COUNT + row);
      }
    }

    return { winMask, showingWin };
  }

  private _updateReelSprites(winMask: number, showingWin: boolean, pulseScale: number) {
    for (const re of this._reelQuery.entities) {
      const reel = this.world.getComponent(re, Reel);
      const view = this._reelViews[reel.reelIndex];
      if (!view) continue;

      for (let i = 0; i < view.sprites.length && i < reel.currentStrip.length; i++) {
        const sprite = view.sprites[i];
        const row = i - 1;
        const sym = reel.currentStrip[i];

        const changed = view.cachedSymbols[i] !== sym;
        if (changed) view.cachedSymbols[i] = sym;

        this._updateSymbolSprite(sprite, view, i, row, sym, changed, reel.scrollY);
        this._applyWinPulse(sprite, view, i, row, winMask, showingWin, pulseScale);
      }
    }
  }

  private _updateSymbolSprite(
    sprite: Sprite,
    view: ReelView,
    i: number,
    row: number,
    sym: SymbolType,
    changed: boolean,
    scrollY: number,
  ) {
    if (sym === SymbolType.BarTallTop) {
      if (changed) {
        const tallTex = getSymbolTexture('bar_tall.png');
        if (tallTex) {
          sprite.texture = tallTex;
          const tallHeight = CELL_HEIGHT * GAME_CONFIG.TALL_SYMBOL_ROWS - GAME_CONFIG.SYMBOL_GAP;
          sprite.width = GAME_CONFIG.REEL_WIDTH;
          sprite.height = tallHeight;
          view.baseScales[i] = [sprite.scale.x, sprite.scale.y];
        }
      }
      sprite.y = (row + 0.5) * CELL_HEIGHT + GAME_CONFIG.SYMBOL_SIZE / 2 + scrollY;
      sprite.visible = true;
    } else if (sym === SymbolType.BarTallBottom) {
      sprite.y = row * CELL_HEIGHT + GAME_CONFIG.SYMBOL_SIZE / 2 + scrollY;
      sprite.visible = false;
    } else {
      if (changed) {
        this._setSymbolTexture(sprite, sym);
        view.baseScales[i] = [sprite.scale.x, sprite.scale.y];
      }
      sprite.y = row * CELL_HEIGHT + GAME_CONFIG.SYMBOL_SIZE / 2 + scrollY;
      sprite.visible = true;
    }
  }

  private _applyWinPulse(
    sprite: Sprite,
    view: ReelView,
    i: number,
    row: number,
    winMask: number,
    showingWin: boolean,
    pulseScale: number,
  ) {
    const isWinning =
      row >= 0 &&
      (winMask &
        (1 <<
          (view.sprites.indexOf(sprite) > -1
            ? this._getReelIndexForView(view) * GAME_CONFIG.ROWS_COUNT + row
            : 0))) !==
        0;

    if (isWinning && showingWin) {
      const [bx, by] = view.baseScales[i];
      sprite.scale.set(bx * pulseScale, by * pulseScale);
    } else if (view.baseScales[i][0] !== 0) {
      sprite.scale.set(view.baseScales[i][0], view.baseScales[i][1]);
    }
  }

  private _getReelIndexForView(view: ReelView): number {
    return this._reelViews.indexOf(view);
  }

  private _drawWinLines(showingWin: boolean, winMask: number) {
    const winLinesCount = showingWin ? winMask : 0;
    if (this._lastWinLinesDrawn === winLinesCount) return;
    this._lastWinLinesDrawn = winLinesCount;

    this._winLinesGraphics.clear();
    if (!showingWin || winLinesCount === 0) return;

    const s = getSession(this.world, this._sessionQuery);
    if (!s || !this.world.hasComponent(s.entity, SpinResult)) return;
    const result = this.world.getComponent(s.entity, SpinResult);

    for (const wl of result.winLines) {
      const color = PAYLINE_COLORS[wl.lineIndex] ?? 0xffffff;

      for (let i = 0; i < wl.positions.length - 1; i++) {
        const [r1, row1] = wl.positions[i];
        const [r2, row2] = wl.positions[i + 1];
        const x1 = REELS_LEFT + r1 * GAME_CONFIG.REEL_WIDTH + GAME_CONFIG.REEL_WIDTH / 2;
        const y1 = REELS_TOP + row1 * CELL_HEIGHT + GAME_CONFIG.SYMBOL_SIZE / 2;
        const x2 = REELS_LEFT + r2 * GAME_CONFIG.REEL_WIDTH + GAME_CONFIG.REEL_WIDTH / 2;
        const y2 = REELS_TOP + row2 * CELL_HEIGHT + GAME_CONFIG.SYMBOL_SIZE / 2;

        this._winLinesGraphics.moveTo(x1, y1);
        this._winLinesGraphics.lineTo(x2, y2);
        this._winLinesGraphics.stroke({
          color,
          width: GAME_CONFIG.WIN_LINE_WIDTH,
          alpha: GAME_CONFIG.WIN_LINE_ALPHA,
        });
      }
    }
  }
}
