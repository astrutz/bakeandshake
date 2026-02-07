import { Colors, Alpha, UI, Fonts } from '../config/theme';

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

  public getHudBoxRect(ctx: CanvasRenderingContext2D, canvasWidth: number) {
    const metrics = this.getHudMetrics(ctx, canvasWidth);
    return {
      x: metrics.right - metrics.width,
      y: metrics.top,
      width: metrics.width,
      height: metrics.height,
    };
  }

  public renderAtRight(ctx: CanvasRenderingContext2D, rightEdge: number) {
    ctx.save();
    const { right, top, width, height, iconSize, padding } = this.getHudMetricsAtRight(
      ctx,
      rightEdge,
    );
    this.renderWithMetrics(ctx, { right, top, width, height, iconSize, padding });
    ctx.restore();
  }

  private renderWithMetrics(
    ctx: CanvasRenderingContext2D,
    metrics: {
      right: number;
      top: number;
      width: number;
      height: number;
      iconSize: number;
      padding: number;
    },
  ) {
    const { right, top, width, height, iconSize, padding } = metrics;

    // Background box
    ctx.fillStyle = Alpha.brownBox;
    ctx.fillRect(right - width, top, width, height);

    // Border
    ctx.strokeStyle = Colors.chocolate;
    ctx.lineWidth = UI.borderWidth.thin;
    ctx.strokeRect(right - width, top, width, height);

    // Apply scale animation
    if (this.isAnimating) {
      ctx.translate(right - width / 2, top + height / 2);
      ctx.scale(this.animationScale, this.animationScale);
      ctx.translate(-(right - width / 2), -(top + height / 2));
    }

    // Draw coin icon
    const coinX = right - width + padding + iconSize / 2;
    const coinY = top + height / 2;

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
    ctx.font = `bold 20px ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¢', coinX, coinY);

    // Coin count text
    ctx.fillStyle = Colors.moccasin;
    ctx.font = `bold 28px ${Fonts.body}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.coins.toString(), right - padding, top + height / 2);
  }

  private getHudMetrics(ctx: CanvasRenderingContext2D, canvasWidth: number) {
    // Position in top-right corner
    const right = canvasWidth - 24;
    const top = 24;

    // Coin icon background (scaled)
    const iconSize = 36;
    const padding = UI.padding.small;

    // Measure text for proper box sizing
    ctx.font = `bold 28px ${Fonts.body}`;
    const textMetrics = ctx.measureText(this.coins.toString());
    const width = iconSize + padding * 3 + textMetrics.width + 24;
    const height = iconSize + padding * 2;

    return { right, top, width, height, iconSize, padding };
  }

  private getHudMetricsAtRight(ctx: CanvasRenderingContext2D, rightEdge: number) {
    // Position in top-right corner
    const right = rightEdge;
    const top = 24;

    // Coin icon background (scaled)
    const iconSize = 36;
    const padding = UI.padding.small;

    // Measure text for proper box sizing
    ctx.font = `bold 28px ${Fonts.body}`;
    const textMetrics = ctx.measureText(this.coins.toString());
    const width = iconSize + padding * 3 + textMetrics.width + 24;
    const height = iconSize + padding * 2;

    return { right, top, width, height, iconSize, padding };
  }
}
