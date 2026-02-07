import type { CollisionRect } from '../physics/CollisionSystem.ts';

/**
 * Collision data for the test map
 * This will be replaced with data loaded from Tiled JSON export
 */
export const testCollisions: CollisionRect[] = [
  // Top wall
  { x: 0, y: 0, width: 1024, height: 2 },
  // Bottom wall
  { x: 0, y: 768, width: 1024, height: 50 },
  // Left wall
  { x: 0, y: 0, width: 2, height: 768 },
  // Right wall
  { x: 1024, y: 0, width: 50, height: 768 },
];

/**
 * Recursively search for a layer by name and type in nested layer structures
 */
function findLayer(layers: any[], name: string, type: string): any {
  for (const layer of layers) {
    // Check if this layer matches
    if (layer.name === name && layer.type === type) {
      return layer;
    }

    // If this layer is a group, recursively search its children
    if (layer.type === 'group' && layer.layers) {
      const found = findLayer(layer.layers, name, type);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Load collision data from a Tiled JSON file
 * @param jsonPath - Path to the Tiled JSON export file
 * @returns Promise with collision rectangles
 */
export async function loadCollisionsFromFile(jsonPath: string): Promise<CollisionRect[]> {
  try {
    const response = await fetch(jsonPath);
    const tiledData = await response.json();

    // Find the collision object layer (supporting nested groups)
    const collisionLayer = findLayer(tiledData.layers, 'Collision', 'objectgroup');

    if (collisionLayer && collisionLayer.objects) {
      const rects: CollisionRect[] = collisionLayer.objects
        .filter((obj: any) => obj.rectangle || (!obj.polygon && !obj.ellipse && !obj.point))
        .map((obj: any) => ({
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
        }));

      console.log(`✅ Loaded ${rects.length} collision objects from ${jsonPath}`);
      return rects;
    }

    console.warn(`⚠️ No collision layer found in ${jsonPath}`);
    console.log('Available layers:', tiledData.layers.map((l: any) => ({ name: l.name, type: l.type })));
    return [];
  } catch (error) {
    console.error(`❌ Failed to load collision data from ${jsonPath}:`, error);
    return [];
  }
}