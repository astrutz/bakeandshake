/**
 * Vordefinierte NPC Pfade für verschiedene Eingänge und Ziele
 */

export interface PathDefinition {
  id: string;
  name: string;
  waypoints: Array<{ x: number; y: number }>;
  targetPosition: { x: number; y: number };
  speed: number;
}

/**
 * Pfad 1: Von oben (außerhalb Map) zur Theke
 */
export const PATH_TOP_TO_COUNTER: PathDefinition = {
  id: 'top_to_counter',
  name: 'Top Entrance to Counter',
  speed: 150,
  waypoints: [
    { x: 512, y: -50 },
    { x: 512, y: 150 },
    { x: 512, y: 300 },
    { x: 512, y: 450 },
  ],
  targetPosition: { x: 512, y: 450 },
};

/**
 * Pfad 2: Von links (außerhalb Map) zur Theke
 */
export const PATH_LEFT_TO_COUNTER: PathDefinition = {
  id: 'left_to_counter',
  name: 'Left Entrance to Counter',
  speed: 150,
  waypoints: [
    { x: -50, y: 400 },
    { x: 150, y: 400 },
    { x: 300, y: 400 },
    { x: 450, y: 400 },
  ],
  targetPosition: { x: 450, y: 400 },
};

/**
 * Pfad 3: Von rechts (außerhalb Map) zur Theke
 */
export const PATH_RIGHT_TO_COUNTER: PathDefinition = {
  id: 'right_to_counter',
  name: 'Right Entrance to Counter',
  speed: 150,
  waypoints: [
    { x: 1074, y: 400 },
    { x: 900, y: 400 },
    { x: 750, y: 400 },
    { x: 600, y: 400 },
  ],
  targetPosition: { x: 600, y: 400 },
};

/**
 * Pfad 4: Von unten (außerhalb Map) zur Theke
 */
export const PATH_BOTTOM_TO_COUNTER: PathDefinition = {
  id: 'bottom_to_counter',
  name: 'Bottom Entrance to Counter',
  speed: 150,
  waypoints: [
    { x: 512, y: 818 },
    { x: 512, y: 700 },
    { x: 512, y: 550 },
    { x: 512, y: 450 },
  ],
  targetPosition: { x: 512, y: 450 },
};

/**
 * Pfad 5: Komplexerer Pfad mit mehreren Turns
 */
export const PATH_ZIGZAG: PathDefinition = {
  id: 'zigzag',
  name: 'Zigzag Path',
  speed: 120,
  waypoints: [
    { x: -50, y: 300 },
    { x: 250, y: 300 },
    { x: 250, y: 500 },
    { x: 512, y: 500 },
    { x: 512, y: 450 },
  ],
  targetPosition: { x: 512, y: 450 },
};

/**
 * Alle verfügbaren Pfade
 */
export const NPC_PATHS: Record<string, PathDefinition> = {
  [PATH_TOP_TO_COUNTER.id]: PATH_TOP_TO_COUNTER,
  [PATH_LEFT_TO_COUNTER.id]: PATH_LEFT_TO_COUNTER,
  [PATH_RIGHT_TO_COUNTER.id]: PATH_RIGHT_TO_COUNTER,
  [PATH_BOTTOM_TO_COUNTER.id]: PATH_BOTTOM_TO_COUNTER,
  [PATH_ZIGZAG.id]: PATH_ZIGZAG,
};

/**
 * Bekomme einen Pfad nach ID
 */
export function getPath(pathId: string): PathDefinition | undefined {
  return NPC_PATHS[pathId];
}

/**
 * Bekomme einen zufälligen Eingangs-Pfad
 */
export function getRandomEntrancePath(): PathDefinition {
  const entrancePaths = [
    PATH_TOP_TO_COUNTER,
    PATH_LEFT_TO_COUNTER,
    PATH_RIGHT_TO_COUNTER,
    PATH_BOTTOM_TO_COUNTER,
  ];

  return entrancePaths[Math.floor(Math.random() * entrancePaths.length)];
}
