import { Player } from './entities/Player';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  // Camera/viewport for the map
  private camera = {
    x: 0,
    y: 0,
  };

  // Background map image
  private mapImage: HTMLImageElement | null = null;
  private mapLoaded: boolean = false;
  private mapWidth: number = 2000; // Will be updated when image loads
  private mapHeight: number = 1500; // Will be updated when image loads

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;

    // Set fixed canvas resolution for pixel art
    this.canvas.width = 1200;
    this.canvas.height = 900;

    // Initialize player at center of screen
    this.player = new Player(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 50, 50);

    // Load the background map image
    this.loadMapImage();
  }

  private loadMapImage() {
    this.mapImage = new Image();
    this.mapImage.onload = () => {
      this.mapLoaded = true;
      if (this.mapImage) {
        this.mapWidth = this.mapImage.width;
        this.mapHeight = this.mapImage.height;
        console.log(`Map loaded: ${this.mapWidth}x${this.mapHeight}`);
      }
    };
    this.mapImage.onerror = () => {
      console.error('Failed to load map image');
      this.mapLoaded = false;
    };
    this.mapImage.src = '/test.jpg';
  }

  private update(deltaTime: number) {
    // Update player (but don't let them move off canvas)
    this.player.update(deltaTime, this.canvas.width, this.canvas.height);

    // Update camera to follow player
    this.updateCamera();
  }

  private updateCamera() {
    // Center camera on player
    this.camera.x = this.player.x + this.player.width / 2 - this.canvas.width / 2;
    this.camera.y = this.player.y + this.player.height / 2 - this.canvas.height / 2;

    // Clamp camera to map boundaries
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.mapWidth - this.canvas.width));
    this.camera.y = Math.max(0, Math.min(this.camera.y, this.mapHeight - this.canvas.height));
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw the map portion (if loaded)
    if (this.mapLoaded && this.mapImage) {
      // Draw only the visible portion of the map
      this.ctx.drawImage(
        this.mapImage,
        this.camera.x,
        this.camera.y, // Source x, y (what part of image to show)
        this.canvas.width,
        this.canvas.height, // Source width, height
        0,
        0, // Destination x, y (where to draw on canvas)
        this.canvas.width,
        this.canvas.height, // Destination width, height
      );
    } else {
      // Show loading text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading map...', this.canvas.width / 2, this.canvas.height / 2);
    }

    // Render player (adjust position relative to camera)
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);
    this.player.render(this.ctx);
    this.ctx.restore();
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

  public getPlayer(): Player {
    return this.player;
  }
}
