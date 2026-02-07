import { Player } from './entities/Player';
import { DialogBox } from './ui/DialogBox';
import { PauseMenu } from './ui/PauseMenu';
import { CollisionSystem } from './physics/CollisionSystem';
import { DebugRenderer } from './utils/DebugRenderer';
import { NPCManager } from './managers/NPCManager';
import { CoinManager } from './managers/CoinManager';
import { XPManager } from './managers/XPManager';
import { CustomerManager, type CustomerQueueEntry } from './managers/CustomerManager';
import { InventoryManager } from './managers/InventoryManager';
import { SaveManager } from './managers/SaveManager';
import { testCollisions, loadCollisionsFromFile } from './data/collisions';
import { npcConfigs } from './data/npcs';
import { SoundManager } from './audio/SoundManager.ts';
import { SOUND_IDS } from './audio/SoundId.ts';
import { getCustomerFlow } from './data/customerFlows';
import { GameConfig } from './config/gameConfig';

export class Game {
  private canvas: HTMLCanvasElement;
  private soundManager: SoundManager;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private dialogBox: DialogBox;
  private pauseMenu: PauseMenu;
  private collisionSystem: CollisionSystem;
  private debugRenderer: DebugRenderer;
  private npcManager: NPCManager;
  private coinManager: CoinManager;
  private xpManager: XPManager;
  private customerManager: CustomerManager;
  private inventoryManager: InventoryManager;
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
  private mapWidth: number = GameConfig.map.width;
  private mapHeight: number = GameConfig.map.height;

  // Keyboard controls for dialog
  private keys: { [key: string]: boolean } = {};

  // FPS tracking for debug
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  // Current level
  private currentLevel: number = 1;

  // Track which customer we're currently interacting with
  private currentInteractingCustomer: CustomerQueueEntry | null = null;

  constructor(canvas: HTMLCanvasElement, soundManager: SoundManager) {
    this.canvas = canvas;
    this.soundManager = soundManager;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;

    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;

    // Set canvas resolution for 32x32 tiles (40×30 tiles = 1024×768)
    this.canvas.width = GameConfig.canvas.width;
    this.canvas.height = GameConfig.canvas.height;

    console.log(
      `Canvas: ${this.canvas.width}×${this.canvas.height} (${GameConfig.canvas.tilesX}×${GameConfig.canvas.tilesY} tiles of ${GameConfig.canvas.tileSize}px)`,
    );

    // Initialize player at center of screen (1 tile = 32×32)
    this.player = new Player(
      this.canvas.width / 2 - GameConfig.player.width / 2,
      this.canvas.height / 2 - GameConfig.player.height / 2,
      GameConfig.player.width,
      GameConfig.player.height,
    );

    // Initialize dialog box
    this.dialogBox = new DialogBox(soundManager);

    // Initialize pause menu
    this.pauseMenu = new PauseMenu();

    // Initialize coin manager
    this.coinManager = new CoinManager(0);

    // Initialize XP manager with level up callback
    this.xpManager = new XPManager(0, 1, this.handleLevelUp.bind(this));

    // Initialize inventory
    this.inventoryManager = new InventoryManager();

    // Initialize customer manager (no auto-dialog on arrival)
    this.customerManager = new CustomerManager(
      this.handleCustomerArrive.bind(this),
      this.handleOrderComplete.bind(this),
    );

    this.customerManager = new CustomerManager(
      this.handleCustomerArrive.bind(this),
      this.handleOrderComplete.bind(this),
      this.handleCustomerVisibilityChange.bind(this), // Add this
    );

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

    // Try to auto-load save on startup
    this.tryAutoLoad();

    // Start level 1
    this.startLevel(1);
  }

  private startLevel(level: number) {
    this.currentLevel = level;
    const customerFlow = getCustomerFlow(level);

    if (!customerFlow) {
      console.warn(`No customer flow defined for level ${level}`);
      return;
    }

    console.log(`🎮 Starting Level ${level}`);

    // Schedule all customers for this level
    customerFlow.customers.forEach((customerData) => {
      const npc = this.npcManager.addNPC(customerData.npcConfig);
      this.customerManager.scheduleCustomer(npc, customerData.order, customerData.arrivalTime);
    });
  }

  private handleCustomerVisibilityChange() {
    // Rebuild collisions when customer visibility changes
    this.collisionSystem.clearCollisionRects();
    this.collisionSystem.addCollisionRects(testCollisions);
    this.npcManager.updateCollisions();
  }

