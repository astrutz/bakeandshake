import { NPC, type NPCConfig } from '../entities/NPC';
import { Player } from '../entities/Player';
import { CollisionSystem } from '../physics/CollisionSystem';

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private nearbyNPC: NPC | null = null;
  private collisionSystem: CollisionSystem | null = null;

  constructor() {}

  public addNPC(config: NPCConfig): NPC {
    const npc = new NPC(config);
    this.npcs.set(config.id, npc);
    return npc;
  }

  public removeNPC(id: string): boolean {
    return this.npcs.delete(id);
  }

  public getNPC(id: string): NPC | undefined {
    return this.npcs.get(id);
  }

  public getAllNPCs(): NPC[] {
    return Array.from(this.npcs.values());
  }

  /**
   * Register NPC collisions with the collision system
   * Store reference for dynamic updates
   */
  public registerCollisions(collisionSystem: CollisionSystem) {
    this.collisionSystem = collisionSystem;
    this.updateCollisions();
  }

  /**
   * Update collision boxes - only add visible NPCs
   * Call this whenever NPC visibility changes
   */
  public updateCollisions() {
    if (!this.collisionSystem) return;

    // Note: This adds collisions on top of existing ones
    // The collision system should be cleared before calling this
    this.npcs.forEach((npc) => {
      // Only add collision for visible NPCs
      if (!npc.hidden) {
        this.collisionSystem!.addCollisionRect(npc.getCollisionBox());
      }
    });
  }

  /**
   * Update NPC states and check for nearby NPCs
   */
  public update(player: Player) {
    this.nearbyNPC = null;

    // Find the closest NPC in range
    let closestDistance = Infinity;

    this.npcs.forEach((npc) => {
      // Skip hidden NPCs
      if (npc.hidden) return;

      if (npc.canInteractWith(player.x, player.y, player.width, player.height)) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const npcCenterX = npc.x + npc.width / 2;
        const npcCenterY = npc.y + npc.height / 2;

        const distance = Math.sqrt(
          Math.pow(playerCenterX - npcCenterX, 2) + Math.pow(playerCenterY - npcCenterY, 2),
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          this.nearbyNPC = npc;
        }
      }
    });
  }

  /**
   * Render all NPCs
   */
  public render(ctx: CanvasRenderingContext2D) {
    this.npcs.forEach((npc) => {
      // Skip hidden NPCs
      if (!npc.hidden) {
        npc.render(ctx);
      }
    });
  }

  /**
   * Render interaction prompts for nearby NPCs
   */
  public renderInteractionPrompts(ctx: CanvasRenderingContext2D, excludeNPCs?: Set<string>) {
    if (this.nearbyNPC && !this.nearbyNPC.hidden) {
      // Skip if this NPC is in the exclude list
      if (excludeNPCs && excludeNPCs.has(this.nearbyNPC.id)) {
        return;
      }
      this.nearbyNPC.renderInteractionPrompt(ctx);
    }
  }

  /**
   * Get the NPC that can be interacted with
   */
  public getNearbyNPC(): NPC | null {
    return this.nearbyNPC;
  }

  /**
   * Check if there's an NPC nearby to interact with
   */
  public hasNearbyNPC(): boolean {
    return this.nearbyNPC !== null;
  }
}