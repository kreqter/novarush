import { Assets, Spritesheet, Texture } from 'pixi.js';
import '@esotericsoftware/spine-pixi-v8';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

let spritesheet: Spritesheet | null = null;
let bgTexture: Texture | null = null;
let logoTexture: Texture | null = null;
let spineInstance: Spine | null = null;

export async function loadAssets(): Promise<void> {
  spritesheet = await Assets.load('assets/img/symbols/symbols.json');
  bgTexture = await Assets.load('assets/img/bg.png');
  logoTexture = await Assets.load('assets/img/logo.png');

  await Assets.load([
    { alias: 'alien-skeleton', src: 'assets/img/spine/alien.json' },
    { alias: 'alien-atlas', src: 'assets/img/spine/alien.atlas' },
  ]);
  spineInstance = Spine.from({ skeleton: 'alien-skeleton', atlas: 'alien-atlas' });
}

export function getSymbolTexture(frameName: string): Texture | null {
  if (!spritesheet) return null;
  return spritesheet.textures[frameName] || null;
}

export function getBgTexture(): Texture | null {
  return bgTexture;
}

export function getLogoTexture(): Texture | null {
  return logoTexture;
}

export function getSpine(): Spine | null {
  return spineInstance;
}
