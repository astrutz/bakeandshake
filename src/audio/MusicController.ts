import { AmbientAudioManager } from './AmbientAudioManager.ts';
import { SoundManager } from './SoundManager.ts';
import { SOUND_IDS } from './SoundId.ts';

export class MusicController {
  private muted = true;
  private backgroundId: string;

  constructor(
    private ambientManager: AmbientAudioManager,
    private soundManager: SoundManager,
    backgroundId: string = SOUND_IDS.BACKGROUND_COFFEE,
  ) {
    this.backgroundId = backgroundId;
    this.soundManager.setMuted(true);
  }

  public isEnabled(): boolean {
    return !this.muted;
  }

  public unmuteAll() {
    if (!this.muted) return;
    this.muted = false;
    this.soundManager.setMuted(false);
    this.ambientManager.start();
    this.soundManager.playSound(this.backgroundId);
  }

  public muteAll() {
    if (this.muted) return;
    this.muted = true;
    this.ambientManager.stop();
    this.soundManager.stopAll();
    this.soundManager.setMuted(true);
  }

  public toggle() {
    if (this.muted) {
      this.unmuteAll();
    } else {
      this.muteAll();
    }
  }
}
