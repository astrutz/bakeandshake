import { Colors, Alpha, UI, Fonts } from '../config/theme';
import { getLevelData, getXPProgressInLevel, getLevelFromXP } from '../data/levels';

export class XPManager {
  private currentXP: number = 0;
  private currentLevel: number = 1;

  // Animation
  private barFillProgress: number = 0;
  private targetFillProgress: number = 0;
  private isAnimating: boolean = false;

  // Level up animation
  private levelUpAnimationTimer: number = 0;
  private readonly LEVEL_UP_DURATION = 1; // seconds

  // Reward callback
  private onLevelUp?: (level: number, rewards?: { coins?: number; unlocks?: string[] }) => void;

  constructor(
    initialXP: number = 0,
    initialLevel: number = 1,
    onLevelUp?: (level: number, rewards?: { coins?: number; unlocks?: string[] }) => void,
  ) {
    this.currentXP = initialXP;
    this.currentLevel = initialLevel;
    this.onLevelUp = onLevelUp;
    this.updateBarProgress();
  }

  public getCurrentXP(): number {
    return this.currentXP;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public getXPProgress(): number {
    return getXPProgressInLevel(this.currentXP, this.currentLevel);
  }

  /**
   * Add XP and check for level ups
   */
  public addXP(amount: number): boolean {
    this.currentXP += amount;
    this.updateBarProgress();

    let leveledUp = false;
    const previousLevel = this.currentLevel;

    // Recalculate level from total XP
    const newLevel = getLevelFromXP(this.currentXP);

    if (newLevel > previousLevel) {
      this.currentLevel = newLevel;
      this.levelUp();
      leveledUp = true;
    }

    this.isAnimating = true;
    return leveledUp;
  }

  private levelUp() {
    this.levelUpAnimationTimer = this.LEVEL_UP_DURATION;
    this.updateBarProgress();

    const levelData = getLevelData(this.currentLevel);
    console.log(`🎉 Level up! Now level ${this.currentLevel}`);

    if (levelData?.rewards) {
      console.log('Rewards:', levelData.rewards);
    }

    // Call reward callback if provided
    if (this.onLevelUp && levelData) {
      this.onLevelUp(this.currentLevel, levelData.rewards);
    }
  }

  private updateBarProgress() {
    this.targetFillProgress = this.getXPProgress();
  }

  public setXP(xp: number, level: number) {
    this.currentXP = xp;
    this.currentLevel = level;
    this.updateBarProgress();
    this.barFillProgress = this.targetFillProgress;
  }

  public update(deltaTime: number) {
    // Animate XP bar fill
    if (this.isAnimating) {
      const lerpSpeed = 3;
      this.barFillProgress +=
        (this.targetFillProgress - this.barFillProgress) * lerpSpeed * deltaTime;

      // Stop animating when close to target
      if (Math.abs(this.barFillProgress - this.targetFillProgress) < 0.01) {
        this.barFillProgress = this.targetFillProgress;
        this.isAnimating = false;
      }
    }

    // Update level up animation timer
    if (this.levelUpAnimationTimer > 0) {
      this.levelUpAnimationTimer -= deltaTime;
    }
  }

  public render(ctx: CanvasRenderingContext2D, canvasHeight: number, gameLevel: number) {
    ctx.save();

    // Position at bottom-left corner
    const x = 24;
    const barWidth = 300;
    const barHeight = 24;
    const labelGap = 10;
    const padding = 4;
    const labelHeight = barHeight;
    const y = canvasHeight - 24 - labelHeight - labelGap;

    // Level indicator (badge to the left of bar)
    const badgeSize = 48;
    const badgeX = x - badgeSize - 12;
    const badgeY = y - barHeight / 2;

    // Level label above the XP bar
    const levelLabel = `Level ${gameLevel}`;
    ctx.font = `bold ${Fonts.sizes.large} ${Fonts.body}`;
    const labelWidth = barWidth;
    const labelX = x;
    const labelY = y + labelGap;

    // Level up animation (glow effect)
    if (this.levelUpAnimationTimer > 0) {
      const glowAlpha = this.levelUpAnimationTimer / this.LEVEL_UP_DURATION;
      ctx.shadowColor = `rgba(255, 215, 0, ${glowAlpha})`;
      ctx.shadowBlur = 20;
    }

    // Badge background
    ctx.fillStyle = Colors.chocolate;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = Colors.gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeSize / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Level number
    ctx.fillStyle = Colors.moccasin;
    ctx.font = `bold ${Fonts.sizes.large} ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.currentLevel.toString(), badgeX, badgeY);

    // "LVL" text above number
    ctx.fillStyle = Colors.wheat;
    ctx.font = `${Fonts.sizes.tiny} ${Fonts.body}`;
    ctx.fillText('LVL', badgeX, badgeY - 18);

    // Level label box
    ctx.fillStyle = Alpha.brownBox;
    ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
    ctx.strokeStyle = Colors.chocolate;
    ctx.lineWidth = UI.borderWidth.thin;
    ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

    ctx.fillStyle = Colors.moccasin;
    ctx.strokeStyle = Colors.saddleBrown;
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelCenterX = labelX + labelWidth / 2;
    const labelCenterY = labelY + labelHeight / 2;
    ctx.strokeText(levelLabel, labelCenterX, labelCenterY);
    ctx.fillText(levelLabel, labelCenterX, labelCenterY);

    // XP bar background
    ctx.fillStyle = Alpha.brownBox;
    ctx.fillRect(x, y - barHeight, barWidth, barHeight);

    // Border
    ctx.strokeStyle = Colors.chocolate;
    ctx.lineWidth = UI.borderWidth.thin;
    ctx.strokeRect(x, y - barHeight, barWidth, barHeight);

    // XP bar fill (progress) - behind the text
    const fillWidth = Math.min(
      barWidth - padding * 2,
      (barWidth - padding * 2) * this.barFillProgress,
    );
    const gradient = ctx.createLinearGradient(x + padding, 0, x + padding + fillWidth, 0);
    gradient.addColorStop(0, Colors.gold);
    gradient.addColorStop(1, Colors.darkGold);

    ctx.fillStyle = gradient;
    ctx.fillRect(x + padding, y - barHeight + padding, fillWidth, barHeight - padding * 2);

    // XP text - rendered on top of the bar
    const currentLevelData = getLevelData(this.currentLevel);
    const nextLevelData = getLevelData(this.currentLevel + 1);

    if (currentLevelData && nextLevelData) {
      const xpInCurrentLevel = this.currentXP - currentLevelData.xpRequired;
      const xpNeededForLevel = nextLevelData.xpRequired - currentLevelData.xpRequired;

      ctx.fillStyle = Colors.white;
      ctx.font = `bold ${Fonts.sizes.small} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = Alpha.shadowDark;
      ctx.shadowBlur = 4;
      ctx.fillText(
        `${xpInCurrentLevel} / ${xpNeededForLevel} XP`,
        x + barWidth / 2,
        y - barHeight / 2,
      );
      ctx.shadowBlur = 0;
    }

    // Level up notification
    if (this.levelUpAnimationTimer > 0) {
      const notifyY = y - barHeight - 40;
      const alpha = Math.min(1, this.levelUpAnimationTimer / 0.5);

      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.font = `bold ${Fonts.sizes.xlarge} ${Fonts.body}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = Alpha.shadowDark;
      ctx.shadowBlur = 5;
      ctx.fillText('LEVEL UP!', x, notifyY);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }
}
