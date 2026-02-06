export interface SaveData {
  playerX: number;
  playerY: number;
  timestamp: number;
  version: string;
}

export class SaveManager {
  private static readonly SAVE_KEY = 'bakeandshake_save';
  private static readonly CURRENT_VERSION = '1.0.0';

  /**
   * Save game data to localStorage
   */
  public static save(data: Omit<SaveData, 'timestamp' | 'version'>): boolean {
    try {
      const saveData: SaveData = {
        ...data,
        timestamp: Date.now(),
        version: SaveManager.CURRENT_VERSION,
      };

      localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify(saveData));
      console.log('Game saved successfully!', saveData);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game data from localStorage
   */
  public static load(): SaveData | null {
    try {
      const savedJson = localStorage.getItem(SaveManager.SAVE_KEY);

      if (!savedJson) {
        console.log('No save data found');
        return null;
      }

      const saveData: SaveData = JSON.parse(savedJson);

      // Validate save data
      if (!saveData.playerX || !saveData.playerY) {
        console.warn('Invalid save data');
        return null;
      }

      console.log('Game loaded successfully!', saveData);
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if a save exists
   */
  public static hasSave(): boolean {
    return localStorage.getItem(SaveManager.SAVE_KEY) !== null;
  }

  /**
   * Delete saved game
   */
  public static deleteSave(): boolean {
    try {
      localStorage.removeItem(SaveManager.SAVE_KEY);
      console.log('Save data deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Get save info (without loading it)
   */
  public static getSaveInfo(): { exists: boolean; timestamp?: number; timeSince?: string } {
    const savedJson = localStorage.getItem(SaveManager.SAVE_KEY);

    if (!savedJson) {
      return { exists: false };
    }

    try {
      const saveData: SaveData = JSON.parse(savedJson);
      const timeSince = SaveManager.formatTimeSince(saveData.timestamp);

      return {
        exists: true,
        timestamp: saveData.timestamp,
        timeSince,
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Format time since save
   */
  private static formatTimeSince(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
}