import { CollisionSystem } from '../physics/CollisionSystem';
import { Player } from '../entities/Player';
import { Colors, Fonts } from '../config/theme';

export class DebugRenderer {
  private enabled: boolean = false;
  private keys: { [key: string]: boolean } = {};

  constructor() {
    this.setupKeyboardControls();
  }

  private setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (this.keys[e.key]) return; // Prevent repeat
      this.keys[e.key] = true;

      // Toggle debug mode with D key (but not when typing in dialog)
      if ((e.key === 'd' || e.key === 'D') && !this.isTypingInInput()) {
        this.toggle();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  private isTypingInInput(): boolean {
    const activeElement = document.activeElement;
    return (
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA'
    );
  }

  public toggle() {
    this.enabled = !this.enabled;
    console.log(`Debug mode: ${this.enabled ? 'ON' : 'OFF'}`);
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Render collision boxes
   */
  public renderCollisions(
    ctx: CanvasRenderingContext2D,
    collisionSystem: CollisionSystem,
    color: string = 'rgba(255, 0, 0, 0.3)'
  ) {
    if (!this.enabled) return;
    collisionSystem.renderDebug(ctx, color);
  }

  /**
   * Render debug information overlay
   */
  public renderInfo(
    ctx: CanvasRenderingContext2D,
    data: {
      player: Player;
      camera: { x: number; y: number };
      collisionCount: number;
      fps?: number;
      level?: number;
      progress?: string;
    }
  ) {
    if (!this.enabled) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(5, 5, 300, 140); // Increased size

    ctx.fillStyle = Colors.green;
    ctx.font = `${Fonts.sizes.small} ${Fonts.body}`; // Was 14px
    ctx.textAlign = 'left';

    let yPos = 28; // Was 25
    const lineHeight = 24; // Was 20

    ctx.fillText(`Player: (${Math.round(data.player.x)}, ${Math.round(data.player.y)})`, 15, yPos);
    yPos += lineHeight;

    ctx.fillText(`Camera: (${Math.round(data.camera.x)}, ${Math.round(data.camera.y)})`, 15, yPos);
    yPos += lineHeight;

    ctx.fillText(`Collisions: ${data.collisionCount}`, 15, yPos);
    yPos += lineHeight;

    if (data.fps !== undefined) {
      ctx.fillText(`FPS: ${Math.round(data.fps)}`, 15, yPos);
      yPos += lineHeight;
    }

    ctx.fillStyle = '#ffff00';
    ctx.fillText('Press D to toggle debug', 15, yPos);

    ctx.restore();
  }

  /**
   * Render a specific entity's bounding box
   */
  public renderEntityBounds(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = '#00ff00'
  ) {
    if (!this.enabled) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  /**
   * Render a grid overlay (useful for positioning)
   */
  public renderGrid(
    ctx: CanvasRenderingContext2D,
    camera: { x: number; y: number },
    canvasWidth: number,
    canvasHeight: number,
    gridSize: number = 100
  ) {
    if (!this.enabled) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Calculate grid starting position
    const startX = Math.floor(camera.x / gridSize) * gridSize;
    const startY = Math.floor(camera.y / gridSize) * gridSize;

    // Vertical lines
    for (let x = startX; x < camera.x + canvasWidth; x += gridSize) {
      const screenX = x - camera.x;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y < camera.y + canvasHeight; y += gridSize) {
      const screenY = y - camera.y;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(canvasWidth, screenY);
      ctx.stroke();
    }

    ctx.restore();
  }
}