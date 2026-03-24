import { Application } from 'pixi.js';
import { GAME_CONFIG } from '../config/game';

export async function initPixiApp(container: HTMLElement): Promise<Application> {
  const app = new Application();

  await app.init({
    width: GAME_CONFIG.GAME_WIDTH,
    height: GAME_CONFIG.GAME_HEIGHT,
    backgroundColor: GAME_CONFIG.BG_COLOR,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
  });

  container.appendChild(app.canvas);
  handleResize(app);
  window.addEventListener('resize', () => handleResize(app));

  return app;
}

function handleResize(app: Application) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = h > w;

  let scale: number;

  if (isPortrait) {
    scale = (w - GAME_CONFIG.PORTRAIT_PADDING * 2) / GAME_CONFIG.FRAME_W;
  } else {
    scale = Math.min(w / GAME_CONFIG.GAME_WIDTH, h / GAME_CONFIG.GAME_HEIGHT);
  }

  const canvas = app.canvas;
  const canvasW = GAME_CONFIG.GAME_WIDTH * scale;
  const canvasH = GAME_CONFIG.GAME_HEIGHT * scale;

  canvas.style.width = `${canvasW}px`;
  canvas.style.height = `${canvasH}px`;
  canvas.style.position = 'absolute';
  canvas.style.left = `${(w - canvasW) / 2}px`;

  if (isPortrait) {
    const topOffset = Math.max(0, (h - canvasH) * GAME_CONFIG.PORTRAIT_TOP_OFFSET_RATIO);
    canvas.style.top = `${topOffset}px`;
  } else {
    canvas.style.top = `${(h - canvasH) / 2}px`;
  }
}
