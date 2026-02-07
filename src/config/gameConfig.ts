/**
 * Game Configuration
 * Core settings for the game engine
 */

export const GameConfig = {
  // Canvas settings (optimized for 32x32 tiles)
  canvas: {
    // 32 tiles wide × 24 tiles high = 4:3 aspect ratio
    width: 1024,  // 32 * 32
    height: 768,  // 24 * 32
    tileSize: 32,
    tilesX: 32,
    tilesY: 24,
  },

  // Map settings
  map: {
    width: 1024,
    height: 768,
  },

  // Player settings
  player: {
    width: 32,   // 1 tile
    height: 32,  // 1 tile
    speed: 200,  // pixels per second
  },

  // NPC settings
  npc: {
    defaultWidth: 32,
    defaultHeight: 32,
    defaultInteractionRadius: 80,
  },

  // Physics
  physics: {
    friction: 0.8,
  },
} as const;