import { System, World, Query } from '../ecs';
import { Animation } from '../components/Animation';

export class AnimationSystem extends System {
  private _animQuery: Query;

  constructor(world: World) {
    super(world);
    this._animQuery = world.createQuery([Animation]);
  }

  update(dt: number) {
    for (const entity of this._animQuery.entities) {
      const anim = this.world.getComponent(entity, Animation);
      if (!anim.type) continue;

      anim.elapsed += dt;
      if (anim.elapsed >= anim.duration) {
        anim.type = '';
        anim.elapsed = 0;
        anim.duration = 0;
        anim.params = {};
      }
    }
  }
}
