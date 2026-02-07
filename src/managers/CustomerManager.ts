import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';

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
  private onOrderComplete?: (order: CustomerOrder, rewards: { coins: number; xp: number }) => void;
  private onVisibilityChange?: () => void; // New: callback when customer visibility changes

  constructor(
    onCustomerArrive?: (customer: CustomerQueueEntry) => void,
    onOrderComplete?: (order: CustomerOrder, rewards: { coins: number; xp: number }) => void,
    onVisibilityChange?: () => void,
  ) {
    this.onCustomerArrive = onCustomerArrive;
    this.onOrderComplete = onOrderComplete;
    this.onVisibilityChange = onVisibilityChange;
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
  public update(deltaTime: number, player: Player) {
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
      this.onOrderComplete(customer.order, customer.order.reward);
    }

    return true;
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
}