  private handleCustomerArrive(customer: CustomerQueueEntry) {
    // Just log the arrival, don't show dialog automatically
    console.log(`👤 ${customer.npc.name} has arrived! Walk up to them and press E to talk.`);
  }

  private handleOrderComplete(order: any, rewards: { coins: number; xp: number }) {
    this.coinManager.addCoins(rewards.coins);
    this.xpManager.addXP(rewards.xp);
  }

  private handleLevelUp(level: number, rewards?: { coins?: number; unlocks?: string[] }) {
    console.log(`🎉 Reached level ${level}!`);

    if (rewards) {
      if (rewards.coins) {
        this.coinManager.addCoins(rewards.coins);
        console.log(`💰 Earned ${rewards.coins} coins!`);
      }

      if (rewards.unlocks) {
        console.log(`🔓 Unlocked:`, rewards.unlocks.join(', '));
        // TODO: Actually unlock features/recipes/etc
      }
    }
  }

  private tryAutoLoad() {
    if (SaveManager.hasSave()) {
      console.log('Save file detected. Press "Load Game" in pause menu to continue.');
    }
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

      // Add coins with C key (for testing)
      if ((e.key === 'c' || e.key === 'C') && !this.pauseMenu.isPausedState()) {
        this.coinManager.addCoins(10);
        console.log(`Coins: ${this.coinManager.getCoins()}`);
        return;
      }

      // Add XP with X key (for testing)
      if ((e.key === 'x' || e.key === 'X') && !this.pauseMenu.isPausedState()) {
        this.xpManager.addXP(25);
        console.log(
          `XP: ${this.xpManager.getCurrentXP()} | Level: ${this.xpManager.getCurrentLevel()}`,
        );
        return;
      }

      // Add bread to inventory with B key (for testing)
      if ((e.key === 'b' || e.key === 'B') && !this.pauseMenu.isPausedState()) {
        this.inventoryManager.addItem('bread', 1);
        return;
      }

      // Complete current order with O key (for testing)
      if ((e.key === 'o' || e.key === 'O') && !this.pauseMenu.isPausedState()) {
        // Check if we're near any customer right now
        const nearbyCustomer = this.customerManager.getNearbyCustomer(this.player);

        if (nearbyCustomer) {
          const order = nearbyCustomer.order;
          if (this.inventoryManager.hasItem(order.item, order.quantity)) {
            this.inventoryManager.removeItem(order.item, order.quantity);
            this.customerManager.completeOrder(order.customerId);
            // Show thank you dialog
            this.dialogBox.show(nearbyCustomer.npc.getNextDialog());
            this.player.setMovementLocked(true);
          } else {
            console.log(`Not enough ${order.item}! Need ${order.quantity}`);
          }
        } else {
          console.log('No customer nearby to deliver to!');
        }
        return;
      }

      // Toggle pause with P or Escape key
      if (
        e.key === 'p' ||
        e.key === 'P' ||
        (e.key === 'Escape' && !this.dialogBox.getIsVisible())
      ) {
        this.pauseMenu.toggle();
        console.log(`Game ${this.pauseMenu.isPausedState() ? 'paused' : 'resumed'}`);
        return;
      }

      // Handle pause menu navigation
      if (this.pauseMenu.isPausedState()) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          this.pauseMenu.moveSelectionUp();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          this.pauseMenu.moveSelectionDown();
        } else if (e.key === 'Enter') {
          this.handleMenuSelection();
        }
        return;
      }

      // Don't process other keys if paused
      if (this.pauseMenu.isPausedState()) {
        return;
      }

      // Interact with nearby NPC using E key
      if (e.key === 'e' || e.key === 'E') {
        this.handleInteraction();
      }

      // Skip dialog with Space or Enter
      if ((e.key === ' ' || e.key === 'Enter') && this.dialogBox.getIsVisible()) {
        if (this.dialogBox.getIsComplete()) {
          this.dialogBox.hide();
          // Unlock player movement when dialog closes
          this.player.setMovementLocked(false);
        } else {
          this.dialogBox.skip();
        }
      }

      // Allow ESC to close dialog
      if (e.key === 'Escape' && this.dialogBox.getIsVisible()) {
        this.dialogBox.hide();
        this.player.setMovementLocked(false);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  private handleMenuSelection() {
    const { action, close } = this.pauseMenu.selectOption();

    switch (action) {
      case 'resume':
        this.pauseMenu.setPaused(false);
        break;

      case 'save':
        this.saveGame();
        break;

      case 'load':
        this.loadGame();
        if (close) {
          this.pauseMenu.setPaused(false);
        }
        break;

      case 'delete':
        this.deleteSave();
        break;
    }
  }

  private saveGame() {
    const success = SaveManager.save({
      playerX: this.player.x,
      playerY: this.player.y,
      coins: this.coinManager.getCoins(),
      xp: this.xpManager.getCurrentXP(),
      level: this.xpManager.getCurrentLevel(),
    });

    if (success) {
      this.pauseMenu.showFeedback('✓ Game saved successfully!');
    } else {
      this.pauseMenu.showFeedback('✗ Failed to save game');
    }
  }

  private loadGame() {
    const saveData = SaveManager.load();

    if (saveData) {
      this.player.setPosition(saveData.playerX, saveData.playerY);
      this.coinManager.setCoins(saveData.coins || 0);
      this.xpManager.setXP(saveData.xp || 0, saveData.level || 1);
      this.pauseMenu.showFeedback('✓ Game loaded successfully!');
    } else {
      this.pauseMenu.showFeedback('✗ No save data found');
    }
  }

  private deleteSave() {
    const success = SaveManager.deleteSave();

    if (success) {
      this.pauseMenu.showFeedback('✓ Save deleted');
    } else {
      this.pauseMenu.showFeedback('✗ Failed to delete save');
    }
  }

  private handleInteraction() {
    // First check for regular NPCs
    const nearbyNPC = this.npcManager.getNearbyNPC();

    // Then check for customers
    const nearbyCustomer = this.customerManager.getNearbyCustomer(this.player);

    // Prioritize customers over regular NPCs
    const interactTarget = nearbyCustomer ? nearbyCustomer.npc : nearbyNPC;

    if (interactTarget) {
      if (this.dialogBox.getIsVisible()) {
        // If dialog is already showing, advance to next line
        if (this.dialogBox.getIsComplete()) {
          const nextDialog = interactTarget.getNextDialog();
          this.dialogBox.show(nextDialog);
          this.soundManager.playSound(SOUND_IDS.NPC_TALK);
        } else {
          this.dialogBox.skip();
        }
      } else {
        // Start new conversation
        const dialog = interactTarget.getCurrentDialog();
        this.dialogBox.show(dialog);
        this.soundManager.playSound(SOUND_IDS.NPC_TALK);
        // Lock player movement when dialog opens
        this.player.setMovementLocked(true);

        // Track which customer we're interacting with
        if (nearbyCustomer) {
          this.currentInteractingCustomer = nearbyCustomer;
        }
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
    this.mapImage.src = '/map.png';
  }

  private update(deltaTime: number) {
    // Update pause menu feedback timer
    this.pauseMenu.update(deltaTime);

    // Update coin animation
    this.coinManager.update(deltaTime);

    // Update XP bar animation
    this.xpManager.update(deltaTime);

    // Don't update game state if paused
    if (this.pauseMenu.isPausedState()) {
      return;
    }

    // Update customer manager (independent of serving)
    this.customerManager.update(deltaTime, this.player);

    // Update player and get potential new position
    const { potentialX, potentialY } = this.player.update(deltaTime);

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

    // Render XP bar (bottom-left corner)
    this.xpManager.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render dialog box (always on top, not affected by camera)
    this.dialogBox.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render coin display (top-right corner)
    this.coinManager.render(this.ctx, this.canvas.width, this.canvas.height);

    // Update pause menu with current stats
    this.pauseMenu.setPlayerStats(
      this.xpManager.getCurrentLevel(),
      this.xpManager.getCurrentXP(),
      this.coinManager.getCoins(),
    );

    // Render pause menu (must be on top of everything)
    this.pauseMenu.render(this.ctx, this.canvas.width, this.canvas.height);

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

  public getPauseMenu(): PauseMenu {
    return this.pauseMenu;
  }

  public getCoinManager(): CoinManager {
    return this.coinManager;
  }

  public getXPManager(): XPManager {
    return this.xpManager;
  }

  public getCustomerManager(): CustomerManager {
    return this.customerManager;
  }

  public getInventoryManager(): InventoryManager {
    return this.inventoryManager;
  }
}
