import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import type { InventoryManager } from './InventoryManager.ts';

export interface CustomerOrder {
  customerId: string;
  item: string;
  quantity: number;
  reward: {
    coins: number;
    xp: number;
  };
}

export interface CustomerQueueEntry {
  npc: NPC;
  order: CustomerOrder;
  arrivalTime: number;
  isActive: boolean;
  isCompleted: boolean;
  isGone: boolean;
  entryPathConfig?: any;
  waveNumber?: number;
}

/**
 * Wave Spawner Configuration
 */
export interface WaveSpawnerConfig {
  enabled: boolean;
  waveInterval: number;
  npcPerWave: number;
  delayBetweenNPCsInWave?: number;
  delayBetweenWaves?: number; // NEU: Verzögerung zwischen Wellen
}

export class CustomerManager {
  private customerQueue: CustomerQueueEntry[] = [];
  private gameTime: number = 0;

  // Wave Spawner
  private waveSpawnerConfig: WaveSpawnerConfig = {
    waveInterval: 5,
    npcPerWave: 3,
    enabled: false,
    delayBetweenNPCsInWave: 0,
    delayBetweenWaves: 3,
  };
  // Für Verzögerung innerhalb einer Welle
  private currentWaveNpcIndex: number = 0;
  private waveNpcSpawnTime: number = 0;
  private isSpawningWave: boolean = false;
  private currentWave: number = 0;
  private waveSpawnTime: number = 0;
  private waveNpcIndex: number = 0;
  private allCustomersForWaves: Array<{ npc: NPC; order: CustomerOrder }> = [];
  private lastSpawnedWave: number = 0;
  private allWavesSpawned: boolean = false; // Neu: Track ob alle Wellen gespawnt wurden

  // Path-Konfigurationen für Rückweg
  private npcPathConfigs: Map<string, any> = new Map();

  // Callbacks
  private onCustomerArrive?: (customer: CustomerQueueEntry) => void;
  private onOrderComplete?: (rewards: { coins: number; xp: number }) => void;
  private onVisibilityChange?: () => void;
  private onLevelComplete?: () => void;
  private onWaveStart?: (waveNumber: number) => void;
  private onWaveComplete?: (waveNumber: number) => void;

  constructor(
    onCustomerArrive?: (customer: CustomerQueueEntry) => void,
    onOrderComplete?: (rewards: { coins: number; xp: number }) => void,
    onVisibilityChange?: () => void,
    onLevelComplete?: () => void,
  ) {
    this.onCustomerArrive = onCustomerArrive;
    this.onOrderComplete = onOrderComplete;
    this.onVisibilityChange = onVisibilityChange;
    this.onLevelComplete = onLevelComplete;
  }

  /**
   * Registriere Pfad-Konfigurationen für Rückweg
   */
  public registerPathConfigs(pathConfigs: Record<string, any>) {
    this.npcPathConfigs.clear();
    Object.entries(pathConfigs).forEach(([customerId, config]) => {
      this.npcPathConfigs.set(customerId, config);
      console.log(`📍 Pfad registriert für: ${customerId}`);
    });
    console.log(`📊 Insgesamt ${this.npcPathConfigs.size} Pfade registriert`);
  }

  /**
   * Konfiguriere den Wave Spawner
   */
  public configureWaveSpawner(config: Partial<WaveSpawnerConfig>) {
    this.waveSpawnerConfig = { ...this.waveSpawnerConfig, ...config };
  }

  /**
   * Starte den Wave Spawner
   */
  public startWaveSpawner(
    customers: Array<{ npc: NPC; order: CustomerOrder }>,
    onWaveStart?: (waveNumber: number) => void,
    onWaveComplete?: (waveNumber: number) => void,
  ) {
    this.allCustomersForWaves = customers;
    this.currentWave = 0;
    this.waveSpawnTime = 0;
    this.waveNpcIndex = 0;
    this.lastSpawnedWave = 0;
    this.allWavesSpawned = false;
    this.onWaveStart = onWaveStart;
    this.onWaveComplete = onWaveComplete;
    this.waveSpawnerConfig.enabled = true;

    console.log(
      `🌊 Wave Spawner gestartet: ${this.waveSpawnerConfig.npcPerWave} NPCs alle ${this.waveSpawnerConfig.waveInterval}s`,
    );
  }

