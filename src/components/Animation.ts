import type { AnimationType } from '../types/game';

export class Animation {
  type: AnimationType | '' = '';
  elapsed: number = 0;
  duration: number = 0;
  params: Record<string, any> = {};
}
