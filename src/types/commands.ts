export interface SpinCommand {
  type: 'spin';
}

export interface SkipCommand {
  type: 'skip';
}

export type GameCommand = SpinCommand | SkipCommand;