  /**
   * Stoppe den Wave Spawner
   */
  public stopWaveSpawner() {
    this.waveSpawnerConfig.enabled = false;
    console.log('🛑 Wave Spawner gestoppt');
  }

  /**
   * Update Wave Spawner Logic
   */
  private updateWaveSpawner(deltaTime: number) {
    if (!this.waveSpawnerConfig.enabled) return;

    const delayBetweenNPCsInWave = this.waveSpawnerConfig.delayBetweenNPCsInWave || 0;

    // Wenn gerade eine Welle mit Verzögerung gespawnt wird
    if (this.isSpawningWave && delayBetweenNPCsInWave > 0) {
      this.waveNpcSpawnTime += deltaTime;

      if (this.waveNpcSpawnTime >= delayBetweenNPCsInWave) {
        this.waveNpcSpawnTime = 0; // Reset für nächsten NPC
        console.log(`   ⏱️  Spawn Timer reached - spawning next NPC in wave`);
        this.spawnNextNPCInWave();
      }
      // WICHTIG: return hier, damit wir nicht auch noch waveSpawnTime erhöhen!
      return;
    }

    // Normales Wellen-Spawning (ohne Verzögerung innerhalb der Welle)
    // oder wenn eine Welle gerade beendet wurde
    this.waveSpawnTime += deltaTime;

    if (this.waveSpawnTime >= this.waveSpawnerConfig.waveInterval) {
      this.waveSpawnTime = 0; // WICHTIG: Timer zurücksetzen!
      this.spawnNextWave();
    }
  }

  /**
   * Spawne den nächsten NPC innerhalb einer Welle (mit Verzögerung)
   */
  private spawnNextNPCInWave() {
    const { npcPerWave } = this.waveSpawnerConfig;

    console.log(
      `   🎯 spawnNextNPCInWave: currentWaveNpcIndex=${this.currentWaveNpcIndex}, npcPerWave=${npcPerWave}`,
    );

    // Prüfe ob es noch NPCs zum Spawnen gibt
    if (this.waveNpcIndex >= this.allCustomersForWaves.length) {
      this.allWavesSpawned = true;
      this.isSpawningWave = false;
      console.log(`✅ Alle Wellen wurden gespawnt! (Insgesamt ${this.waveNpcIndex} NPCs)\n`);
      return;
    }

    // Wenn wir schon genug NPCs dieser Welle gespawnt haben, beende die Welle
    if (this.currentWaveNpcIndex >= npcPerWave) {
      this.isSpawningWave = false;
      // WICHTIG: Resetze den Wellen-Timer, damit die nächste Welle nach dem Interval spawnt
      this.waveSpawnTime = 0;
      console.log(
        `✅ Welle ${this.lastSpawnedWave} vollständig gespawnt (${this.currentWaveNpcIndex}/${npcPerWave})\n`,
      );
      return;
    }

    // Spawne den nächsten NPC
    const customer = this.allCustomersForWaves[this.waveNpcIndex];
    console.log(
      `  📌 [Welle ${this.lastSpawnedWave}] Spawning customer ${this.currentWaveNpcIndex + 1}/${npcPerWave}: ${customer.npc.name}`,
    );

    this.scheduleCustomer(customer.npc, customer.order, this.gameTime, this.lastSpawnedWave);
    this.waveNpcIndex++;
    this.currentWaveNpcIndex++;

    console.log(
      `   ✓ NPC spawned (${this.currentWaveNpcIndex}/${npcPerWave}), isSpawningWave bleibt true`,
    );
  }

