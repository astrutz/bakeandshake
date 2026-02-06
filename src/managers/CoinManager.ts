import { Colors, Alpha, UI } from '../config/theme';

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
    const padding = UI.padding.small;
    const textMetrics = ctx.measureText(this.coins.toString());
    const boxWidth = iconSize + padding * 3 + textMetrics.width + 20;
    const boxHeight = iconSize + padding * 2;

    // Background box
    ctx.fillStyle = Alpha.brownBox;
    ctx.fillRect(x - boxWidth, y, boxWidth, boxHeight);

    // Border
    ctx.strokeStyle = Colors.chocolate;
    ctx.lineWidth = UI.borderWidth.thin;
    ctx.strokeRect(x - boxWidth, y, boxWidth, boxHeight);

    // Apply scale animation
    if (this.isAnimating) {
      ctx.translate(x - boxWidth / 2, y + boxHeight / 2);
      ctx.scale(this.animationScale, this.animationScale);
      ctx.translate(-(x - boxWidth / 2), -(y + boxHeight / 2));
    }

    // Draw coin icon
    const coinX = x - boxWidth + padding + iconSize / 2;
    const coinY = y + boxHeight / 2;

    // Coin outer circle
    ctx.fillStyle = Colors.gold;
    ctx.beginPath();
    ctx.arc(coinX, coinY, iconSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Coin inner circle (for depth)
    ctx.fillStyle = Colors.darkGold;
    ctx.beginPath();
    ctx.arc(coinX, coinY, iconSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // Coin symbol
    ctx.fillStyle = Colors.saddleBrown;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¢', coinX, coinY);

    // Coin count text
    ctx.fillStyle = Colors.moccasin;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.coins.toString(), x - padding, y + boxHeight / 2);

    ctx.restore();
  }
}