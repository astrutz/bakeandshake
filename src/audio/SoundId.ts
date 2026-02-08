// audio/constants.ts
export const SOUND_IDS = {
  NPC_TALK: 'npcTalk',
  COLLISION: 'collision',
  BACKGROUND_WIND: 'backgroundWind',
  BACKGROUND_COFFEE: 'backgroundCoffee',
  CAT_MEOW: 'catMeow',
  CAT_MEOW_2: 'catMeow-2',
  CAT_PURRING: 'catPurring',
  EVIL_BOX: 'evilBox',
  OVEN_AMBIENCE: 'ovenAmbience',
} as const;

export type SoundID = (typeof SOUND_IDS)[keyof typeof SOUND_IDS];
