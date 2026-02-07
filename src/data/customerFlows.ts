import type { NPCConfig } from '../entities/NPC';
import type { CustomerOrder } from '../managers/CustomerManager';
import type { NPCPathConfig } from '../entities/NPC';
import {
  PATH_TOP_TO_COUNTER,
  PATH_LEFT_TO_COUNTER,
  PATH_RIGHT_TO_COUNTER,
  PATH_BOTTOM_TO_COUNTER,
  PATH_ZIGZAG,
} from '../config/npcPaths';

export interface CustomerFlowLevel {
  level: number;
  customers: {
    npcConfig: NPCConfig;
    order: CustomerOrder;
    arrivalTime: number;
  }[];
}

export interface WaveSpawnerConfig {
  enabled: boolean;
  waveInterval: number;
  npcPerWave: number;
  delayBetweenNPCsInWave: number;
  delayBetweenWaves: number;
}

export interface CustomerFlowLevelWithWaves extends CustomerFlowLevel {
  waveSpawner?: WaveSpawnerConfig;
}

export interface CustomerFlowLevelWithPaths extends CustomerFlowLevelWithWaves {
  pathConfigs?: {
    [customerId: string]: NPCPathConfig;
  };
}

/**
 * Level 1: Tutorial - Ein Kunde MIT Wave Spawner enabled
 * Wave alle 5 Sekunden, 1 NPC pro Welle
 */
const level1Flow: CustomerFlowLevelWithPaths = {
  level: 1,
  waveSpawner: {
    enabled: true,
    waveInterval: 5,
    npcPerWave: 1,
    delayBetweenNPCsInWave: 3, // 1 Sekunde Verzögerung zwischen NPCs
    delayBetweenWaves: 5,
  },
  pathConfigs: {
    customer_1: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
  },
  customers: [
    {
      npcConfig: {
        id: 'customer_1',
        name: 'Mrs. Baker',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer1.png',
        spriteSheet: {
          row: 1,
          col: 0,
          width: 32,
          height: 32,
        },
        dialogLines: [
          'Hello! I would like to buy 2 loaves of bread please.',
          'Thank you! These look delicious!',
        ],
      },
      order: {
        customerId: 'customer_1',
        item: 'bread',
        quantity: 2,
        reward: {
          coins: 20,
          xp: 15,
        },
      },
      arrivalTime: 0,
    },
  ],
};

/**
 * Level 2: Mittelschwer - Drei Kunden MIT Wave Spawner enabled
 * Wave alle 4 Sekunden, 1 NPC pro Welle
 */
