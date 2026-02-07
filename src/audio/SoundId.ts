// audio/constants.ts
export const SOUND_IDS = {
  NPC_TALK: 'npcTalk',
  BACKGROUND_WIND: 'backgroundWind',
  BACKGROUND_COFFEE: 'backgroundCoffee',
} as const;

export type SoundID = (typeof SOUND_IDS)[keyof typeof SOUND_IDS];
