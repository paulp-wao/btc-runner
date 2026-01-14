import SAT, { Box, type Polygon, Response, Vector } from '~/collision detection/SAT';
import type { ISystem } from '~/ecs/system.agg';
import { GraphEntity } from '~/entity/entity.graph';
import { PhysicsStateEntity } from '~/entity/entity.physics-state';
import { PlayerEntity } from '~/entity/entity.player';
import type { IDiContainer } from '~/util/di-container';

type TestPolygonPolygon = (a: Polygon, b: Polygon, response?: Response) => boolean;

export const createGraphCollisionSystem = (di: IDiContainer): ISystem => {
  const entityStore = di.entityStore();
  const response = new Response();
  const testPolygonPolygon = SAT.testPolygonPolygon as TestPolygonPolygon;

  return {
    name: () => 'graph-collision-system',
    update: (_delta: number) => {
      const player = entityStore.first(PlayerEntity);
      const physics = entityStore.first(PhysicsStateEntity);
      const graph = entityStore.first(GraphEntity);
      
      if (!player || !physics || !graph) return;

      // Create a Box representing the player's bounds
      const playerBox = new Box(
        new Vector(player.ctr.x, player.ctr.y),
        player.ctr.width,
        player.ctr.height
      );
      
      // Convert player box to polygon for SAT collision detection
      const playerPolygon = playerBox.toPolygon();
      
      // Get the graph polygon
      const graphPolygon = graph.getPolygon();
      
      // Check for collision
      const isColliding = testPolygonPolygon(playerPolygon, graphPolygon, response);
      
      // Update debug bounding box visual with collision state
      player.updateDebugVisual(isColliding);
      
    },
  };
};

