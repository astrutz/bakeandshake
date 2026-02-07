import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import type { InventoryManager } from './InventoryManager.ts';

export interface CustomerOrder {
  customerId: string;
  item: string;
  quantity: number;
  reward: {
    coins: number;
    xp: number;
  };
}

export interface CustomerQueueEntry {
  npc: NPC;
  order: CustomerOrder;
  arrivalTime: number;
  isActive: boolean;
  isCompleted: boolean;
}

export class CustomerManager {
  private customerQueue: CustomerQueueEntry[] = [];
  private gameTime: number = 0;

  // Callbacks
  private onCustomerArrive?: (customer: CustomerQueueEntry) => void;
  private onOrderComplete?: (rewards: { coins: number; xp: number }) => void;
  private onVisibilityChange?: () => void;
  private onLevelComplete?: () => void; // New: callback when all customers are served

  constructor(
    onCustomerArrive?: (customer: CustomerQueueEntry) => void,
    onOrderComplete?: (rewards: { coins: number; xp: number }) => void,
    onVisibilityChange?: () => void,
    onLevelComplete?: () => void,
  ) {
    this.onCustomerArrive = onCustomerArrive;
    this.onOrderComplete = onOrderComplete;
    this.onVisibilityChange = onVisibilityChange;
    this.onLevelComplete = onLevelComplete;
  }

  /**
   * Add a customer to the queue with a specific arrival time
   */
  public scheduleCustomer(npc: NPC, order: CustomerOrder, arrivalTime: number) {
    // Hide NPC initially
    npc.hidden = true;

    this.customerQueue.push({
      npc,
      order,
      arrivalTime,
      isActive: false,
      isCompleted: false,
    });

    // Sort queue by arrival time
    this.customerQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }

  /**
   * Update customer queue based on game time
   */
  public update(deltaTime: number) {
    this.gameTime += deltaTime;

    // Check if any customers should arrive (independent of previous customers)
    for (const customer of this.customerQueue) {
      if (!customer.isActive && !customer.isCompleted && this.gameTime >= customer.arrivalTime) {
        this.activateCustomer(customer);
      }
    }
  }

  /**
   * Activate a customer (make them appear)
   */
  private activateCustomer(customer: CustomerQueueEntry) {
    customer.isActive = true;
    customer.npc.hidden = false; // Show the NPC

    console.log(`👤 Customer arrived: ${customer.npc.name}`);
    console.log(`📋 Order: ${customer.order.quantity}x ${customer.order.item}`);

    // Trigger visibility change callback to update collisions
    if (this.onVisibilityChange) {
      this.onVisibilityChange();
    }

    if (this.onCustomerArrive) {
      this.onCustomerArrive(customer);
    }
  }

  /**
   * Complete an order and give rewards
   */
  public completeOrder(customerId: string): boolean {
    const customer = this.customerQueue.find((c) => c.order.customerId === customerId);

    if (!customer || !customer.isActive || customer.isCompleted) {
      return false;
    }

    customer.isCompleted = true;
    customer.npc.hidden = true; // Hide the NPC after order complete

    console.log(`✅ Order completed for ${customer.npc.name}`);
    console.log(`💰 Rewards: ${customer.order.reward.coins} coins, ${customer.order.reward.xp} XP`);

    // Trigger visibility change callback to update collisions
    if (this.onVisibilityChange) {
      this.onVisibilityChange();
    }

    if (this.onOrderComplete) {
      this.onOrderComplete(customer.order.reward);
    }

    // Check if level is complete
    this.checkLevelComplete();

    return true;
  }

  /**
   * Check if all customers have been served
   */
  private checkLevelComplete() {
    const allCompleted = this.customerQueue.length > 0 &&
      this.customerQueue.every((c) => c.isCompleted);

    if (allCompleted && this.onLevelComplete) {
      console.log('🎉 Level complete! All customers served!');
      this.onLevelComplete();
    }
  }

  /**
   * Check if level is complete (public method)
   */
  public isLevelComplete(): boolean {
    return this.customerQueue.length > 0 &&
      this.customerQueue.every((c) => c.isCompleted);
  }

  /**
   * Get current active customer that player is near
   */
  public getNearbyCustomer(player: Player): CustomerQueueEntry | null {
    for (const customer of this.customerQueue) {
      if (customer.isActive && !customer.isCompleted && !customer.npc.hidden) {
        if (customer.npc.canInteractWith(player.x, player.y, player.width, player.height)) {
          return customer;
        }
      }
    }
    return null;
  }

  /**
   * Get customer by ID
   */
  public getCustomerById(customerId: string): CustomerQueueEntry | undefined {
    return this.customerQueue.find((c) => c.order.customerId === customerId);
  }

  /**
   * Get all customers in queue
   */
  public getQueue(): CustomerQueueEntry[] {
    return this.customerQueue;
  }

  /**
   * Get pending customers (not yet arrived)
   */
  public getPendingCustomers(): CustomerQueueEntry[] {
    return this.customerQueue.filter((c) => !c.isActive && !c.isCompleted);
  }

  /**
   * Get active customers
   */
  public getActiveCustomers(): CustomerQueueEntry[] {
    return this.customerQueue.filter((c) => c.isActive && !c.isCompleted);
  }

  /**
   * Get completed customers
   */
  public getCompletedCustomers(): CustomerQueueEntry[] {
    return this.customerQueue.filter((c) => c.isCompleted);
  }

  /**
   * Get completion progress
   */
  public getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.customerQueue.length;
    const completed = this.getCompletedCustomers().length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }

  /**
   * Clear all customers
   */
  public clear() {
    this.customerQueue = [];
    this.gameTime = 0;
  }

  /**
   * Reset game time
   */
  public resetTime() {
    this.gameTime = 0;
  }

  /**
   * Get current game time
   */
  public getGameTime(): number {
    return this.gameTime;
  }

  /**
   * Render customer interaction prompts
   */
  public renderInteractionPrompts(ctx: CanvasRenderingContext2D, player: Player, inventoryManager: InventoryManager): void {
    // Get all active customers
    const activeCustomers = this.getActiveCustomers();

    activeCustomers.forEach((customer) => {
      const npc = customer.npc;

      // Check if player is near this customer
      if (npc.canInteractWith(player.x, player.y, player.width, player.height)) {
        ctx.save();

        // Check if player has the required items
        const hasItems = inventoryManager.hasItem(customer.order.item, customer.order.quantity);

        // Different text based on whether player can serve or not
        const promptText = hasItems ? 'Press O to serve' : 'Press E to talk';
        const promptX = npc.x + npc.width / 2;
        const promptY = npc.y - 40;

        // Measure text to calculate proper width
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(promptText).width;
        const padding = 20;
        const boxWidth = textWidth + (padding * 2);
        const boxHeight = 28;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(promptX - boxWidth / 2, promptY - 20, boxWidth, boxHeight);

        // Border - green if ready to serve, normal otherwise
        ctx.strokeStyle = hasItems ? 'rgba(144, 238, 144, 1)' : 'rgba(255, 228, 181, 1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(promptX - boxWidth / 2, promptY - 20, boxWidth, boxHeight);

        // Text
        ctx.fillStyle = hasItems ? 'rgba(144, 238, 144, 1)' : 'rgba(255, 228, 181, 1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(promptText, promptX, promptY - 6);

        ctx.restore();
      }
    });
  }
}