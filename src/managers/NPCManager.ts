import { NPC, type NPCConfig, type NPCPathConfig } from '../entities/NPC';
import { Player } from '../entities/Player';
import { CollisionSystem } from '../physics/CollisionSystem';

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private nearbyNPC: NPC | null = null;
  private collisionSystem: CollisionSystem | null = null;
  private debugPathsEnabled: boolean = true;

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
   * Setze einen Pfad für einen NPC
   */
  public setNPCPath(npcId: string, pathConfig: NPCPathConfig) {
    const npc = this.npcs.get(npcId);
    if (npc) {
      npc.setPath(pathConfig);
    } else {
      console.warn(`NPC mit ID ${npcId} nicht gefunden!`);
    }
  }

  /**
   * Aktiviere oder deaktiviere Debug Pfad-Anzeige
   */
  public setDebugPaths(enabled: boolean) {
    this.debugPathsEnabled = enabled;
  }

  /**
   * Register NPC collisions with the collision system
   */
  public registerCollisions(collisionSystem: CollisionSystem) {
    this.collisionSystem = collisionSystem;
    this.updateCollisions();
  }

  /**
   * Update collision boxes - only add visible NPCs
   */
  public updateCollisions() {
    if (!this.collisionSystem) return;

    this.npcs.forEach((npc) => {
      if (!npc.hidden) {
        this.collisionSystem!.addCollisionRect(npc.getCollisionBox());
      }
    });
  }

  /**
   * Update NPC states and check for nearby NPCs
   */
  public update(player: Player, deltaTime: number) {
    this.nearbyNPC = null;

    // Update alle NPCs (einschließlich Pfad-Bewegung)
    this.npcs.forEach((npc) => {
      npc.updatePath(deltaTime);

      if (npc.hidden) return;

      if (npc.canInteractWith(player.x, player.y, player.width, player.height)) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const npcCenterX = npc.x + npc.width / 2;
        const npcCenterY = npc.y + npc.height / 2;

        const distance = Math.sqrt(
          Math.pow(playerCenterX - npcCenterX, 2) + Math.pow(playerCenterY - npcCenterY, 2),
        );

        if (!this.nearbyNPC || distance < this.getDistance(this.nearbyNPC, player)) {
          this.nearbyNPC = npc;
        }
      }
    });
  }

  /**
   * Hilfsmethode zur Distanzberechnung
   */
  private getDistance(npc: NPC, player: Player): number {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const npcCenterX = npc.x + npc.width / 2;
    const npcCenterY = npc.y + npc.height / 2;

    return Math.sqrt(
      Math.pow(playerCenterX - npcCenterX, 2) + Math.pow(playerCenterY - npcCenterY, 2),
    );
  }

  /**
   * Render all NPCs
   */
  public render(ctx: CanvasRenderingContext2D) {
    this.npcs.forEach((npc) => {
      if (!npc.hidden) {
        if (this.debugPathsEnabled) {
          npc.renderPath(ctx);
        }
        npc.render(ctx);
      }
    });
  }

  /**
   * Render interaction prompts for nearby NPCs
   */
  public renderInteractionPrompts(ctx: CanvasRenderingContext2D) {
    if (this.nearbyNPC && !this.nearbyNPC.hidden) {
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
