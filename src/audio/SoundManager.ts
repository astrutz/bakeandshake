// audio/SoundManager.ts
type SoundEffectOptions = {
  volume?: number;
  loop?: boolean;
};

export class SoundManager {
  private effects: Map<string, HTMLAudioElement> = new Map();

  public registerSound(id: string, src: string, options: SoundEffectOptions = {}) {
    const audio = new Audio(src);
    audio.volume = options.volume ?? 0.5;
    audio.loop = options.loop ?? false;
    audio.preload = 'auto';
    this.effects.set(id, audio);
  }

  public playSound(id: string): void {
    console.log(`🔊 Sound: ${id}`);
    const audio = this.effects.get(id);
    if (!audio) {
      console.warn(`Sound ${id} nicht gefunden`);
      return;
    }
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  public stopSound(id: string): void {
    const audio = this.effects.get(id);
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  public stopAll(): void {
    this.effects.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }
}
