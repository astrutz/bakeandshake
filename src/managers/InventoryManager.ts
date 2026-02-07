/**
 * Simple inventory system for baked goods
 */

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
}

export class InventoryManager {
  private items: Map<string, InventoryItem> = new Map();

  constructor() {
    // Initialize with some default items
    this.items.set('bread', { id: 'bread', name: 'Bread', quantity: 0 });
  }

  /**
   * Add items to inventory
   */
  public addItem(itemId: string, quantity: number = 1): void {
    const item = this.items.get(itemId);
    if (item) {
      item.quantity += quantity;
      console.log(`📦 Added ${quantity}x ${item.name}. Total: ${item.quantity}`);
    } else {
      console.warn(`Item ${itemId} not found in inventory`);
    }
  }

  /**
   * Remove items from inventory
   */
  public removeItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) {
      console.warn(`Item ${itemId} not found in inventory`);
      return false;
    }

    if (item.quantity >= quantity) {
      item.quantity -= quantity;
      console.log(`📤 Removed ${quantity}x ${item.name}. Remaining: ${item.quantity}`);
      return true;
    } else {
      console.warn(`Not enough ${item.name}. Have: ${item.quantity}, Need: ${quantity}`);
      return false;
    }
  }

  /**
   * Check if player has enough of an item
   */
  public hasItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    return item ? item.quantity >= quantity : false;
  }

  /**
   * Get quantity of an item
   */
  public getQuantity(itemId: string): number {
    return this.items.get(itemId)?.quantity || 0;
  }

  /**
   * Get all items
   */
  public getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Clear inventory
   */
  public clear(): void {
    this.items.forEach((item) => {
      item.quantity = 0;
    });
  }
}