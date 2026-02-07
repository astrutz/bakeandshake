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
    row: number;
    col: number;
    width: number;
    height: number;
  };
  dialogLines: string[];
  interactionRadius?: number;
}

/**
 * Konfiguration für NPC Bewegung entlang eines Pfades
 */
export interface NPCPathConfig {
  enabled: boolean;
  path: Array<{ x: number; y: number }>;
  speed: number;
  targetPosition?: { x: number; y: number };
  loop: boolean;
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
  private spriteSheetConfig: NPCConfig['spriteSheet'] | null = null;

  // Pfad-Bewegung
  private pathConfig: NPCPathConfig | null = null;
  private currentWaypointIndex: number = 0;

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

  /**
   * Setze einen Pfad für den NPC
   */
  public setPath(pathConfig: NPCPathConfig) {
    this.pathConfig = pathConfig;
    this.currentWaypointIndex = 0;
    console.log(
      `🛣️  NPC ${this.name} Pfad gesetzt: ${pathConfig.path.length} Waypoints, Geschwindigkeit: ${pathConfig.speed}px/s`,
    );
  }

  /**
   * Update NPC Position basierend auf Pfad
   */
  public updatePath(deltaTime: number) {
    if (!this.pathConfig?.enabled || !this.pathConfig.path || this.pathConfig.path.length === 0) {
      return;
    }

    // console.log('Walking: ', this.x, this.y);

    if (this.currentWaypointIndex < this.pathConfig.path.length) {
      const currentWaypoint = this.pathConfig.path[this.currentWaypointIndex];
      const npcCenterX = this.x + this.width / 2;
      const npcCenterY = this.y + this.height / 2;

      const dx = currentWaypoint.x - npcCenterX;
      const dy = currentWaypoint.y - npcCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Wenn wir beim Waypoint angekommen sind
      if (distance < 10) {
        this.currentWaypointIndex++;
        console.log(`✅ NPC ${this.name} erreichte Waypoint ${this.currentWaypointIndex}`);

        if (this.currentWaypointIndex >= this.pathConfig.path.length) {
          if (this.pathConfig.targetPosition) {
            this.x = this.pathConfig.targetPosition.x - this.width / 2;
            this.y = this.pathConfig.targetPosition.y - this.height / 2;
          }

          if (this.pathConfig.loop) {
            this.currentWaypointIndex = 0;
          } else {
            this.pathConfig.enabled = false;
            console.log(`🎯 NPC ${this.name} hat Ziel erreicht!`);
          }
          return;
        }
      }

      // Bewege NPC zum nächsten Waypoint
      if (distance > 0) {
        const moveDistance = this.pathConfig.speed * deltaTime;
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;

        this.x += moveX;
        this.y += moveY;
      }
    }
  }

  /**
   * Bekomme den aktuellen Pfad-Status
   */
  public getPathStatus() {
    if (!this.pathConfig) {
      return { pathActive: false };
    }

    return {
      pathActive: this.pathConfig.enabled,
      currentWaypoint: this.currentWaypointIndex,
      totalWaypoints: this.pathConfig.path.length,
      progress:
        this.pathConfig.path.length > 0
          ? this.currentWaypointIndex / this.pathConfig.path.length
          : 0,
    };
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.spriteLoaded && this.sprite) {
      if (this.spriteSheetConfig) {
        const { row, col, width, height } = this.spriteSheetConfig;
        const sourceX = col * width;
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
          this.height,
        );
      } else {
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
      }
    } else {
      ctx.fillStyle = Colors.orange;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.strokeStyle = Colors.darkGold;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);

      ctx.save();
      ctx.fillStyle = Colors.white;
      ctx.font = `${Fonts.sizes.small} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.name, this.x + this.width / 2, this.y - 6);
      ctx.restore();
    }
  }

  /**
   * Debug: Zeichne den Pfad
   */
  public renderPath(ctx: CanvasRenderingContext2D) {
    if (!this.pathConfig?.path || this.pathConfig.path.length === 0) {
      return;
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';

    ctx.beginPath();
    ctx.moveTo(this.pathConfig.path[0].x, this.pathConfig.path[0].y);
    for (let i = 1; i < this.pathConfig.path.length; i++) {
      ctx.lineTo(this.pathConfig.path[i].x, this.pathConfig.path[i].y);
    }
    ctx.stroke();

    this.pathConfig.path.forEach((waypoint, index) => {
      if (index === this.currentWaypointIndex) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      } else if (index < this.currentWaypointIndex) {
        ctx.fillStyle = 'rgba(200, 200, 0, 0.5)';
      } else {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
      }

      ctx.beginPath();
      ctx.arc(waypoint.x, waypoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  public renderInteractionPrompt(ctx: CanvasRenderingContext2D) {
    ctx.save();

    const promptX = this.x + this.width / 2;
    const promptY = this.y - 40;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(promptX - 50, promptY - 20, 100, 28);

    ctx.strokeStyle = Colors.moccasin;
    ctx.lineWidth = 2;
    ctx.strokeRect(promptX - 50, promptY - 20, 100, 28);

    ctx.fillStyle = Colors.moccasin;
    ctx.font = `bold ${Fonts.sizes.small} ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Press E', promptX, promptY - 6);

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
