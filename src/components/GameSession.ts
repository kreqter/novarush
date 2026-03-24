import { GameState } from '../types/game';

export class GameSession {
  playerName: string = '';
  balance: number = 0;
  bet: number = 0;
  state: GameState = GameState.Init;
}
