/**
 * Simple inventory system for baked goods
 */
import { Colors, Fonts } from '../config/theme.ts';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  maxQuantity?: number;
}

export class InventoryManager {
  private items: Map<string, InventoryItem> = new Map();

  constructor() {
    // Initialize with some default items
    this.items.set('bread', { id: 'bread', name: 'Bread', quantity: 0, maxQuantity: 5 });
  }

  /**
   * Add items to inventory
   */
  public addItem(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) {
      console.warn(`Item ${itemId} not found in inventory`);
      return false;
    }

    // Check if adding would exceed max quantity
    if (item.maxQuantity !== undefined) {
      const newQuantity = item.quantity + quantity;
      if (newQuantity > item.maxQuantity) {
        console.log(`❌ Cannot add ${quantity}x ${item.name}. Max capacity: ${item.maxQuantity}`);
        return false;
      }
    }

    item.quantity += quantity;
    console.log(`📦 Added ${quantity}x ${item.name}. Total: ${item.quantity}`);
    return true;
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
   * Check if inventory has space for more items
   */
  public hasSpace(itemId: string, quantity: number = 1): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    if (item.maxQuantity === undefined) return true;

    return item.quantity + quantity <= item.maxQuantity;
  }

  /**
   * Get quantity of an item
   */
  public getQuantity(itemId: string): number {
    return this.items.get(itemId)?.quantity || 0;
  }

  /**
   * Get max quantity of an item
   */
  public getMaxQuantity(itemId: string): number | undefined {
    return this.items.get(itemId)?.maxQuantity;
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

  /**
   * Set quantity directly (used for loading saves)
   */
  public setItemQuantity(itemId: string, quantity: number): void {
    const item = this.items.get(itemId);
    if (!item) return;
    const max = item.maxQuantity ?? quantity;
    item.quantity = Math.max(0, Math.min(quantity, max));
  }

  /**
   * Render inventory display
   */
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Position in top-left corner
    const x = 20;
    const y = 20;
    const width = 200;
    const height = 60;

    // Background
    ctx.fillStyle = 'rgba(139, 69, 19, 0.9)'; // Brown
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = Colors.chocolate; // Chocolate
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Title
    ctx.fillStyle = Colors.moccasin; // Moccasin
    ctx.font = `bold ${Fonts.sizes.tiny} ${Fonts.body}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Inventory', x + 10, y + 8);

    // Bread count
    const breadItem = this.items.get('bread');
    if (breadItem) {
      const breadCount = breadItem.quantity;
      const maxBread = breadItem.maxQuantity || 0;

      // Draw bread icon and count
      ctx.font = `${Fonts.sizes.medium} ${Fonts.body}`;
      ctx.fillText('🍞', x + 10, y + 28);

      ctx.font = `bold ${Fonts.sizes.medium} ${Fonts.body}`;
      ctx.fillStyle = breadCount >= maxBread
        ? Colors.red // Red when full
        : Colors.moccasin; // Normal color
      ctx.fillText(`${breadCount}/${maxBread}`, x + 45, y + 32);

      // Draw capacity indicator (small boxes)
      const boxSize = 12;
      const boxSpacing = 3;
      const boxStartX = x + 105;
      const boxY = y + 35;

      for (let i = 0; i < maxBread; i++) {
        const boxX = boxStartX + i * (boxSize + boxSpacing);

        if (i < breadCount) {
          // Filled box
          ctx.fillStyle = Colors.gold; // Gold
          ctx.fillRect(boxX, boxY, boxSize, boxSize);
          ctx.lineWidth = 1;
          ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        } else {
          // Empty box
          ctx.strokeStyle = 'rgba(255, 228, 181, 0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        }
      }
    }

    ctx.restore();
  }
}
