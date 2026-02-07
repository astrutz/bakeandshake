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
import { UI } from './config/theme';
import { LevelCompleteScreen, type LevelStats } from './ui/LevelCompleteScreen.ts';
import { BakingManager } from './managers/BakingManager';
import { NotificationManager } from './ui/NotificationManager.ts';
import { MusicToggleButton } from './ui/MusicToggleButton.ts';
import { MusicController } from './audio/MusicController.ts';

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
  private levelCompleteScreen: LevelCompleteScreen;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private bakingManager: BakingManager;
  private notificationManager: NotificationManager;
  private musicController: MusicController;
  private musicToggleButton: MusicToggleButton;

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

  constructor(canvas: HTMLCanvasElement, soundManager: SoundManager, musicController: MusicController) {
    this.canvas = canvas;
    this.soundManager = soundManager;
    this.musicController = musicController;
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
      500,
      450,
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

    this.customerManager = new CustomerManager(
      this.handleCustomerArrive.bind(this),
      this.handleOrderComplete.bind(this),
      this.handleCustomerVisibilityChange.bind(this),
      this.handleLevelComplete.bind(this),
    );

    // Initialize collision system with test data
    this.collisionSystem = new CollisionSystem([]);

    // Initialize NPC manager and add NPCs
    this.npcManager = new NPCManager();
    this.loadNPCs();

    // Register NPC collisions
    this.npcManager.registerCollisions(this.collisionSystem);

    // Initialize debug renderer
    this.debugRenderer = new DebugRenderer();

    // Initialize level complete screen
    this.levelCompleteScreen = new LevelCompleteScreen();

    // Initialize notification manager
    this.notificationManager = new NotificationManager();

    // Initialize baking manager
    this.bakingManager = new BakingManager(this.notificationManager, this.inventoryManager);

    // Initialize music toggle button
    this.musicToggleButton = new MusicToggleButton(
      () => this.musicController.isEnabled(),
      () => this.musicController.toggle(),
    );

    // Load the background map image
    this.loadMapImage();

    // Setup keyboard controls for dialog
    this.setupKeyboardControls();

    // Setup pointer controls for HUD
    this.setupPointerControls();

    // Try to auto-load save on startup
    this.tryAutoLoad();

    // Start level 1
    this.startLevel(2);
  }

  /**
   * Starte ein Level - OHNE Wave Spawner (klassisches System)
   */
  private startLevel(level: number) {
    this.currentLevel = level;
    const customerFlow = getCustomerFlow(level);

    if (!customerFlow) {
      console.warn(`No customer flow defined for level ${level}`);
      return;
    }

    console.log(`\n🎮 Starting Level ${level}`);
    console.log(`📊 customerFlow.customers.length: ${customerFlow.customers.length}`);
    console.log(`📊 customerFlow.waveSpawner:`, customerFlow.waveSpawner);
    console.log(
      `📊 customerFlow.pathConfigs:`,
      Object.keys(customerFlow.pathConfigs || {}).length,
      'paths',
    );

    // Prüfe, ob Wave Spawner für dieses Level aktiviert ist
    if (customerFlow.waveSpawner?.enabled) {
      console.log(`\n🌊 Wave Spawner ENABLED`);
      console.log(`   ├─ Interval: ${customerFlow.waveSpawner.waveInterval}s`);
      console.log(`   ├─ NPCs/Wave: ${customerFlow.waveSpawner.npcPerWave}`);
      console.log(`   ├─ NPCs Spawnduration: ${customerFlow.waveSpawner.delayBetweenNPCsInWave}`);
      console.log(`   └─ Total customers: ${customerFlow.customers.length}`);

      // Registriere die Pfad-Konfigurationen im CustomerManager ZUERST
      if (customerFlow.pathConfigs) {
        console.log(`\n📍 Registering path configs...`);
        this.customerManager.registerPathConfigs(customerFlow.pathConfigs);
      }

      // Erstelle NPCs für ALLE Kunden
      const customersForWaves: Array<{ npc: NPC; order: any }> = [];

      console.log(`\n🎯 Creating NPCs...`);
      for (let i = 0; i < customerFlow.customers.length; i++) {
        const customerData = customerFlow.customers[i];
        console.log(
          `   [${i + 1}/${customerFlow.customers.length}] Creating NPC: ${customerData.npcConfig.name} (ID: ${customerData.order.customerId})`,
        );

        const npc = this.npcManager.addNPC(customerData.npcConfig);

        customersForWaves.push({
          npc,
          order: customerData.order,
        });

        console.log(`   ✅ NPC added to customersForWaves`);
      }

      console.log(`\n📦 customersForWaves prepared with ${customersForWaves.length} customers`);

      // Konfiguriere und starte Wave Spawner
      console.log(`\n⚙️  Configuring Wave Spawner...`);
      this.customerManager.configureWaveSpawner(customerFlow.waveSpawner);

      console.log(`🚀 Starting Wave Spawner with ${customersForWaves.length} customers...`);
      this.customerManager.startWaveSpawner(customersForWaves);

      // Setze Pfade für alle NPCs
      if (customerFlow.pathConfigs) {
        console.log(`\n🛣️  Setting paths for NPCs...`);
        for (const [customerId, pathConfig] of Object.entries(customerFlow.pathConfigs)) {
          console.log(`   Setting path for: ${customerId}`);
          const npc = this.npcManager.getNPC(customerId);
          if (npc) {
            this.npcManager.setNPCPath(customerId, pathConfig as any);
            console.log(`   ✅ Path set`);
          } else {
            console.warn(`   ⚠️  NPC ${customerId} not found in npcManager!`);
          }
        }
      }

      console.log(`\n✨ Level ${level} initialized with Wave Spawner\n`);
    } else {
      // Nutze klassisches System (ohne Wave Spawner)
      console.log(`📌 Wave Spawner DISABLED - Using classic system\n`);

      customerFlow.customers.forEach((customerData, index) => {
        console.log(
          `[${index + 1}/${customerFlow.customers.length}] Scheduling: ${customerData.npcConfig.name}`,
        );
        const npc = this.npcManager.addNPC(customerData.npcConfig);
        this.customerManager.scheduleCustomer(npc, customerData.order, customerData.arrivalTime);
      });
    }
  }

  private handleCustomerVisibilityChange() {
    // Rebuild collisions when customer visibility changes
    this.npcManager.updateCollisions();
  }

  private handleLevelComplete() {
    console.log('🎊 Level Complete!');

    const stats: LevelStats = {
      level: this.currentLevel,
      timeElapsed: this.customerManager.getGameTime(),
      coinsEarned: this.coinManager.getCoins(),
      customersServed: this.customerManager.getCompletedCustomers().length,
      currentXP: this.xpManager.getCurrentXP(),
      currentLevel: this.xpManager.getCurrentLevel(),
    };

    // Lock player movement
    this.player.setMovementLocked(true);

    // Show level complete screen
    this.levelCompleteScreen.show(stats);
  }

  private handleLevelCompleteSelection() {
    const selection = this.levelCompleteScreen.getSelectedOption();

    if (selection === 'continue') {
      // Go to next level
      this.nextLevel();
    } else if (selection === 'menu') {
      // Return to main menu (for now, just restart level 1)
      console.log('📋 Returning to main menu...');
      // todo: Show main menu instead of restarting @Mona
      this.currentLevel = 1;
      this.customerManager.clear();
      this.player.setMovementLocked(false);
      this.levelCompleteScreen.hide();
      this.startLevel(1);
    }
  }

  private nextLevel() {
    this.currentLevel++;

    // Hide level complete screen
    this.levelCompleteScreen.hide();

    // Clear current level data
    this.customerManager.clear();
    this.player.setMovementLocked(false);
    this.dialogBox.hide();

    // Start new level
    const nextLevelFlow = getCustomerFlow(this.currentLevel);

    if (nextLevelFlow) {
      this.startLevel(this.currentLevel);
    } else {
      // No more levels - show victory screen or loop back
      console.log("🏆 You've completed all levels!");
      this.currentLevel = 1;
      this.startLevel(1);
    }
  }

  private handleCustomerArrive(customer: CustomerQueueEntry) {
    // Just log the arrival, don't show dialog automatically
    console.log(`👤 ${customer.npc.name} has arrived! Walk up to them and press E to talk.`);
  }

  private handleOrderComplete(rewards: { coins: number; xp: number }) {
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
      this.npcManager.updateCollisions();
    }
  }

  private setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (this.keys[e.key]) return; // Prevent repeat
      this.keys[e.key] = true;

      if (e.key === 'm' || e.key === 'M') {
        this.musicController.toggle();
        return;
      }

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

      // Baking process with B key
      if ((e.key === 'b' || e.key === 'B') && !this.pauseMenu.isPausedState()) {
        this.bakingManager.handleBakingAction(this.player);
        return;
      }

      // Update the O key handler to consume bread from baking manager:
      // In setupKeyboardControls, find the O key handler and update it:
      if ((e.key === 'o' || e.key === 'O') && !this.pauseMenu.isPausedState()) {
        const nearbyCustomer = this.customerManager.getNearbyCustomer(this.player);

        if (nearbyCustomer) {
          const order = nearbyCustomer.order;
          if (this.inventoryManager.hasItem(order.item, order.quantity)) {
            this.inventoryManager.removeItem(order.item, order.quantity);

            // REMOVE THIS SECTION:
            // if (order.item === 'bread') {
            //   this.bakingManager.consumeBread();
            // }

            this.customerManager.completeOrder(order.customerId);
            this.dialogBox.show(nearbyCustomer.npc.getNextDialog());
            this.player.setMovementLocked(true);
          } else {
            console.log(`Not enough ${order.item}! Need ${order.quantity}`);
            this.notificationManager.showNotification(`❌ Not enough ${order.item}!`);
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

      // Handle level complete screen
      if (this.levelCompleteScreen.isVisibleState()) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          this.levelCompleteScreen.moveSelectionUp();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          this.levelCompleteScreen.moveSelectionDown();
        } else if (e.key === 'Enter' || e.key === ' ') {
          this.handleLevelCompleteSelection();
        }
        return; // Don't process other keys when screen is visible
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  private setupPointerControls() {
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      const hit = this.musicToggleButton.hitTest(x, y);
      this.canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      this.musicToggleButton.handleClick(x, y);
    });
  }

  private async handleMenuSelection() {
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

      case 'main_menu': {
        // TODO Make hübsch dialog
        const wantsSave = window.confirm(
          'Do you want to save before returning to the main menu? Unsaved progress will be lost.',
        );
        if (wantsSave) {
          this.saveGame();
        } else {
          break;
        }
        this.pauseMenu.setPaused(false);
        window.dispatchEvent(new CustomEvent('open-main-menu'));
        break;
      }
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
    this.mapImage.src = '/map/map.png';
  }

  private update(deltaTime: number) {
    // Update pause menu feedback timer
    this.pauseMenu.update(deltaTime);

    // Update coin animation
    this.coinManager.update(deltaTime);

    // Update XP bar animation
    this.xpManager.update(deltaTime);

    // Update level complete screen animation
    this.levelCompleteScreen.update(deltaTime);

    // Update notification manager
    this.notificationManager.update();

    // Don't update game state if paused
    if (this.pauseMenu.isPausedState() || this.levelCompleteScreen.isVisibleState()) {
      return;
    }

    // Update baking manager
    const breadReady = this.bakingManager.update(deltaTime);
    if (breadReady) {
      // Try to add bread to inventory when baking completes
      const added = this.inventoryManager.addItem('bread', 1);
      if (!added) {
        // This shouldn't happen as we check before starting, but just in case
        this.notificationManager.showNotification('❌ Inventory full! Bread wasted!', 3);
        this.bakingManager.reset(); // Reset baking state
      }
    }

    // Update customer manager (independent of serving)
    this.customerManager.update(deltaTime);

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

    // WICHTIG: Update NPCs mit deltaTime!
    this.npcManager.update(this.player, deltaTime);

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

    // Render baking progress bar (if baking)
    this.bakingManager.renderBakingProgress(this.ctx, this.canvas.height);

    // Render glowing highlight on active zone
    this.bakingManager.renderActiveZoneHighlight(this.ctx);

    // Render notifications
    this.notificationManager.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render inventory (top-left corner)
    this.inventoryManager.render(this.ctx);

    // Render player
    this.player.render(this.ctx);

    // Render interaction prompts (must be after NPCs and player for proper layering)
    // Create a set of customer NPC IDs to exclude
    const customerNPCIds = new Set(
      this.customerManager.getActiveCustomers().map(c => c.npc.id)
    );
    this.npcManager.renderInteractionPrompts(this.ctx, customerNPCIds);

    // Render customer-specific interaction prompts
    this.customerManager.renderInteractionPrompts(this.ctx, this.player, this.inventoryManager);

    // Render baking interaction prompt
    this.bakingManager.renderInteractionPrompt(this.ctx, this.player);

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
    this.xpManager.render(this.ctx, this.canvas.height);

    // Render dialog box (always on top, not affected by camera)
    this.dialogBox.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render music toggle in the top-right corner
    const coinHudDefault = this.coinManager.getHudBoxRect(this.ctx, this.canvas.width);
    const buttonSize = coinHudDefault.height;
    const gap = UI.padding.small;
    const buttonRight = this.canvas.width - 24;
    this.musicToggleButton.setBounds({
      x: buttonRight - buttonSize,
      y: coinHudDefault.y + (coinHudDefault.height - buttonSize) / 2,
      width: buttonSize,
      height: buttonSize,
    });
    this.musicToggleButton.render(this.ctx);

    // Render coin display to the left of the music toggle
    const coinsRight = buttonRight - buttonSize - gap;
    this.coinManager.renderAtRight(this.ctx, coinsRight);

    // Update pause menu with current stats
    this.pauseMenu.setPlayerStats(
      this.xpManager.getCurrentLevel(),
      this.xpManager.getCurrentXP(),
      this.coinManager.getCoins(),
    );

    // Render pause menu (must be on top of everything)
    this.pauseMenu.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render level complete screen (should be on top of pause menu)
    this.levelCompleteScreen.render(this.ctx, this.canvas.width, this.canvas.height);

    // Render debug info overlay
    this.debugRenderer.renderInfo(this.ctx, {
      player: this.player,
      camera: this.camera,
      collisionCount: this.collisionSystem.getCollisionRects().length,
      fps: this.fps,
    });

    const progress = this.customerManager.getProgress();
    this.debugRenderer.renderInfo(this.ctx, {
      player: this.player,
      camera: this.camera,
      collisionCount: this.collisionSystem.getCollisionRects().length,
      fps: this.fps,
      level: this.currentLevel,
      progress: `${progress.completed}/${progress.total} customers`, // Add this
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
