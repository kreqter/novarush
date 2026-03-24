export class SpinCommand {
  active: boolean = false;
}

export class SkipCommand {
  active: boolean = false;
}

export class AutoPlayCommand {
  startCount: number | null = null;
  stopRequested: boolean = false;
}

export class TurboToggleCommand {
  active: boolean = false;
}

export class SetPlayerNameCommand {
  name: string | null = null;
}
