import { SOUND_IDS } from '../audio/SoundId.ts';
import type { SoundManager } from '../audio/SoundManager.ts';

export interface CollisionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CollisionSystem {
  private collisionRects: CollisionRect[] = [];
  private soundManager: SoundManager | null = null;
  private lastCollisionTime: number = 0;
  private readonly COLLISION_SOUND_COOLDOWN = 0.2;

  constructor(collisionData?: CollisionRect[], soundManager?: SoundManager) {
    if (collisionData) {
      this.collisionRects = collisionData;
    }
    if (soundManager) {
      this.soundManager = soundManager;
    }
  }

  public addCollisionRect(rect: CollisionRect) {
    this.collisionRects.push(rect);
  }

  public addCollisionRects(rects: CollisionRect[]) {
    this.collisionRects.push(...rects);
  }

  public clearCollisionRects() {
    this.collisionRects = [];
  }

  public getCollisionRects(): CollisionRect[] {
    return this.collisionRects;
  }

  /**
   * Check if a rectangle collides with any collision areas
   */
  public checkCollision(rect: CollisionRect): boolean {
    return this.collisionRects.some((collisionRect) => this.rectIntersects(rect, collisionRect));
  }

  /**
   * Get the corrected position after attempting to move
   * Returns the new position that respects collision boundaries
   */
  public resolveCollision(
    currentX: number,
    currentY: number,
    newX: number,
    newY: number,
    width: number,
    height: number,
  ): { x: number; y: number } {
    const entity = { x: newX, y: newY, width, height };

    // Check if new position would collide
    if (!this.checkCollision(entity)) {
      return { x: newX, y: newY };
    }

    this.playCollisionSound();

    // Try moving only horizontally
    const horizontalMove = { x: newX, y: currentY, width, height };
    const canMoveHorizontally = !this.checkCollision(horizontalMove);

    // Try moving only vertically
    const verticalMove = { x: currentX, y: newY, width, height };
    const canMoveVertically = !this.checkCollision(verticalMove);

    // Allow sliding along walls
    if (canMoveHorizontally && !canMoveVertically) {
      return { x: newX, y: currentY };
    }

    if (canMoveVertically && !canMoveHorizontally) {
      return { x: currentX, y: newY };
    }

    // Can't move in either direction, stay in current position
    return { x: currentX, y: currentY };
  }

  /**
   * Check if two rectangles intersect
   */
  private rectIntersects(rect1: CollisionRect, rect2: CollisionRect): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Load collision data from Tiled JSON export
   * Tiled object layers can export objects with x, y, width, height
   */
  public loadFromTiledObjects(tiledObjects: any[]): void {
    const rects: CollisionRect[] = tiledObjects
      .filter((obj) => obj.rectangle || (!obj.polygon && !obj.ellipse && !obj.point))
      .map((obj) => ({
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
      }));

    this.addCollisionRects(rects);
  }

  private playCollisionSound() {
    const currentTime = Date.now() / 1000; // Convert to seconds

    if (currentTime - this.lastCollisionTime >= this.COLLISION_SOUND_COOLDOWN) {
      if (this.soundManager && !this.soundManager.isPlaying(SOUND_IDS.COLLISION)) {
        this.soundManager.playSound(SOUND_IDS.COLLISION);
      }
      this.lastCollisionTime = currentTime;
    }
  }

  /**
   * Render collision boxes for debugging
   */
  public renderDebug(ctx: CanvasRenderingContext2D, color: string = 'rgba(255, 0, 0, 0.3)') {
    ctx.fillStyle = color;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    this.collisionRects.forEach((rect) => {
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
  }
}
