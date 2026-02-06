export class PauseOverlay {
  private isPaused: boolean = false;

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  public toggle() {
    this.isPaused = !this.isPaused;
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.isPaused) return;

    // Semi-transparent dark overlay over entire screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw "PAUSED" text in center
    ctx.save();

    // Large centered text
    ctx.fillStyle = '#FFE4B5';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fillText('PAUSED', canvasWidth / 2, canvasHeight / 2);

    // Subtitle text
    ctx.fillStyle = '#D2691E';
    ctx.font = '24px Arial';
    ctx.shadowBlur = 5;
    ctx.fillText('Press P to resume', canvasWidth / 2, canvasHeight / 2 + 60);

    ctx.restore();

    // Small "PAUSED" indicator in top-right corner (always visible when paused)
    ctx.save();
    ctx.fillStyle = 'rgba(139, 69, 19, 0.9)'; // Brown background
    ctx.fillRect(canvasWidth - 120, 10, 110, 40);

    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvasWidth - 120, 10, 110, 40);

    ctx.fillStyle = '#FFE4B5';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', canvasWidth - 65, 30);
    ctx.restore();
  }
}