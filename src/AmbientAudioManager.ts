type AmbientAudioManagerOptions = {
    maxVolume?: number;
    fadeDuration?: number;
    pauseMin?: number;
    pauseMax?: number;
};

export class AmbientAudioManager {

    private tracks: HTMLAudioElement[];
    private maxVolume: number;
    private fadeDuration: number;
    private pauseMin: number;
    private pauseMax: number;

    private currentTrack: HTMLAudioElement | null = null;
    private running: boolean = false;


    constructor(
        trackSources: string[],
        options: AmbientAudioManagerOptions = {}
    ) {

        this.tracks = trackSources.map(src => {
            const audio = new Audio(src);
            audio.volume = 0;
            audio.loop = false;
            audio.preload = "auto";
            return audio;
        });

        this.maxVolume = options.maxVolume ?? 0.4;
        this.fadeDuration = options.fadeDuration ?? 3000;
        this.pauseMin = options.pauseMin ?? 3000;
        this.pauseMax = options.pauseMax ?? 8000;
    }


    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    private randomPause(): number {
        return Math.random() * (this.pauseMax - this.pauseMin) + this.pauseMin;
    }


    private getRandomTrack(): HTMLAudioElement {

        if (this.tracks.length === 1)
            return this.tracks[0];

        let next: HTMLAudioElement;

        do {
            next = this.tracks[
                Math.floor(Math.random() * this.tracks.length)
                ];
        }
        while (next === this.currentTrack);

        return next;
    }


    private fadeIn(audio: HTMLAudioElement): Promise<void> {

        return new Promise(resolve => {

            audio.volume = 0;
            audio.currentTime = 0;

            // play returns Promise in modern browsers
            audio.play().catch(() => {});

            const steps = 60;
            const stepTime = this.fadeDuration / steps;
            const volumeStep = this.maxVolume / steps;

            let step = 0;

            const interval = window.setInterval(() => {

                step++;

                audio.volume = Math.min(
                    volumeStep * step,
                    this.maxVolume
                );

                if (step >= steps) {
                    clearInterval(interval);
                    resolve();
                }

            }, stepTime);

        });
    }


    private fadeOut(audio: HTMLAudioElement): Promise<void> {

        return new Promise(resolve => {

            const steps = 60;
            const stepTime = this.fadeDuration / steps;
            const volumeStep = audio.volume / steps;

            let step = 0;

            const interval = window.setInterval(() => {

                step++;

                audio.volume = Math.max(
                    audio.volume - volumeStep,
                    0
                );

                if (step >= steps) {

                    clearInterval(interval);

                    audio.pause();
                    audio.currentTime = 0;

                    resolve();
                }

            }, stepTime);

        });
    }


    public async start(): Promise<void> {

        if (this.running) return;

        this.running = true;

        while (this.running) {

            const track = this.getRandomTrack();
            this.currentTrack = track;

            await this.fadeIn(track);

            const durationMs = track.duration * 1000;

            const playTime = durationMs - this.fadeDuration;

            if (playTime > 0)
                await this.sleep(playTime);

            await this.fadeOut(track);

            await this.sleep(this.randomPause());
        }
    }


    public async stop(): Promise<void> {
        this.running = false;

        if (this.currentTrack)
            await this.fadeOut(this.currentTrack);

        this.currentTrack = null;
    }
}
