export { World, Query, NOT } from '@releaseband/ecs';
export type { Components, NotComponent } from '@releaseband/ecs';

import { World } from '@releaseband/ecs';
import type { System as ISystem } from '@releaseband/ecs';

export abstract class System implements ISystem {
  protected world: World;
  constructor(world: World) {
    this.world = world;
  }
  update(_dt: number) {}
  exit() {}
}
