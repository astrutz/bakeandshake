import type { CollisionRect } from '../physics/CollisionSystem.ts';

/**
 * Collision data for the test map
 * This will be replaced with data loaded from Tiled JSON export
 */
export const testCollisions: CollisionRect[] = [
  // Top wall
  { x: 0, y: 0, width: 2000, height: 50 },
  // Bottom wall
  { x: 0, y: 1450, width: 2000, height: 50 },
  // Left wall
  { x: 0, y: 0, width: 50, height: 1500 },
  // Right wall
  { x: 1950, y: 0, width: 50, height: 1500 },

  // Obstacles in the middle
  { x: 400, y: 300, width: 200, height: 100 },
  { x: 800, y: 600, width: 150, height: 150 },
  { x: 1200, y: 400, width: 100, height: 300 },
];

/**
 * Load collision data from a Tiled JSON file
 * @param jsonPath - Path to the Tiled JSON export file
 * @returns Promise with collision rectangles
 */
export async function loadCollisionsFromFile(jsonPath: string): Promise<CollisionRect[]> {
  try {
    const response = await fetch(jsonPath);
    const tiledData = await response.json();

    // Find the collision object layer
    const collisionLayer = tiledData.layers.find(
      (layer: any) => layer.name === 'Collision' && layer.type === 'objectgroup',
    );

    if (collisionLayer && collisionLayer.objects) {
      const rects: CollisionRect[] = collisionLayer.objects
        .filter((obj: any) => obj.rectangle || (!obj.polygon && !obj.ellipse && !obj.point))
        .map((obj: any) => ({
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
        }));

      console.log(`Loaded ${rects.length} collision objects from ${jsonPath}`);
      return rects;
    }

    console.warn(`No collision layer found in ${jsonPath}`);
    return [];
  } catch (error) {
    console.error(`Failed to load collision data from ${jsonPath}:`, error);
    return [];
  }
}
