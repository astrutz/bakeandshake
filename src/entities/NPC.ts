import { Colors, Fonts } from '../config/theme';
import { GameConfig } from '../config/gameConfig';

export interface NPCConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  spritePath?: string;
  spriteSheet?: {
    row: number;      // Which row in the sprite sheet
    col: number;      // Which column in the sprite sheet
    width: number;    // Width of each sprite frame
    height: number;   // Height of each sprite frame
  };
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
  public hidden: boolean = false;

  private sprite: HTMLImageElement | null = null;
  private spriteLoaded: boolean = false;
  private currentDialogIndex: number = 0;

  // Sprite sheet properties
  private spriteSheetConfig: NPCConfig['spriteSheet'] | null = null;

  private currentFrame: number = 0;
  private animationTimer: number = 0;
  private readonly ANIMATION_SPEED = 0.3; // seconds per frame
  public isWalking: boolean = false;
  public facingDirection: 'up' | 'down' | 'left' | 'right' = 'down';

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
      this.spriteSheetConfig = config.spriteSheet || null;
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
      if (this.spriteSheetConfig) {
        // Draw from sprite sheet
        const { col, width, height } = this.spriteSheetConfig;
        const row = this.getDirectionRow();
        const sourceX = (col + this.currentFrame) * width;
        const sourceY = row * height;

        ctx.drawImage(
          this.sprite,
          sourceX,
          sourceY,
          width,
          height,
          this.x,
          this.y,
          this.width,
          this.height
        );
      } else {
        // Draw full sprite
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
      }
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
      ctx.font = `${Fonts.sizes.small} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.name, this.x + this.width / 2, this.y - 6);
      ctx.restore();
    }
  }

  public renderInteractionPrompt(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const promptText = 'Press E to talk';
    const promptX = this.x + this.width / 2;
    const promptY = this.y - 40;

    // Measure text to calculate proper width
    ctx.font = `bold ${Fonts.sizes.small} ${Fonts.body}`;
    const textWidth = ctx.measureText(promptText).width;
    const padding = 20; // Padding on each side
    const boxWidth = textWidth + (padding * 2);
    const boxHeight = 28;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(promptX - boxWidth / 2, promptY - 20, boxWidth, boxHeight);

    // Border
    ctx.strokeStyle = Colors.moccasin;
    ctx.lineWidth = 2;
    ctx.strokeRect(promptX - boxWidth / 2, promptY - 20, boxWidth, boxHeight);

    // Text
    ctx.fillStyle = Colors.moccasin;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(promptText, promptX, promptY - 6);

    ctx.restore();
  }

  /**
   * Update animation frame
   */
  public updateAnimation(deltaTime: number) {
    if (!this.isWalking) {
      this.currentFrame = 0; // Reset to idle frame
      return;
    }

    this.animationTimer += deltaTime;
    if (this.animationTimer >= this.ANIMATION_SPEED) {
      this.animationTimer = 0;
      this.currentFrame = (this.currentFrame + 1) % 3; // Assuming 3 frames per direction
    }
  }

  /**
   * Set facing direction for sprite animation
   */
  public setDirection(direction: 'up' | 'down' | 'left' | 'right') {
    this.facingDirection = direction;
  }

  /**
   * Get the row in sprite sheet based on direction
   */
  private getDirectionRow(): number {
    if (!this.spriteSheetConfig) return 0;

    const baseRow = this.spriteSheetConfig.row;

    switch (this.facingDirection) {
      case 'down':
        return baseRow + 0;
      case 'left':
        return baseRow + 1;
      case 'right':
        return baseRow + 2;
      case 'up':
        return baseRow + 3;
      default:
        return baseRow;
    }
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
    this.currentDialogIndex = (this.currentDialogIndex + 1) % this.dialogLines.length;
    return this.dialogLines[this.currentDialogIndex];
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
    playerHeight: number,
  ): boolean {
    const playerCenterX = playerX + playerWidth / 2;
    const playerCenterY = playerY + playerHeight / 2;
    const npcCenterX = this.x + this.width / 2;
    const npcCenterY = this.y + this.height / 2;

    const distance = Math.sqrt(
      Math.pow(playerCenterX - npcCenterX, 2) + Math.pow(playerCenterY - npcCenterY, 2),
    );

    return distance <= this.interactionRadius;
  }
}