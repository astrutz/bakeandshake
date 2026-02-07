import { NPC, type NPCConfig } from '../entities/NPC';
import { Player } from '../entities/Player';
import { CollisionSystem } from '../physics/CollisionSystem';

export class NPCManager {
  private npcs: Map<string, NPC> = new Map();
  private nearbyNPC: NPC | null = null;

  public addNPC(config: NPCConfig): NPC {
    const npc = new NPC(config);
    this.npcs.set(config.id, npc);
    console.log(`Added NPC: ${config.name} (${config.id})`);
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

  public hideNPC(id: string) {
    const npc = this.npcs.get(id);
    if (npc) {
      (npc as NPC).hidden = true;
    }
  }

  public showNPC(id: string) {
    const npc = this.npcs.get(id);
    if (npc) {
      (npc as NPC).hidden = false;
    }
  }

  public update(player: Player) {
    // Check for nearby NPCs
    this.nearbyNPC = null;

    for (const npc of this.npcs.values()) {
      // Skip hidden NPCs
      if ((npc as NPC).hidden) continue;

      if (npc.canInteractWith(player.x, player.y, player.width, player.height)) {
        this.nearbyNPC = npc;
        break; // Only one nearby NPC at a time
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const npc of this.npcs.values()) {
      // Skip hidden NPCs
      if ((npc as NPC).hidden) continue;
      npc.render(ctx);
    }
  }

  public renderInteractionPrompts(ctx: CanvasRenderingContext2D) {
    if (this.nearbyNPC && !(this.nearbyNPC as any).hidden) {
      this.nearbyNPC.renderInteractionPrompt(ctx);
    }
  }

  public getNearbyNPC(): NPC | null {
    return this.nearbyNPC;
  }

  public registerCollisions(collisionSystem: CollisionSystem) {
    for (const npc of this.npcs.values()) {
      // Skip hidden NPCs for collisions too
      if ((npc as NPC).hidden) continue;
      const box = npc.getCollisionBox();
      collisionSystem.addCollisionRect({x: box.x, y: box.y, width: box.width, height: box.height});
    }
  }
}