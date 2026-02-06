/**
 * Level progression configuration
 * Defines XP requirements and rewards for each level
 */

export interface LevelData {
  level: number;
  xpRequired: number; // Total XP needed to reach this level from level 1
  xpForNextLevel: number; // XP needed to go from this level to next
  rewards?: {
    coins?: number;
    unlocks?: string[];
  };
}

/**
 * Calculate XP required for a given level
 * Using exponential scaling: level^2 * 100
 */
export function calculateXPForLevel(level: number): number {
  return Math.floor(Math.pow(level, 2) * 100);
}

/**
 * Generate level data up to max level
 */
export function generateLevelData(maxLevel: number = 100): LevelData[] {
  const levels: LevelData[] = [];

  for (let i = 1; i <= maxLevel; i++) {
    const totalXP = calculateTotalXPForLevel(i);
    const xpForNext = calculateXPForLevel(i + 1) - calculateXPForLevel(i);

    levels.push({
      level: i,
      xpRequired: totalXP,
      xpForNextLevel: xpForNext,
      rewards: getLevelRewards(i),
    });
  }

  return levels;
}

/**
 * Get total XP needed from level 1 to target level
 */
function calculateTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXPForLevel(i + 1) - calculateXPForLevel(i);
  }
  return total;
}

/**
 * Define rewards for specific levels
 * Customize this to unlock features at certain levels
 */
function getLevelRewards(level: number): LevelData['rewards'] {
  const rewards: LevelData['rewards'] = {};

  // Coin rewards every 5 levels
  if (level % 5 === 0) {
    rewards.coins = level * 10;
  }

  // Special unlocks at milestone levels
  switch (level) {
    case 2:
      rewards.unlocks = ['basic_oven'];
      break;
    case 5:
      rewards.unlocks = ['croissant_recipe'];
      break;
    case 10:
      rewards.unlocks = ['premium_oven', 'baguette_recipe'];
      rewards.coins = 200;
      break;
    case 15:
      rewards.unlocks = ['cake_recipe'];
      break;
    case 20:
      rewards.unlocks = ['master_oven', 'macaron_recipe'];
      rewards.coins = 500;
      break;
    case 25:
      rewards.unlocks = ['sourdough_recipe'];
      break;
    case 30:
      rewards.unlocks = ['pastry_chef_title'];
      rewards.coins = 1000;
      break;
  }

  return Object.keys(rewards).length > 0 ? rewards : undefined;
}

/**
 * Pre-generated level data (1-100)
 * You can use this instead of generating on the fly
 */
export const LEVEL_DATA = generateLevelData(100);

/**
 * Get level data for a specific level
 */
export function getLevelData(level: number): LevelData | undefined {
  return LEVEL_DATA.find((data) => data.level === level);
}

/**
 * Get XP needed to reach next level from current XP
 */
export function getXPToNextLevel(currentXP: number, currentLevel: number): number {
  const nextLevelData = getLevelData(currentLevel + 1);
  if (!nextLevelData) return 0;
  return nextLevelData.xpRequired - currentXP;
}

/**
 * Calculate current level from total XP
 */
export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_DATA.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_DATA[i].xpRequired) {
      return LEVEL_DATA[i].level;
    }
  }
  return 1;
}

/**
 * Get XP progress percentage for current level (0-1)
 */
export function getXPProgressInLevel(currentXP: number, currentLevel: number): number {
  const currentLevelData = getLevelData(currentLevel);
  const nextLevelData = getLevelData(currentLevel + 1);

  if (!currentLevelData || !nextLevelData) return 0;

  const xpInCurrentLevel = currentXP - currentLevelData.xpRequired;
  const xpNeededForLevel = nextLevelData.xpRequired - currentLevelData.xpRequired;

  return Math.min(1, Math.max(0, xpInCurrentLevel / xpNeededForLevel));
}
