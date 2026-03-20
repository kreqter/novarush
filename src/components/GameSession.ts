import { GameState } from '../types/game';

export class GameSession {
  playerName: string = '';
  balance: number = 1000;
  bet: number = 10;
  state: GameState = GameState.Init;
}
