import { World } from './ecs';

import { Reel } from './components/Reel';
import { SlotSymbol } from './components/SlotSymbol';
import { GameSession } from './components/GameSession';
import { SpinResult } from './components/SpinResult';
import { AutoPlay } from './components/AutoPlay';
import { TurboMode } from './components/TurboMode';
import { TallSymbol } from './components/TallSymbol';
import {
  SpinCommand,
  SkipCommand,
  AutoPlayCommand,
  TurboToggleCommand,
  SetPlayerNameCommand,
} from './components/InputCommands';

import { InputBridgeSystem } from './systems/InputBridgeSystem';
import { SkipSystem } from './systems/SkipSystem';
import { PlayerInitSystem } from './systems/PlayerInitSystem';
import { SpinSystem } from './systems/SpinSystem';
import { SymbolGeneratorSystem } from './systems/SymbolGeneratorSystem';
import { ReelSpinSystem } from './systems/ReelSpinSystem';
import { EvaluationSystem } from './systems/EvaluationSystem';
import { PayoutSystem } from './systems/PayoutSystem';
import { AutoPlaySystem } from './systems/AutoPlaySystem';
import { TurboSystem } from './systems/TurboSystem';
import { SoundSystem } from './systems/SoundSystem';
import { RenderSystem } from './systems/RenderSystem';
import { MascotSystem } from './systems/MascotSystem';
import { UIBridgeSystem } from './systems/UIBridgeSystem';

import { GAME_CONFIG } from './config/game';
import { GameState } from './types/game';
import { initPixiApp } from './pixi/PixiApp';
import { loadAssets } from './pixi/AssetLoader';
import { SoundManager } from './pixi/SoundManager';
import { getRandomSymbol } from './config/symbols';

let world: World | null = null;

export async function initGame(container: HTMLElement): Promise<void> {
  const app = await initPixiApp(container);
  await loadAssets();
  SoundManager.preload();

  world = new World(GAME_CONFIG.MAX_ENTITIES);

  world.registerComponents([
    Reel,
    SlotSymbol,
    GameSession,
    SpinResult,
    AutoPlay,
    TurboMode,
    TallSymbol,
    SpinCommand,
    SkipCommand,
    AutoPlayCommand,
    TurboToggleCommand,
    SetPlayerNameCommand,
  ]);

  world.registerTags([
    'SPIN_REQUESTED',
    'SKIP_REQUESTED',
    'EVALUATING',
    'PAYING_OUT',
    'WIN_DISPLAYING',
    'TALL',
    'REEL_JUST_STOPPED',
  ]);

  createEntities(world);

  world.addSystem(new InputBridgeSystem(world));
  world.addSystem(new SkipSystem(world));
  world.addSystem(new PlayerInitSystem(world));
  world.addSystem(new SpinSystem(world));
  world.addSystem(new SymbolGeneratorSystem(world));
  world.addSystem(new ReelSpinSystem(world));
  world.addSystem(new EvaluationSystem(world));
  world.addSystem(new PayoutSystem(world));
  world.addSystem(new AutoPlaySystem(world));
  world.addSystem(new TurboSystem(world));
  world.addSystem(new SoundSystem(world));
  world.addSystem(new RenderSystem(world, app));
  world.addSystem(new MascotSystem(world, app));
  world.addSystem(new UIBridgeSystem(world));

  app.ticker.add((ticker) => {
    if (world) {
      world.update(ticker.deltaMS);
    }
  });
}

function createEntities(w: World) {
  const sessionEntity = w.createEntity();
  const session = new GameSession();
  session.balance = GAME_CONFIG.INITIAL_BALANCE;
  session.bet = GAME_CONFIG.BET_AMOUNT;
  session.state = GameState.Init;
  w.addComponent(sessionEntity, session);
  w.addComponent(sessionEntity, new SpinResult());
  w.addComponent(sessionEntity, new AutoPlay());
  w.addComponent(sessionEntity, new TurboMode());
  w.addComponent(sessionEntity, new SpinCommand());
  w.addComponent(sessionEntity, new SkipCommand());
  w.addComponent(sessionEntity, new AutoPlayCommand());
  w.addComponent(sessionEntity, new TurboToggleCommand());
  w.addComponent(sessionEntity, new SetPlayerNameCommand());

  for (let r = 0; r < GAME_CONFIG.REELS_COUNT; r++) {
    const reelEntity = w.createEntity();
    const reel = new Reel();
    reel.reelIndex = r;
    reel.state = 'idle';
    reel.currentStrip = [
      getRandomSymbol(),
      getRandomSymbol(),
      getRandomSymbol(),
      getRandomSymbol(),
    ];
    reel.targetSymbols = [reel.currentStrip[1], reel.currentStrip[2], reel.currentStrip[3]];
    w.addComponent(reelEntity, reel);
  }

  for (let col = 0; col < GAME_CONFIG.REELS_COUNT; col++) {
    for (let row = 0; row < GAME_CONFIG.ROWS_COUNT; row++) {
      const symEntity = w.createEntity();
      const sym = new SlotSymbol();
      sym.col = col;
      sym.row = row;
      sym.type = getRandomSymbol();
      w.addComponent(symEntity, sym);
    }
  }
}