const level2Flow: CustomerFlowLevelWithPaths = {
  level: 2,
  waveSpawner: {
    enabled: true,
    waveInterval: 4,
    npcPerWave: 1,
    delayBetweenNPCsInWave: 3, // 1 Sekunde Verzögerung zwischen NPCs
    delayBetweenWaves: 5,
  },
  pathConfigs: {
    customer_1: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_2: {
      enabled: true,
      path: PATH_LEFT_TO_COUNTER.waypoints,
      speed: PATH_LEFT_TO_COUNTER.speed,
      targetPosition: PATH_LEFT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_3: {
      enabled: true,
      path: PATH_RIGHT_TO_COUNTER.waypoints,
      speed: PATH_RIGHT_TO_COUNTER.speed,
      targetPosition: PATH_RIGHT_TO_COUNTER.targetPosition,
      loop: false,
    },
  },
  customers: [
    {
      npcConfig: {
        id: 'customer_1',
        name: 'Mrs. Baker',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer1.png',
        spriteSheet: {
          row: 1,
          col: 0,
          width: 32,
          height: 32,
        },
        dialogLines: [
          'Hello! I would like to buy 2 loaves of bread please.',
          'Thank you! These look delicious!',
        ],
      },
      order: {
        customerId: 'customer_1',
        item: 'bread',
        quantity: 2,
        reward: {
          coins: 20,
          xp: 15,
        },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_2',
        name: 'Mr. Smith',
        x: -50,
        y: 400,
        spritePath: '/sprites/customer2.png',
        spriteSheet: {
          row: 1,
          col: 0,
          width: 32,
          height: 32,
        },
        dialogLines: [
          'Good day! I need 3 loaves of bread for my family.',
          'Perfect! My family will love these!',
        ],
      },
      order: {
        customerId: 'customer_2',
        item: 'bread',
        quantity: 3,
        reward: {
          coins: 30,
          xp: 20,
        },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_3',
        name: 'Little Timmy',
        x: 1074,
        y: 400,
        spritePath: '/sprites/customer3.png',
        spriteSheet: {
          row: 1,
          col: 0,
          width: 32,
          height: 32,
        },
        dialogLines: [
          'Hi! My mom sent me to get 5 loaves of bread!',
          'Wow! Thanks! This smells amazing!',
        ],
      },
      order: {
        customerId: 'customer_3',
        item: 'bread',
        quantity: 5,
        reward: {
          coins: 50,
          xp: 30,
        },
      },
      arrivalTime: 0,
    },
  ],
};

/**
 * Level 3: Normal - 6 Kunden MIT Wave Spawner enabled
 * Wave alle 3 Sekunden, 2 NPCs pro Welle
 */
const level3Flow: CustomerFlowLevelWithPaths = {
  level: 3,
  waveSpawner: {
    enabled: true,
    waveInterval: 3,
    npcPerWave: 2,
    delayBetweenNPCsInWave: 2, // 2 Sekunde Verzögerung zwischen NPCs
  },
  pathConfigs: {
    customer_1: {
      enabled: true,
      path: PATH_LEFT_TO_COUNTER.waypoints,
      speed: PATH_LEFT_TO_COUNTER.speed,
      targetPosition: PATH_LEFT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_2: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_3: {
      enabled: true,
      path: PATH_RIGHT_TO_COUNTER.waypoints,
      speed: PATH_RIGHT_TO_COUNTER.speed,
      targetPosition: PATH_RIGHT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_4: {
      enabled: true,
      path: PATH_BOTTOM_TO_COUNTER.waypoints,
      speed: PATH_BOTTOM_TO_COUNTER.speed,
      targetPosition: PATH_BOTTOM_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_5: {
      enabled: true,
      path: PATH_LEFT_TO_COUNTER.waypoints,
      speed: PATH_LEFT_TO_COUNTER.speed,
      targetPosition: PATH_LEFT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_6: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
  },
  customers: [
    {
      npcConfig: {
        id: 'customer_1',
        name: 'Alice',
        x: -50,
        y: 300,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Hey! I need 2 croissants!', 'Yum, thank you!'],
      },
      order: {
        customerId: 'customer_1',
        item: 'croissant',
        quantity: 2,
        reward: { coins: 25, xp: 18 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_2',
        name: 'Bob',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer2.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Good morning! I need 1 bread.', 'Perfect, thank you!'],
      },
      order: {
        customerId: 'customer_2',
        item: 'bread',
        quantity: 1,
        reward: { coins: 15, xp: 12 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_3',
        name: 'Carol',
        x: 1074,
        y: 400,
        spritePath: '/sprites/customer3.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['I need 3 pastries!', 'Great service!'],
      },
      order: {
        customerId: 'customer_3',
        item: 'pastry',
        quantity: 3,
        reward: { coins: 35, xp: 22 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_4',
        name: 'David',
        x: 512,
        y: 818,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Hello! 2 loaves please.', 'Wonderful!'],
      },
      order: {
        customerId: 'customer_4',
        item: 'bread',
        quantity: 2,
        reward: { coins: 20, xp: 15 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_5',
        name: 'Eva',
        x: -50,
        y: 400,
        spritePath: '/sprites/customer2.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['4 croissants, please!', 'Thank you so much!'],
      },
      order: {
        customerId: 'customer_5',
        item: 'croissant',
        quantity: 4,
        reward: { coins: 40, xp: 28 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_6',
        name: 'Frank',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer3.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['I need 5 items!', 'Perfect order!'],
      },
      order: {
        customerId: 'customer_6',
        item: 'bread',
        quantity: 5,
        reward: { coins: 50, xp: 35 },
      },
      arrivalTime: 0,
    },
  ],
};

/**
 * Level 4: Schwer - 5 Kunden MIT Wave Spawner enabled
 * Wave alle 2 Sekunden, 2 NPCs pro Welle
 */
const level4Flow: CustomerFlowLevelWithPaths = {
  level: 4,
  waveSpawner: {
    enabled: true,
    waveInterval: 2,
    npcPerWave: 2,
    delayBetweenNPCsInWave: 2, // 2 Sekunde Verzögerung zwischen NPCs
  },
  pathConfigs: {
    customer_1: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_2: {
      enabled: true,
      path: PATH_LEFT_TO_COUNTER.waypoints,
      speed: PATH_LEFT_TO_COUNTER.speed,
      targetPosition: PATH_LEFT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_3: {
      enabled: true,
      path: PATH_RIGHT_TO_COUNTER.waypoints,
      speed: PATH_RIGHT_TO_COUNTER.speed,
      targetPosition: PATH_RIGHT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_4: {
      enabled: true,
      path: PATH_BOTTOM_TO_COUNTER.waypoints,
      speed: PATH_BOTTOM_TO_COUNTER.speed,
      targetPosition: PATH_BOTTOM_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_5: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
  },
  customers: [
    {
      npcConfig: {
        id: 'customer_1',
        name: 'Grace',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Hurry! I need bread!', 'Thanks!'],
      },
      order: {
        customerId: 'customer_1',
        item: 'bread',
        quantity: 3,
        reward: { coins: 30, xp: 20 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_2',
        name: 'Henry',
        x: -50,
        y: 300,
        spritePath: '/sprites/customer2.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Quick service needed!', 'Excellent!'],
      },
      order: {
        customerId: 'customer_2',
        item: 'croissant',
        quantity: 2,
        reward: { coins: 25, xp: 18 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_3',
        name: 'Iris',
        x: 1074,
        y: 400,
        spritePath: '/sprites/customer3.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Two loaves, please!', 'Perfect!'],
      },
      order: {
        customerId: 'customer_3',
        item: 'bread',
        quantity: 2,
        reward: { coins: 20, xp: 15 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_4',
        name: 'Jack',
        x: 512,
        y: 818,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Need pastries!', 'Thank you!'],
      },
      order: {
        customerId: 'customer_4',
        item: 'pastry',
        quantity: 3,
        reward: { coins: 35, xp: 22 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_5',
        name: 'Kate',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer2.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Four items please!', 'Great service!'],
      },
      order: {
        customerId: 'customer_5',
        item: 'bread',
        quantity: 4,
        reward: { coins: 40, xp: 28 },
      },
      arrivalTime: 0,
    },
  ],
};

/**
 * Level 5: Expert - 7 Kunden MIT Wave Spawner enabled
 * Wave alle 1 Sekunde, 3 NPCs pro Welle
 */
const level5Flow: CustomerFlowLevelWithPaths = {
  level: 5,
  waveSpawner: {
    enabled: true,
    waveInterval: 1,
    npcPerWave: 3,
    delayBetweenNPCsInWave: 2, // 2 Sekunde Verzögerung zwischen NPCs
  },
  pathConfigs: {
    customer_1: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_2: {
      enabled: true,
      path: PATH_LEFT_TO_COUNTER.waypoints,
      speed: PATH_LEFT_TO_COUNTER.speed,
      targetPosition: PATH_LEFT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_3: {
      enabled: true,
      path: PATH_RIGHT_TO_COUNTER.waypoints,
      speed: PATH_RIGHT_TO_COUNTER.speed,
      targetPosition: PATH_RIGHT_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_4: {
      enabled: true,
      path: PATH_BOTTOM_TO_COUNTER.waypoints,
      speed: PATH_BOTTOM_TO_COUNTER.speed,
      targetPosition: PATH_BOTTOM_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_5: {
      enabled: true,
      path: PATH_ZIGZAG.waypoints,
      speed: PATH_ZIGZAG.speed,
      targetPosition: PATH_ZIGZAG.targetPosition,
      loop: false,
    },
    customer_6: {
      enabled: true,
      path: PATH_TOP_TO_COUNTER.waypoints,
      speed: PATH_TOP_TO_COUNTER.speed,
      targetPosition: PATH_TOP_TO_COUNTER.targetPosition,
      loop: false,
    },
    customer_7: {
      enabled: true,
      path: PATH_LEFT_TO_COUNTER.waypoints,
      speed: PATH_LEFT_TO_COUNTER.speed,
      targetPosition: PATH_LEFT_TO_COUNTER.targetPosition,
      loop: false,
    },
  },
  customers: [
    {
      npcConfig: {
        id: 'customer_1',
        name: 'Leo',
        x: 512,
        y: -50,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Bread now!', 'Thanks!'],
      },
      order: {
        customerId: 'customer_1',
        item: 'bread',
        quantity: 2,
        reward: { coins: 20, xp: 15 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_2',
        name: 'Mia',
        x: -50,
        y: 300,
        spritePath: '/sprites/customer2.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Croissant!', 'Perfect!'],
      },
      order: {
        customerId: 'customer_2',
        item: 'croissant',
        quantity: 1,
        reward: { coins: 15, xp: 12 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_3',
        name: 'Noah',
        x: 1074,
        y: 400,
        spritePath: '/sprites/customer3.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Pastry!', 'Great!'],
      },
      order: {
        customerId: 'customer_3',
        item: 'pastry',
        quantity: 2,
        reward: { coins: 20, xp: 15 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_4',
        name: 'Olivia',
        x: 512,
        y: 818,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Bread please!', 'Thanks!'],
      },
      order: {
        customerId: 'customer_4',
        item: 'bread',
        quantity: 3,
        reward: { coins: 30, xp: 20 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_5',
        name: 'Peter',
        x: -50,
        y: 300,
        spritePath: '/sprites/customer2.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Items!', 'Done!'],
      },
      order: {
        customerId: 'customer_5',
        item: 'croissant',
        quantity: 2,
        reward: { coins: 25, xp: 18 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_6',
        name: 'Quinn',
        x: 1074,
        y: 400,
        spritePath: '/sprites/customer3.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Quick!', 'Yes!'],
      },
      order: {
        customerId: 'customer_6',
        item: 'pastry',
        quantity: 3,
        reward: { coins: 35, xp: 22 },
      },
      arrivalTime: 0,
    },
    {
      npcConfig: {
        id: 'customer_7',
        name: 'Sam',
        x: -50,
        y: 400,
        spritePath: '/sprites/customer1.png',
        spriteSheet: { row: 1, col: 0, width: 32, height: 32 },
        dialogLines: ['Anything available!', 'Perfect!'],
      },
      order: {
        customerId: 'customer_7',
        item: 'bread',
        quantity: 5,
        reward: { coins: 50, xp: 35 },
      },
      arrivalTime: 0,
    },
  ],
};

/**
 * Alle Customer Flows
 */
export const CUSTOMER_FLOWS: Record<number, CustomerFlowLevelWithPaths> = {
  1: level1Flow,
  2: level2Flow,
  3: level3Flow,
  4: level4Flow,
  5: level5Flow,
};

/**
 * Get customer flow for a specific level
 */
export function getCustomerFlow(level: number): CustomerFlowLevelWithPaths | undefined {
  return CUSTOMER_FLOWS[level];
}

/**
 * Hilfsfunktion: Prüfe, ob Wave Spawner für ein Level aktiviert ist
 */
export function isWaveSpawnerEnabled(level: number): boolean {
  const flow = getCustomerFlow(level);
  return flow?.waveSpawner?.enabled ?? false;
}

/**
 * Hilfsfunktion: Bekomme Wave Spawner Konfiguration für ein Level
 */
export function getWaveSpawnerConfig(level: number): WaveSpawnerConfig | undefined {
  const flow = getCustomerFlow(level);
  return flow?.waveSpawner;
}

/**
 * Hilfsfunktion: Bekomme Pfad-Konfigurationen für ein Level
 */
export function getPathConfigs(level: number): Record<string, NPCPathConfig> | undefined {
  const flow = getCustomerFlow(level);
  return flow?.pathConfigs;
}
