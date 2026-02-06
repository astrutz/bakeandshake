import { Player } from './entities/Player';
import { DialogBox } from './ui/DialogBox';
import { CollisionSystem } from './physics/CollisionSystem';
import { DebugRenderer } from './utils/DebugRenderer';
import { NPCManager } from './managers/NPCManager';
import { testCollisions, loadCollisionsFromFile } from './data/collisions';
import { npcConfigs } from './data/npcs';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private dialogBox: DialogBox;
  private collisionSystem: CollisionSystem;
  private debugRenderer: DebugRenderer;
  private npcManager: NPCManager;
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
  private mapWidth: number = 2000;
  private mapHeight: number = 1500;

  // Keyboard controls for dialog
  private keys: { [key: string]: boolean } = {};

  // FPS tracking for debug
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  // Interaction state
  private currentInteractingNPC: string | null = null;

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

    // Initialize dialog box
    this.dialogBox = new DialogBox();

    // Initialize collision system with test data
    this.collisionSystem = new CollisionSystem(testCollisions);

    // Initialize NPC manager and add NPCs
    this.npcManager = new NPCManager();
    this.loadNPCs();

    // Register NPC collisions
    this.npcManager.registerCollisions(this.collisionSystem);

    // Initialize debug renderer
    this.debugRenderer = new DebugRenderer();

    // Load the background map image
    this.loadMapImage();

    // Setup keyboard controls for dialog
    this.setupKeyboardControls();
  }

  private loadNPCs() {
    npcConfigs.forEach((config) => {
      this.npcManager.addNPC(config);
    });
    console.log(`Loaded ${npcConfigs.length} NPCs`);
  }

  /**
   * Load collision data from a Tiled JSON export
   * Call this when you have your Tiled map ready
   * Example: game.loadCollisionsFromTiled('/maps/bakery.json');
   */
  public async loadCollisionsFromTiled(jsonPath: string) {
    const collisions = await loadCollisionsFromFile(jsonPath);
    if (collisions.length > 0) {
      this.collisionSystem.clearCollisionRects();
      this.collisionSystem.addCollisionRects(collisions);
      // Re-register NPC collisions
      this.npcManager.registerCollisions(this.collisionSystem);
    }
  }

  private setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (this.keys[e.key]) return; // Prevent repeat
      this.keys[e.key] = true;

      // Interact with nearby NPC using E key
      if (e.key === 'e' || e.key === 'E') {
        this.handleInteraction();
      }

      // Skip dialog with Space or Enter
      if ((e.key === ' ' || e.key === 'Enter') && this.dialogBox.getIsVisible()) {
        if (this.dialogBox.getIsComplete()) {
          this.dialogBox.hide();
          this.currentInteractingNPC = null;
        } else {
          this.dialogBox.skip();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  private handleInteraction() {
    const nearbyNPC = this.npcManager.getNearbyNPC();

    if (nearbyNPC) {
      if (this.dialogBox.getIsVisible()) {
        // If dialog is already showing, advance to next line
        if (this.dialogBox.getIsComplete()) {
          const nextDialog = nearbyNPC.getNextDialog();
          this.dialogBox.show(nextDialog);
          this.currentInteractingNPC = nearbyNPC.id;
        } else {
          this.dialogBox.skip();
        }
      } else {
        // Start new conversation
        const dialog = nearbyNPC.getCurrentDialog();
        this.dialogBox.show(dialog);
        this.currentInteractingNPC = nearbyNPC.id;
      }
    }
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
    // Update player and get potential new position
    const { potentialX, potentialY } = this.player.update(
      deltaTime,
      this.canvas.width,
      this.canvas.height,
    );

    // Resolve collision and get validated position
    const validatedPosition = this.collisionSystem.resolveCollision(
      this.player.x,
      this.player.y,
      potentialX,
      potentialY,
      this.player.width,
      this.player.height,
    );

    // Apply the validated position to the player
    this.player.applyPosition(validatedPosition.x, validatedPosition.y);

    // Update camera to follow player
    this.updateCamera();

    // Update NPCs (check for nearby NPCs)
    this.npcManager.update(this.player);

    // Update dialog box
    this.dialogBox.update(deltaTime);

    // Update FPS counter
    this.updateFPS(deltaTime);
  }

  private updateFPS(deltaTime: number) {
    this.frameCount++;
    this.fpsUpdateTime += deltaTime;

    if (this.fpsUpdateTime >= 1.0) {
      this.fps = this.frameCount / this.fpsUpdateTime;
      this.frameCount = 0;
      this.fpsUpdateTime = 0;
    }
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
      this.ctx.drawImage(
        this.mapImage,
        this.camera.x,
        this.camera.y,
        this.canvas.width,
        this.canvas.height,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    } else {
      // Show loading text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Loading map...', this.canvas.width / 2, this.canvas.height / 2);
    }

    // Save context for camera-relative rendering
    this.ctx.save();
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // Render collision boxes in debug mode
    this.debugRenderer.renderCollisions(this.ctx, this.collisionSystem);

    // Render NPCs
    this.npcManager.render(this.ctx);

    // Render player
    this.player.render(this.ctx);

    // Render interaction prompts (must be after NPCs and player for proper layering)
    this.npcManager.renderInteractionPrompts(this.ctx);

    // Render player bounding box in debug mode
    this.debugRenderer.renderEntityBounds(
      this.ctx,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      '#00ff00',
    );

    this.ctx.restore();

    // Render dialog box (always on top, not affected by camera)
    this.dialogBox.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render debug info overlay
    this.debugRenderer.renderInfo(this.ctx, {
      player: this.player,
      camera: this.camera,
      collisionCount: this.collisionSystem.getCollisionRects().length,
      fps: this.fps,
    });
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

  public getCollisionSystem(): CollisionSystem {
    return this.collisionSystem;
  }

  public getDebugRenderer(): DebugRenderer {
    return this.debugRenderer;
  }

  public getNPCManager(): NPCManager {
    return this.npcManager;
  }
}
