import { GameConfig } from '../config/gameConfig';

type Direction = 'down' | 'left' | 'right' | 'up';

export class Player {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public velocityX: number;
  public velocityY: number;

  // Player sprite
  private spriteSheet: HTMLImageElement | null = null;
  private spriteLoaded: boolean = false;

  // Sprite animation
  private readonly SPRITE_WIDTH = 32;
  private readonly SPRITE_HEIGHT = 32;
  private readonly FRAMES_PER_DIRECTION = 3;
  private currentFrame: number = 0;
  private animationTimer: number = 0;
  private readonly ANIMATION_SPEED = 0.15; // seconds per frame
  private currentDirection: Direction = 'down';
  private isMoving: boolean = false;

  // Sprite sheet layout (row index for each direction)
  private readonly DIRECTION_ROWS: Record<Direction, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  // Keyboard controls
  private keys: { [key: string]: boolean } = {};
  private speed: number = GameConfig.player.speed;

  // Movement lock
  private movementLocked: boolean = false;

  constructor(
    x: number,
    y: number,
    width: number = GameConfig.player.width,
    height: number = GameConfig.player.height,
  ) {
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
    this.spriteSheet = new Image();
    this.spriteSheet.onload = () => {
      this.spriteLoaded = true;
      console.log('Player sprite sheet loaded');
    };
    this.spriteSheet.onerror = () => {
      console.error('Failed to load player sprite sheet');
      this.spriteLoaded = false;
    };
    this.spriteSheet.src = '/player.png';
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
    this.isMoving = false;

    // Don't allow movement if locked (e.g., during dialog)
    if (this.movementLocked) {
      return { potentialX: this.x, potentialY: this.y };
    }

    let newDirection: Direction | null = null;

    // Check which keys are pressed
    const left = this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
    const right = this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];
    const up = this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'];
    const down = this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'];

    // 4-directional movement only (no diagonals)
    // Priority: vertical over horizontal
    if (up && !down) {
      this.velocityY = -this.speed;
      newDirection = 'up';
      this.isMoving = true;
    } else if (down && !up) {
      this.velocityY = this.speed;
      newDirection = 'down';
      this.isMoving = true;
    } else if (left && !right) {
      this.velocityX = -this.speed;
      newDirection = 'left';
      this.isMoving = true;
    } else if (right && !left) {
      this.velocityX = this.speed;
      newDirection = 'right';
      this.isMoving = true;
    }

    // Update direction if moving
    if (newDirection) {
      // Reset animation if direction changed
      if (this.currentDirection !== newDirection) {
        this.currentFrame = 0;
        this.animationTimer = 0;
      }
      this.currentDirection = newDirection;
    }

    // Update animation
    if (this.isMoving) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.ANIMATION_SPEED) {
        this.currentFrame = (this.currentFrame + 1) % this.FRAMES_PER_DIRECTION;
        this.animationTimer = 0;
      }
    } else {
      // Reset to first frame when standing still
      this.currentFrame = 0;
      this.animationTimer = 0;
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
      this.isMoving = false;
    }
  }

  public isMovementLocked(): boolean {
    return this.movementLocked;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.spriteLoaded && this.spriteSheet) {
      // Calculate source position in sprite sheet
      const row = this.DIRECTION_ROWS[this.currentDirection];
      const col = this.currentFrame;

      const sourceX = col * this.SPRITE_WIDTH;
      const sourceY = row * this.SPRITE_HEIGHT;

      // Draw the sprite from the sheet
      ctx.drawImage(
        this.spriteSheet,
        sourceX,
        sourceY,
        this.SPRITE_WIDTH,
        this.SPRITE_HEIGHT,
        this.x,
        this.y,
        this.width,
        this.height,
      );
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