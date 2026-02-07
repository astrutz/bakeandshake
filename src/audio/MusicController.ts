import { AmbientAudioManager } from './AmbientAudioManager.ts';
import { SoundManager } from './SoundManager.ts';
import { SOUND_IDS } from './SoundId.ts';

export class MusicController {
  private enabled = false;
  private backgroundId: string;

  constructor(
    private ambientManager: AmbientAudioManager,
    private soundManager: SoundManager,
    backgroundId: string = SOUND_IDS.BACKGROUND_COFFEE,
  ) {
    this.backgroundId = backgroundId;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public start() {
    if (this.enabled) return;
    this.enabled = true;
    this.ambientManager.start();
    this.soundManager.playSound(this.backgroundId);
  }

  public stop() {
    if (!this.enabled) return;
    this.enabled = false;
    this.ambientManager.stop();
    this.soundManager.stopSound(this.backgroundId);
  }

  public toggle() {
    if (this.enabled) {
      this.stop();
    } else {
      this.start();
    }
  }
}
