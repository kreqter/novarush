import { World, Query } from '@releaseband/ecs';
import { GameSession } from '../components/GameSession';

export interface SessionData {
  entity: number;
  session: GameSession;
}

export function getSession(world: World, query: Query): SessionData | null {
  if (query.entities.size === 0) return null;
  const entity = query.entities.values().next().value!;
  return { entity, session: world.getComponent(entity, GameSession) };
}
