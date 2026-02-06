import { Colors } from '../config/theme';
import { GameConfig } from '../config/gameConfig.ts';

export interface NPCConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  spritePath?: string;
  dialogLines: string[];
  interactionRadius?: number;
}

export class NPC {
  public id: string;
  public name: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dialogLines: string[];
  public interactionRadius: number;

  private sprite: HTMLImageElement | null = null;
  private spriteLoaded: boolean = false;
  private currentDialogIndex: number = 0;

  constructor(config: NPCConfig) {
    this.id = config.id;
    this.name = config.name;
    this.x = config.x;
    this.y = config.y;
    this.width = config.width || GameConfig.npc.defaultWidth;
    this.height = config.height || GameConfig.npc.defaultHeight;
    this.dialogLines = config.dialogLines;
    this.interactionRadius = config.interactionRadius || GameConfig.npc.defaultInteractionRadius;

    if (config.spritePath) {
      this.loadSprite(config.spritePath);
    }
  }

  private loadSprite(path: string) {
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.spriteLoaded = true;
      console.log(`NPC ${this.name} sprite loaded`);
    };
    this.sprite.onerror = () => {
      console.error(`Failed to load NPC ${this.name} sprite`);
      this.spriteLoaded = false;
    };
    this.sprite.src = path;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.spriteLoaded && this.sprite) {
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      // Fallback: Draw a colored rectangle
      ctx.fillStyle = Colors.orange;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.strokeStyle = Colors.darkGold;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);

      // Draw name label
      ctx.save();
      ctx.fillStyle = Colors.white;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.name, this.x + this.width / 2, this.y - 5);
      ctx.restore();
    }
  }

  public renderInteractionPrompt(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Draw "Press E" prompt above NPC
    const promptX = this.x + this.width / 2;
    const promptY = this.y - 30;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(promptX - 35, promptY - 15, 70, 20);

    // Border
    ctx.strokeStyle = Colors.moccasin;
    ctx.lineWidth = 2;
    ctx.strokeRect(promptX - 35, promptY - 15, 70, 20);

    // Text
    ctx.fillStyle = Colors.moccasin;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Press E', promptX, promptY - 5);

    ctx.restore();
  }

  public getCollisionBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public getNextDialog(): string {
    const dialog = this.dialogLines[this.currentDialogIndex];
    this.currentDialogIndex = (this.currentDialogIndex + 1) % this.dialogLines.length;
    return dialog;
  }

  public getCurrentDialog(): string {
    return this.dialogLines[this.currentDialogIndex];
  }

  public resetDialog() {
    this.currentDialogIndex = 0;
  }

  public isInRange(x: number, y: number): boolean {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    return distance <= this.interactionRadius;
  }

  public canInteractWith(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number
  ): boolean {
    const playerCenterX = playerX + playerWidth / 2;
    const playerCenterY = playerY + playerHeight / 2;
    return this.isInRange(playerCenterX, playerCenterY);
  }
}