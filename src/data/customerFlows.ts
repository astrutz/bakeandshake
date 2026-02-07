import type { NPCConfig } from '../entities/NPC';
import type { CustomerOrder } from '../managers/CustomerManager';

export interface CustomerFlowLevel {
  level: number;
  customers: {
    npcConfig: NPCConfig;
    order: CustomerOrder;
    arrivalTime: number; // seconds after level start
  }[];
}

/**
 * Level 1: Tutorial - Three customers wanting bread
 */
const level1Flow: CustomerFlowLevel = {
  level: 1,
  customers: [
    {
      // First customer - arrives immediately
      npcConfig: {
        id: 'customer_1',
        name: 'Mrs. Baker',
        x: 600,
        y: 400,
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
      arrivalTime: 1,
    },
  ],
};

const level2Flow: CustomerFlowLevel = {
  level: 2,
  customers: [
    {
      // First customer - arrives immediately
      npcConfig: {
        id: 'customer_1',
        name: 'Mrs. Baker',
        x: 600,
        y: 400,
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
      arrivalTime: 5,
    },
    {
      // Second customer - arrives after 30 seconds
      npcConfig: {
        id: 'customer_2',
        name: 'Mr. Smith',
        x: 650,
        y: 450,
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
      arrivalTime: 10, // 30 seconds after level start
    },
    {
      // Third customer - arrives after 60 seconds
      npcConfig: {
        id: 'customer_3',
        name: 'Little Timmy',
        x: 700,
        y: 500,
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
      arrivalTime: 15, // 60 seconds after level start
    },
  ],
};

/**
 * All customer flows by level
 */
export const CUSTOMER_FLOWS: Record<number, CustomerFlowLevel> = {
  1: level1Flow,
  2: level2Flow,
  // todo Add more levels here later
};

/**
 * Get customer flow for a specific level
 */
export function getCustomerFlow(level: number): CustomerFlowLevel | undefined {
  return CUSTOMER_FLOWS[level];
}