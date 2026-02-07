import { Colors, Fonts } from '../config/theme';

export interface LevelStats {
  level: number;
  timeElapsed: number;
  coinsEarned: number;
  customersServed: number;
  currentXP: number;
  currentLevel: number;
}

export class LevelCompleteScreen {
  private isVisible: boolean = false;
  private stats: LevelStats | null = null;
  private selectedOption: number = 0;
  private options: string[] = ['Continue', 'Main Menu'];

  // Animation
  private animationTime: number = 0;
  private readonly SLIDE_DURATION = 0.3; // seconds

  constructor() {}

  public show(stats: LevelStats) {
    this.isVisible = true;
    this.stats = stats;
    this.selectedOption = 0;
    this.animationTime = 0;
  }

  public hide() {
    this.isVisible = false;
    this.stats = null;
    this.animationTime = 0;
  }

  public isVisibleState(): boolean {
    return this.isVisible;
  }

  public update(deltaTime: number) {
    if (this.isVisible && this.animationTime < this.SLIDE_DURATION) {
      this.animationTime += deltaTime;
    }
  }

  public moveSelectionUp() {
    this.selectedOption = (this.selectedOption - 1 + this.options.length) % this.options.length;
  }

  public moveSelectionDown() {
    this.selectedOption = (this.selectedOption + 1) % this.options.length;
  }

  public getSelectedOption(): 'continue' | 'menu' {
    return this.selectedOption === 0 ? 'continue' : 'menu';
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.isVisible || !this.stats) return;

    // Calculate animation progress (0 to 1)
    const progress = Math.min(this.animationTime / this.SLIDE_DURATION, 1);
    const easeProgress = this.easeOutCubic(progress);

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Panel dimensions
    const panelWidth = 600;
    const panelHeight = 600;
    const panelX = (canvasWidth - panelWidth) / 2;
    const panelY = canvasHeight * (1 - easeProgress) - panelHeight / 2 + canvasHeight / 2;

    // Draw panel background
    ctx.fillStyle = Colors.wheat;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Draw panel border
    ctx.strokeStyle = Colors.gold;
    ctx.lineWidth = 4;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Draw decorative inner border
    ctx.strokeStyle = Colors.darkGold;
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 10, panelY + 10, panelWidth - 20, panelHeight - 20);

    ctx.save();
    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = Colors.chocolate;
    ctx.font = `bold 48px ${Fonts.body}`;
    ctx.fillText('🎉 Level Complete! 🎉', canvasWidth / 2, panelY + 70);

    // Stats section
    const statsY = panelY + 140;
    const lineHeight = 45;

    ctx.font = `${Fonts.sizes.medium} ${Fonts.body}`;
    ctx.fillStyle = Colors.black;

    // Level number
    ctx.fillText(`Level ${this.stats.level}`, canvasWidth / 2, statsY);

    // Time
    const minutes = Math.floor(this.stats.timeElapsed / 60);
    const seconds = Math.floor(this.stats.timeElapsed % 60);
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    ctx.fillText(`⏱️ Time: ${timeStr}`, canvasWidth / 2, statsY + lineHeight);

    // Customers served
    ctx.fillText(
      `👥 Customers Served: ${this.stats.customersServed}`,
      canvasWidth / 2,
      statsY + lineHeight * 2,
    );

    // Coins earned
    ctx.fillStyle = Colors.black;
    ctx.fillText(
      `💰 Coins Earned: ${this.stats.coinsEarned}`,
      canvasWidth / 2,
      statsY + lineHeight * 3,
    );

    // Player level
    ctx.fillStyle = Colors.black;
    ctx.fillText(
      `⭐ Player Level: ${this.stats.currentLevel}`,
      canvasWidth / 2,
      statsY + lineHeight * 4,
    );

    // Options
    const optionsY = panelY + panelHeight - 120;
    ctx.font = `${Fonts.sizes.medium} ${Fonts.body}`;

    this.options.forEach((option, index) => {
      const isSelected = index === this.selectedOption;
      const optionY = optionsY + index * 50;

      if (isSelected) {
        // Selected text
        ctx.fillStyle = Colors.black;
        ctx.fillText(`▶ ${option} ◀`, canvasWidth / 2, optionY);
      } else {
        // Unselected text
        ctx.fillStyle = Colors.black;
        ctx.fillText(option, canvasWidth / 2, optionY);
      }
    });

    ctx.restore();
  }

  /**
   * Easing function for smooth animation
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
}