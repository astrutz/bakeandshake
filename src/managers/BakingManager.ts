import { Player } from '../entities/Player';
import { NotificationManager } from '../ui/NotificationManager';
import { InventoryManager } from './InventoryManager';

export enum BakingStep {
  IDLE = 'IDLE',
  HAS_INGREDIENTS = 'HAS_INGREDIENTS',
  HAS_DOUGH = 'HAS_DOUGH',
  BAKING = 'BAKING',
}

export interface BakingZone {
  name: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class BakingManager {
  private currentStep: BakingStep = BakingStep.IDLE;
  private bakingTimer: number = 0;
  private readonly BAKING_DURATION = 5; // seconds
  private readonly TILE_SIZE = 32;
  private readonly INTERACTION_RADIUS = 50;

  private zones: Map<string, BakingZone> = new Map();
  private notificationManager: NotificationManager;
  private inventoryManager: InventoryManager;

  constructor(notificationManager: NotificationManager, inventoryManager: InventoryManager) {
    this.notificationManager = notificationManager;
    this.inventoryManager = inventoryManager;

    // Initialize zones based on map coordinates
    this.zones.set('pantry', {
      name: 'Pantry',
      row: 0,
      col: 8,
      x: 8 * this.TILE_SIZE,
      y: 0 * this.TILE_SIZE,
      width: this.TILE_SIZE,
      height: this.TILE_SIZE,
    });

    this.zones.set('oven', {
      name: 'Oven',
      row: 0,
      col: 9,
      x: 9 * this.TILE_SIZE,
      y: 0 * this.TILE_SIZE,
      width: this.TILE_SIZE,
      height: this.TILE_SIZE,
    });

    this.zones.set('table', {
      name: 'Table',
      row: 3,
      col: 10,
      x: 10 * this.TILE_SIZE,
      y: 3 * this.TILE_SIZE,
      width: this.TILE_SIZE,
      height: this.TILE_SIZE,
    });
  }

  public getCurrentStep(): BakingStep {
    return this.currentStep;
  }

  public isNearZone(zoneName: string, player: Player): boolean {
    const zone = this.zones.get(zoneName);
    if (!zone) return false;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const zoneCenterX = zone.x + zone.width / 2;
    const zoneCenterY = zone.y + zone.height / 2;

    const distance = Math.sqrt(
      Math.pow(playerCenterX - zoneCenterX, 2) + Math.pow(playerCenterY - zoneCenterY, 2),
    );

    return distance <= this.INTERACTION_RADIUS;
  }

  public handleBakingAction(player: Player): boolean {
    switch (this.currentStep) {
      case BakingStep.IDLE:
        // At pantry: grab ingredients
        if (this.isNearZone('pantry', player)) {
          // Check if inventory has space before starting
          if (!this.inventoryManager.hasSpace('bread', 1)) {
            this.notificationManager.showNotification('❌ Inventory full! (Max 5 bread)', 3);
            return false;
          }

          this.currentStep = BakingStep.HAS_INGREDIENTS;
          this.notificationManager.showNotification('📦 Grabbed flour and water!', 3);
          return true;
        }
        break;

      case BakingStep.HAS_INGREDIENTS:
        // At table: make dough
        if (this.isNearZone('table', player)) {
          this.currentStep = BakingStep.HAS_DOUGH;
          this.notificationManager.showNotification('🥖 Made dough!', 3);
          return true;
        }
        break;

      case BakingStep.HAS_DOUGH:
        // At oven: start baking
        if (this.isNearZone('oven', player)) {
          this.currentStep = BakingStep.BAKING;
          this.bakingTimer = 0;
          this.notificationManager.showNotification('🔥 Baking bread... (5s)', 3);
          return true;
        }
        break;

      case BakingStep.BAKING:
        // Can't do anything while baking
        this.notificationManager.showNotification('⏳ Wait for bread to bake...', 3);
        return false;
    }

    // Not at the right location for current step
    this.notificationManager.showNotification(this.getNextStepHint(), 3);
    return false;
  }

  private getNextStepHint(): string {
    switch (this.currentStep) {
      case BakingStep.IDLE:
        return '📍 Go to the Pantry to get ingredients!';
      case BakingStep.HAS_INGREDIENTS:
        return '📍 Go to the Table to make dough!';
      case BakingStep.HAS_DOUGH:
        return '📍 Go to the Oven to bake!';
      case BakingStep.BAKING:
        return '⏳ Bread is baking...';
      default:
        return '';
    }
  }

  public update(deltaTime: number): boolean {
    if (this.currentStep === BakingStep.BAKING) {
      this.bakingTimer += deltaTime;

      if (this.bakingTimer >= this.BAKING_DURATION) {
        // Baking complete - automatically reset to IDLE
        this.currentStep = BakingStep.IDLE;
        this.bakingTimer = 0;
        this.notificationManager.showNotification('🍞 Bread is ready!', 4);
        return true; // Bread is ready!
      }
    }
    return false;
  }

  public getBakingProgress(): number {
    if (this.currentStep === BakingStep.BAKING) {
      return Math.min(1, this.bakingTimer / this.BAKING_DURATION);
    }
    return 0;
  }

  public reset(): void {
    this.currentStep = BakingStep.IDLE;
    this.bakingTimer = 0;
  }

  public renderActiveZoneHighlight(ctx: CanvasRenderingContext2D): void {
    const activeZone = this.getActiveZone();
    if (!activeZone) return;

    ctx.save();

    // Pulsing glow effect - more transparent
    const time = Date.now() / 500;
    const alpha = 0.4 + Math.sin(time) * 0.6;

    // Center of the zone
    const centerX = activeZone.x + activeZone.width / 2;
    const centerY = activeZone.y + activeZone.height / 2;

    // Slightly larger radius (60% of zone size instead of 50%)
    const radius = Math.min(activeZone.width, activeZone.height) * 0.8;

    // Create radial gradient that fades out
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${alpha})`); // Bright in center
    gradient.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.5})`); // Medium
    gradient.addColorStop(1, `rgba(255, 215, 0, 0)`); // Fade to transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private getActiveZone(): BakingZone | null {
    switch (this.currentStep) {
      case BakingStep.IDLE:
        return this.zones.get('pantry') || null;
      case BakingStep.HAS_INGREDIENTS:
        return this.zones.get('table') || null;
      case BakingStep.HAS_DOUGH:
        return this.zones.get('oven') || null;
      default:
        return null;
    }
  }

  public renderBakingProgress(ctx: CanvasRenderingContext2D, canvasHeight: number): void {
    if (this.currentStep !== BakingStep.BAKING) return;

    ctx.save();

    const barWidth = 300;
    const barHeight = 30;
    const x = 20;
    const y = canvasHeight - 200;

    // Background
    ctx.fillStyle = 'rgba(139, 69, 19, 0.9)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Border
    ctx.strokeStyle = 'rgba(255, 215, 0, 1)'; // Gold
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Progress fill
    const progress = this.getBakingProgress();
    const fillWidth = (barWidth - 4) * progress;
    ctx.fillStyle = 'rgba(255, 140, 0, 1)'; // Orange
    ctx.fillRect(x + 2, y + 2, fillWidth, barHeight - 4);

    // Text
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // White
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const timeLeft = Math.ceil(this.BAKING_DURATION - this.bakingTimer);
    ctx.fillText(`🔥 Baking... ${timeLeft}s`, x + barWidth / 2, y + barHeight / 2);

    ctx.restore();
  }
}
