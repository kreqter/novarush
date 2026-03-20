import { Assets, Spritesheet, Texture } from 'pixi.js';

let spritesheet: Spritesheet | null = null;
let bgTexture: Texture | null = null;
let logoTexture: Texture | null = null;

export async function loadAssets(): Promise<void> {
  spritesheet = await Assets.load('assets/img/symbols/symbols.json');
  bgTexture = await Assets.load('assets/img/bg.png');
  logoTexture = await Assets.load('assets/img/logo.png');
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
