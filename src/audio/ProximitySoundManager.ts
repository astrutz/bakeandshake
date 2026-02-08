import type { SoundManager } from './SoundManager.ts';
import type { DebugRenderer } from '../utils/DebugRenderer.ts';

export interface ProximitySoundManager {
  id: string;
  x: number;
  y: number;
  soundId: string;
  proximityRadius: number;
  maxDistance: number;
  volume: number;
  isLooping: boolean;
  fadeInDistance?: number; // Distance at which sound starts fading in
  minVolume?: number; // Volume at max distance (default 0)
  debugColor?: string;
}

export class ProximitySoundManager {
  private soundSources: Map<string, ProximitySoundManager> = new Map();
  private activeSounds: Map<string, HTMLAudioElement> = new Map();
  private readonly soundManager: SoundManager;

  constructor(soundManager: SoundManager) {
    this.soundManager = soundManager;
  }

  /**
   * Register a proximity sound source (e.g., cat, oven)
   */
  public registerProximitySource(source: ProximitySoundManager): void {
    this.soundSources.set(source.id, source);
  }

  /**
   * Update proximity sounds based on player position
   */
  public update(playerX: number, playerY: number): void {
    const playerCenterX = playerX + 16; // Assuming 32px player width/2
    const playerCenterY = playerY + 16;

    this.soundSources.forEach((source) => {
      const sourceCenterX = source.x + 16;
      const sourceCenterY = source.y + 16;

      // Calculate distance from player to source
      const distance = Math.sqrt(
        Math.pow(playerCenterX - sourceCenterX, 2) + Math.pow(playerCenterY - sourceCenterY, 2),
      );

      // Check if player is within proximity radius
      if (distance <= source.proximityRadius) {
        this.activateProximitySound(source, distance);
      } else {
        this.deactivateProximitySound(source.id);
      }
    });
  }

  /**
   * Activate/update a proximity sound based on distance
   */
  private activateProximitySound(source: ProximitySoundManager, distance: number): void {
    // 1. Früher Abbruch, falls kein Sound-Manager vorhanden ist
    if (!this.soundManager) return;

    let audio = this.activeSounds.get(source.id);

    // Initialisierung optimieren
    if (!audio) {
      audio = this.soundManager.getSoundEffect(source.id);
      if (!audio) return; // Falls Sound-Datei nicht existiert

      audio.currentTime = 0;
      audio.loop = !!source.isLooping;
      this.activeSounds.set(source.id, audio);
      console.log(`🔊 Proximity sound activated: ${source.id}`);
    }

    // 2. Lautstärke-Logik vereinfachen (Clamping & Linear Interpolation)
    const { volume: maxVol, proximityRadius: radius, minVolume = 0 } = source;
    const fadeInDist = source.fadeInDistance ?? radius;
    const innerCore = 50;

    let targetVolume: number;

    if (distance <= innerCore) {
      targetVolume = maxVol;
    } else if (distance >= radius) {
      targetVolume = minVolume;
    } else {
      // Lineare Skalierung zwischen innerCore und radius
      // Formel: 1 - ((aktuelleDist - min) / (max - min))
      const factor = 1 - (distance - innerCore) / (radius - innerCore);
      targetVolume = minVolume + (maxVol - minVolume) * factor;
    }

    // 3. Performance: Nur aktualisieren, wenn sich der Wert signifikant ändert
    const finalVolume = Math.max(0, Math.min(1, targetVolume));
    if (Math.abs(audio.volume - finalVolume) > 0.01) {
      audio.volume = finalVolume;
    }

    // 4. Play-Logik mit State-Check
    if (audio.paused && finalVolume > 0) {
      audio.play().catch((err) => {
        // Verhindert Konsolen-Spam bei schnellen Bewegungen
        if (err.name !== 'AbortError') {
          console.warn(`Playback failed for ${source.id}:`, err);
        }
      });
    } else if (!audio.paused && finalVolume <= 0 && !source.isLooping) {
      // Optional: Sound pausieren, wenn er unhörbar ist (spart CPU)
      audio.pause();
    }
  }

  /**
   * Deactivate a proximity sound
   */
  private deactivateProximitySound(sourceId: string): void {
    const audio = this.activeSounds.get(sourceId);
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      this.activeSounds.delete(sourceId);
      console.log(`🔇 Proximity sound deactivated: ${sourceId}`);
    }
  }

  /**
   * Stop all proximity sounds
   */
  public stopAll(): void {
    this.activeSounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeSounds.clear();
  }

  /**
   * Update source position (useful if sound sources move)
   */
  public updateSourcePosition(sourceId: string, x: number, y: number): void {
    const source = this.soundSources.get(sourceId);
    if (source) {
      source.x = x;
      source.y = y;
    }
  }

  public get getSoundSources(): Map<string, ProximitySoundManager> {
    return this.soundSources;
  }
}
