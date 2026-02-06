export class CoinManager {
  private coins: number = 0;
  private animationScale: number = 1;
  private targetScale: number = 1;
  private isAnimating: boolean = false;

  constructor(initialCoins: number = 0) {
    this.coins = initialCoins;
  }

  public getCoins(): number {
    return this.coins;
  }

  public setCoins(amount: number) {
    this.coins = Math.max(0, amount);
  }

  public addCoins(amount: number) {
    this.coins += amount;
    this.triggerAnimation();
  }

  public removeCoins(amount: number): boolean {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  public hasEnough(amount: number): boolean {
    return this.coins >= amount;
  }

  private triggerAnimation() {
    this.targetScale = 1.3;
    this.isAnimating = true;
  }

  public update(deltaTime: number) {
    if (this.isAnimating) {
      // Smooth scale animation
      const lerpSpeed = 8;
      this.animationScale += (this.targetScale - this.animationScale) * lerpSpeed * deltaTime;

      // Return to normal
      if (Math.abs(this.targetScale - 1) > 0.01) {
        this.targetScale = 1;
      }

      // Stop animation when close to 1
      if (Math.abs(this.animationScale - 1) < 0.01) {
        this.animationScale = 1;
        this.isAnimating = false;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    ctx.save();

    // Position in top-right corner
    const x = canvasWidth - 20;
    const y = 20;

    // Coin icon background
    const iconSize = 32;
    const padding = 8;
    const textMetrics = ctx.measureText(this.coins.toString());
    const boxWidth = iconSize + padding * 3 + textMetrics.width + 20;
    const boxHeight = iconSize + padding * 2;

    // Background box
    ctx.fillStyle = 'rgba(139, 69, 19, 0.85)'; // Brown with transparency
    ctx.fillRect(x - boxWidth, y, boxWidth, boxHeight);

    // Border
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - boxWidth, y, boxWidth, boxHeight);

    // Apply scale animation
    if (this.isAnimating) {
      ctx.translate(x - boxWidth / 2, y + boxHeight / 2);
      ctx.scale(this.animationScale, this.animationScale);
      ctx.translate(-(x - boxWidth / 2), -(y + boxHeight / 2));
    }

    // Draw coin icon (simple circle for now, can be replaced with sprite)
    const coinX = x - boxWidth + padding + iconSize / 2;
    const coinY = y + boxHeight / 2;

    // Coin outer circle
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.beginPath();
    ctx.arc(coinX, coinY, iconSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Coin inner circle (for depth)
    ctx.fillStyle = '#FFA500'; // Orange
    ctx.beginPath();
    ctx.arc(coinX, coinY, iconSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // Coin symbol
    ctx.fillStyle = '#8B4513'; // Brown
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¢', coinX, coinY);

    // Coin count text
    ctx.fillStyle = '#FFE4B5'; // Moccasin
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.coins.toString(), x - padding, y + boxHeight / 2);

    ctx.restore();
  }
}
