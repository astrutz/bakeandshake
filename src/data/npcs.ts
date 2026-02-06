import type { NPCConfig } from '../entities/NPC.ts';

/**
 * NPC configuration data
 * Add your NPCs here or load from a JSON file
 */
export const npcConfigs: NPCConfig[] = [
  {
    id: 'baker-mary',
    name: 'Mary',
    x: 500,
    y: 400,
    width: 50,
    height: 50,
    dialogLines: [
      "Welcome to Bake 'n Shake! I'm Mary, the head baker.",
      "We've been baking the finest pastries in town for over 20 years!",
      "Would you like to try our special croissant? It's freshly baked!",
      "Don't forget to check out our new sourdough bread!",
    ],
    interactionRadius: 80,
  },
  {
    id: 'customer-john',
    name: 'John',
    x: 900,
    y: 600,
    width: 50,
    height: 50,
    dialogLines: [
      "Hi there! I'm waiting for my order.",
      'The smell of fresh bread is amazing!',
      'I come here every morning for breakfast.',
      'You should try the cinnamon rolls!',
    ],
    interactionRadius: 80,
  },
  {
    id: 'chef-pierre',
    name: 'Pierre',
    x: 1400,
    y: 300,
    width: 50,
    height: 50,
    dialogLines: [
      'Bonjour! I am Pierre, the pastry chef!',
      'The secret to good croissants is butter, butter, and more butter!',
      'Would you like to learn the art of French baking?',
      'Ah, the perfect macaron is like a little piece of heaven!',
    ],
    interactionRadius: 100,
  },
];