  /**
   * Spawne die nächste Welle von NPCs
   */
  /**
   * Spawne die nächste Welle von NPCs
   */
  /**
   * Spawne die nächste Welle von NPCs
   */
  private spawnNextWave() {
    const { npcPerWave } = this.waveSpawnerConfig;
    const delayBetweenNPCsInWave = this.waveSpawnerConfig.delayBetweenNPCsInWave || 0;

    console.log(
      `\n🎬 spawnNextWave() called - waveNpcIndex: ${this.waveNpcIndex}, total: ${this.allCustomersForWaves.length}`,
    );
    console.log(`   Delay: ${delayBetweenNPCsInWave}s`);

    // Wenn es eine Verzögerung gibt, starte den Spawn-Prozess mit Delay
    if (delayBetweenNPCsInWave > 0) {
      this.currentWaveNpcIndex = 0;
      this.waveNpcSpawnTime = 0;
      this.isSpawningWave = true;
      this.lastSpawnedWave++;

      console.log(
        `🌊 Welle ${this.lastSpawnedWave} startet mit ${npcPerWave} NPCs (Delay: ${delayBetweenNPCsInWave}s)`,
      );

      if (this.onWaveStart) {
        this.onWaveStart(this.lastSpawnedWave);
      }

      // Spawne den ersten NPC sofort
      console.log(`   → Spawne ersten NPC sofort...`);
      this.spawnNextNPCInWave();
      return;
    }

    // Wenn KEIN Delay: Spawne alle NPCs auf einmal (altes Verhalten)
    console.log(`🌊 Welle ohne Delay - spawne alle ${npcPerWave} NPCs auf einmal`);

    let spawnedCount = 0;

    for (let i = 0; i < npcPerWave; i++) {
      if (this.waveNpcIndex >= this.allCustomersForWaves.length) {
        this.allWavesSpawned = true;
        console.log(`✅ Alle Wellen wurden gespawnt! (Insgesamt ${this.waveNpcIndex} NPCs)`);
        return;
      }

      const customer = this.allCustomersForWaves[this.waveNpcIndex];
      console.log(
        `  📌 Spawning customer ${this.waveNpcIndex + 1}/${this.allCustomersForWaves.length}: ${customer.npc.name}`,
      );

      this.scheduleCustomer(customer.npc, customer.order, this.gameTime, this.lastSpawnedWave + 1);
      this.waveNpcIndex++;
      spawnedCount++;
    }

    this.lastSpawnedWave++;
    console.log(
      `🌊 Welle ${this.lastSpawnedWave} gespawnt: ${spawnedCount} NPCs (Index: ${this.waveNpcIndex}/${this.allCustomersForWaves.length})\n`,
    );

    if (this.onWaveStart) {
      this.onWaveStart(this.lastSpawnedWave);
    }
  }

  /**
   * Add a customer to the queue with a specific arrival time
   */
  public scheduleCustomer(
    npc: NPC,
    order: CustomerOrder,
    arrivalTime: number,
    waveNumber: number = 0,
  ) {
    // Verstecke den NPC initial
    npc.hidden = true;

    // Hole den Pfad für diese customerId
    const pathConfig = this.npcPathConfigs.get(order.customerId);

    if (pathConfig) {
      console.log(`✅ Pfad gefunden für ${order.customerId} (${npc.name})`);
    } else {
      console.warn(`⚠️  KEIN Pfad für ${order.customerId} (${npc.name})`);
    }

    this.customerQueue.push({
      npc,
      order,
      arrivalTime,
      isActive: false,
      isCompleted: false,
      isGone: false,
      entryPathConfig: pathConfig,
      waveNumber,
    });

    // Sortiere die Queue nach Ankunftszeit
    this.customerQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);

