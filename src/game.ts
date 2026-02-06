export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
  };
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;

    this.rect = {
      x: 100,
      y: 100,
      width: 50,
      height: 50,
      velocityX: 100, // pixels per second
      velocityY: 80, // pixels per second
    };

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private update(deltaTime: number) {
    // Update rectangle position
    this.rect.x += this.rect.velocityX * deltaTime;
    this.rect.y += this.rect.velocityY * deltaTime;

    // Bounce off walls
    if (this.rect.x + this.rect.width > this.canvas.width || this.rect.x < 0) {
      this.rect.velocityX *= -1;
      this.rect.x = Math.max(0, Math.min(this.rect.x, this.canvas.width - this.rect.width));
    }
    if (this.rect.y + this.rect.height > this.canvas.height || this.rect.y < 0) {
      this.rect.velocityY *= -1;
      this.rect.y = Math.max(0, Math.min(this.rect.y, this.canvas.height - this.rect.height));
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw rectangle
    this.ctx.fillStyle = '#646cff';
    this.ctx.fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);

    // Optional: Draw a border
    this.ctx.strokeStyle = '#535bf2';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
  }

  private gameLoop = (currentTime: number) => {
    // Calculate delta time in seconds
    const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
    this.lastTime = currentTime;

    // Update game state
    this.update(deltaTime);

    // Render
    this.render();

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  public start() {
    if (this.animationFrameId === null) {
      this.lastTime = 0;
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.lastTime = 0;
    }
  }
}
