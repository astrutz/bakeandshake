export const GameConfig = {
  // Canvas settings (optimized for 32x32 tiles)
  canvas: {
    // 40 tiles wide × 30 tiles high = 4:3 aspect ratio
    width: 1280,  // 40 * 32
    height: 960,  // 30 * 32
    tileSize: 32,
    tilesX: 40,
    tilesY: 30,
  },

  // Map settings
  map: {
    width: 2000,
    height: 1500,
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