    console.log(
      `📋 NPC scheduled: ${npc.name} (Wave ${waveNumber}, CustomerID: ${order.customerId})`,
    );
  }

  /**
   * Update customer queue based on game time
   */
  public update(deltaTime: number) {
    this.gameTime += deltaTime;

    // Update Wave Spawner - nur wenn noch nicht alle Wellen gespawnt wurden
    if (!this.allWavesSpawned) {
      this.updateWaveSpawner(deltaTime);
    }

    // Prüfe ob NPCs ankommen sollen
    for (const customer of this.customerQueue) {
      if (!customer.isActive && !customer.isCompleted && this.gameTime >= customer.arrivalTime) {
        this.activateCustomer(customer);
      }
    }

    // Prüfe ob Wellen komplett sind (alle NPCs weg)
    this.checkWaveCompletion();

    // Prüfe ob Level komplett ist
    this.checkLevelComplete();
  }

  /**
   * Activate a customer (make them appear)
   */
  private activateCustomer(customer: CustomerQueueEntry) {
    customer.isActive = true;
    customer.npc.hidden = false; // Zeige den NPC

    console.log(`👤 Customer arrived: ${customer.npc.name}`);
    console.log(`📋 Order: ${customer.order.quantity}x ${customer.order.item}`);

    // Trigger visibility change callback um Collisions zu updaten
    if (this.onVisibilityChange) {
      this.onVisibilityChange();
    }

    if (this.onCustomerArrive) {
      this.onCustomerArrive(customer);
    }
  }

  /**
   * Complete an order and give rewards
   * NPC läuft danach den gleichen Weg wieder raus
   */
  public completeOrder(customerId: string): boolean {
    const customer = this.customerQueue.find((c) => c.order.customerId === customerId);

    if (!customer || !customer.isActive || customer.isCompleted) {
      return false;
    }

    customer.isCompleted = true;

    console.log(`✅ Order completed for ${customer.npc.name}`);
    console.log(`💰 Rewards: ${customer.order.reward.coins} coins, ${customer.order.reward.xp} XP`);

    // Lasse den NPC den gleichen Weg rausgehen wie reingekommen
    this.sendNPCHome(customer);

    if (this.onOrderComplete) {
      this.onOrderComplete(customer.order.reward);
    }

    return true;
  }

  /**
   * Lasse den NPC den Rückweg gehen (umgekehrter Pfad)
   */
  private sendNPCHome(customer: CustomerQueueEntry) {
    if (!customer.entryPathConfig) {
      // Kein Pfad konfiguriert - verstecke den NPC sofort
      customer.isGone = true;
      customer.npc.hidden = true;
      if (this.onVisibilityChange) {
        this.onVisibilityChange();
      }
      return;
    }

    // Erstelle den umgekehrten Pfad (Rückweg)
    const entryPath = customer.entryPathConfig;
    const reversedWaypoints = [...entryPath.path].reverse();

    // Setze den Rückweg-Pfad
    const exitPathConfig = {
      enabled: true,
      path: reversedWaypoints,
      speed: entryPath.speed,
      targetPosition: reversedWaypoints[reversedWaypoints.length - 1],
      loop: false,
    };

    console.log(`🚪 NPC ${customer.npc.name} läuft nach Hause...`);
    customer.npc.setPath(exitPathConfig);

    // Nach dem Pfad-Abschluss: Verstecke den NPC
    const pathDuration = this.calculatePathDuration(exitPathConfig);
    setTimeout(() => {
      customer.isGone = true;
      customer.npc.hidden = true;
      if (this.onVisibilityChange) {
        this.onVisibilityChange();
      }
      console.log(`👋 NPC ${customer.npc.name} ist gegangen!`);
    }, pathDuration * 1000);
  }

  /**
   * Berechne die Dauer des Pfades basierend auf Distanz und Geschwindigkeit
   */
  private calculatePathDuration(pathConfig: any): number {
    let totalDistance = 0;

    for (let i = 0; i < pathConfig.path.length - 1; i++) {
      const current = pathConfig.path[i];
      const next = pathConfig.path[i + 1];
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }

    // Dauer = Distanz / Geschwindigkeit
    return totalDistance / pathConfig.speed;
  }

  /**
   * Prüfe ob eine Welle komplett ist (alle NPCs dieser Welle sind weg)
   */
  private checkWaveCompletion() {
    // Gehe alle Wellen-Nummern durch
    const waveNumbers = new Set(
      this.customerQueue.map((c) => c.waveNumber).filter((w) => w !== undefined && w !== 0),
    );

    for (const waveNumber of waveNumbers) {
      // Finde alle NPCs dieser Welle
      const waveCustomers = this.customerQueue.filter((c) => c.waveNumber === waveNumber);

      if (waveCustomers.length === 0) continue;

      // Prüfe ob ALLE NPCs dieser Welle weg sind
      const allGone = waveCustomers.every((c) => c.isGone);

      // Prüfe ob ALLE NPCs dieser Welle ihre Order erhalten haben
      const allCompleted = waveCustomers.every((c) => c.isCompleted);

      if (allGone && allCompleted && waveNumber !== this.currentWave) {
        // Diese Welle ist komplett - speichere dass sie fertig ist
        this.currentWave = waveNumber as number;

        if (this.onWaveComplete) {
          this.onWaveComplete(this.currentWave);
        }

        console.log(`✅ Welle ${this.currentWave} komplett! Alle NPCs sind weg.`);

        // Starte die nächste Welle mit konfigurierbarer Verzögerung
        if (!this.allWavesSpawned && this.waveNpcIndex < this.allCustomersForWaves.length) {
          const delayBetweenWaves = this.waveSpawnerConfig.delayBetweenWaves || 0;

          if (delayBetweenWaves > 0) {
            // Mit Verzögerung: Setze Timer so, dass nach delayBetweenWaves die nächste Welle spawnt
            this.waveSpawnTime = this.waveSpawnerConfig.waveInterval - delayBetweenWaves;
            console.log(`⏭️  Nächste Welle startet in ${delayBetweenWaves}s...`);
          } else {
            // Sofort
            this.waveSpawnTime = this.waveSpawnerConfig.waveInterval;
            console.log(`⏭️  Nächste Welle startet sofort...`);
          }
        }
      }
    }
  }

  /**
   * Check if all customers have been served and are gone
   */
  private checkLevelComplete() {
    // Level ist komplett wenn:
    // 1. Alle Kunden ihre Order erhalten haben (isCompleted = true)
    // 2. Alle NPCs versteckt und weg sind (isGone = true)
    // 3. ALLE Wellen wurden gespawnt
    const allCompleted =
      this.allWavesSpawned &&
      this.customerQueue.length > 0 &&
      this.customerQueue.every((c) => c.isCompleted && c.isGone);

    if (allCompleted && this.onLevelComplete) {
      console.log('🎉 Level complete! All customers served and gone!');
      this.stopWaveSpawner();
      this.onLevelComplete();
    }
  }

  /**
   * Check if level is complete (public method)
   */
  public isLevelComplete(): boolean {
    return (
      this.allWavesSpawned &&
      this.customerQueue.length > 0 &&
      this.customerQueue.every((c) => c.isCompleted && c.isGone)
    );
  }

  /**
   * Get current active customer that player is near
   */
  public getNearbyCustomer(player: Player): CustomerQueueEntry | null {
    for (const customer of this.customerQueue) {
      if (customer.isActive && !customer.isCompleted && !customer.npc.hidden) {
        if (customer.npc.canInteractWith(player.x, player.y, player.width, player.height)) {
          return customer;
        }
      }
    }
    return null;
  }

  /**
   * Get customer by ID
   */
  public getCustomerById(customerId: string): CustomerQueueEntry | undefined {
    return this.customerQueue.find((c) => c.order.customerId === customerId);
  }

  /**
   * Get all customers in queue
   */
  public getQueue(): CustomerQueueEntry[] {
    return this.customerQueue;
  }

  /**
   * Get pending customers (not yet arrived)
   */
  public getPendingCustomers(): CustomerQueueEntry[] {
    return this.customerQueue.filter((c) => !c.isActive && !c.isCompleted);
  }

  /**
   * Get active customers
   */
  public getActiveCustomers(): CustomerQueueEntry[] {
    return this.customerQueue.filter((c) => c.isActive && !c.isCompleted);
  }

  /**
   * Get completed customers
   */
  public getCompletedCustomers(): CustomerQueueEntry[] {
    return this.customerQueue.filter((c) => c.isCompleted);
  }

  /**
   * Get completion progress
   */
  public getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.customerQueue.length;
    const completed = this.getCompletedCustomers().length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }

  /**
   * Clear all customers
   */
  public clear() {
    this.customerQueue = [];
    this.gameTime = 0;
    this.stopWaveSpawner();
    this.currentWave = 0;
    this.lastSpawnedWave = 0;
    this.waveSpawnTime = 0;
    this.waveNpcIndex = 0;
    this.currentWaveNpcIndex = 0;
    this.waveNpcSpawnTime = 0;
    this.isSpawningWave = false;
    this.allCustomersForWaves = [];
    this.allWavesSpawned = false;
    this.npcPathConfigs.clear();
  }

  /**
   * Reset game time
   */
  public resetTime() {
    this.gameTime = 0;
  }

  /**
   * Get current game time
   */
  public getGameTime(): number {
    return this.gameTime;
  }

  /**
   * Render customer interaction prompts
   */
  public renderInteractionPrompts(ctx: CanvasRenderingContext2D, player: Player, inventoryManager: InventoryManager): void {
    // Get all active customers
    const activeCustomers = this.getActiveCustomers();

    activeCustomers.forEach((customer) => {
      const npc = customer.npc;

      // Check if player is near this customer
      if (npc.canInteractWith(player.x, player.y, player.width, player.height)) {
        ctx.save();

        // Check if player has the required items
        const hasItems = inventoryManager.hasItem(customer.order.item, customer.order.quantity);

        // Different text based on whether player can serve or not
        const promptText = hasItems ? 'Press O to serve' : 'Press E to talk';
        const promptX = npc.x + npc.width / 2;
        const promptY = npc.y - 40;

        // Measure text to calculate proper width
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(promptText).width;
        const padding = 20;
        const boxWidth = textWidth + (padding * 2);
        const boxHeight = 28;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(promptX - boxWidth / 2, promptY - 20, boxWidth, boxHeight);

        // Border - green if ready to serve, normal otherwise
        ctx.strokeStyle = hasItems ? 'rgba(144, 238, 144, 1)' : 'rgba(255, 228, 181, 1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(promptX - boxWidth / 2, promptY - 20, boxWidth, boxHeight);

        // Text
        ctx.fillStyle = hasItems ? 'rgba(144, 238, 144, 1)' : 'rgba(255, 228, 181, 1)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(promptText, promptX, promptY - 6);

        ctx.restore();
      }
    });
  }

  /**
   * Get Wave Spawner Status
   */

  /**
   * Get Wave Spawner Status
   */
  public getWaveSpawnerStatus() {
    return {
      enabled: this.waveSpawnerConfig.enabled,
      currentWave: this.currentWave,
      lastSpawnedWave: this.lastSpawnedWave,
      spawnedCount: this.waveNpcIndex,
      totalCount: this.allCustomersForWaves.length,
      waveInterval: this.waveSpawnerConfig.waveInterval,
      npcPerWave: this.waveSpawnerConfig.npcPerWave,
      delayBetweenNPCsInWave: this.waveSpawnerConfig.delayBetweenNPCsInWave,
      allWavesSpawned: this.allWavesSpawned,
    };
  }
}
