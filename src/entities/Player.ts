import { GameConfig } from '../config/gameConfig.ts';

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public velocityX: number;
  public velocityY: number;

  // Player sprite
  private sprite: HTMLImageElement | null = null;
  private spriteLoaded: boolean = false;

  // Keyboard controls
  private keys: { [key: string]: boolean } = {};
  private speed: number = GameConfig.player.speed;

  // Movement lock
  private movementLocked: boolean = false;

  constructor(x: number, y: number, width: number = GameConfig.player.width, height: number = GameConfig.player.height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocityX = 0;
    this.velocityY = 0;

    this.setupKeyboardControls();
    this.loadSprite();
  }

  private loadSprite() {
    this.sprite = new Image();
    this.sprite.onload = () => {
      this.spriteLoaded = true;
      console.log('Player sprite loaded');
    };
    this.sprite.onerror = () => {
      console.error('Failed to load player sprite');
      this.spriteLoaded = false;
    };
    this.sprite.src = '/testplayer.png';
  }

  private setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  public update(deltaTime: number) {
    // Handle keyboard input
    this.velocityX = 0;
    this.velocityY = 0;

    // Don't allow movement if locked (e.g., during dialog)
    if (this.movementLocked) {
      return { potentialX: this.x, potentialY: this.y };
    }

    if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
      this.velocityX = -this.speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
      this.velocityX = this.speed;
    }
    if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
      this.velocityY = -this.speed;
    }
    if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
      this.velocityY = this.speed;
    }

    // Normalize diagonal movement
    if (this.velocityX !== 0 && this.velocityY !== 0) {
      this.velocityX *= 0.707; // 1/√2
      this.velocityY *= 0.707;
    }

    // Calculate potential new position (will be validated by collision system)
    const potentialX = this.x + this.velocityX * deltaTime;
    const potentialY = this.y + this.velocityY * deltaTime;

    // Return potential position for collision checking
    return { potentialX, potentialY };
  }

  /**
   * Apply the validated position after collision checking
   */
  public applyPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Lock or unlock player movement (e.g., during dialogs)
   */
  public setMovementLocked(locked: boolean) {
    this.movementLocked = locked;
    if (locked) {
      this.velocityX = 0;
      this.velocityY = 0;
    }
  }

  public isMovementLocked(): boolean {
    return this.movementLocked;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.spriteLoaded && this.sprite) {
      // Draw the sprite image scaled to width x height
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      // Fallback: Draw rectangle if sprite not loaded
      ctx.fillStyle = '#646cff';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.strokeStyle = '#535bf2';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  public setVelocity(vx: number, vy: number) {
    this.velocityX = vx;
    this.velocityY = vy;
  }

  public setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getCollisionBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}