import { SaveManager } from '../managers/SaveManager';
import { Colors, Alpha, Fonts, UI } from '../config/theme';

export class PauseMenu {
  private isPaused: boolean = false;
  private selectedOption: number = 0;
  private menuOptions: string[] = ['Resume', 'Save Game', 'Load Game', 'Delete Save'];

  // Feedback messages
  private feedbackMessage: string = '';
  private feedbackTimer: number = 0;
  private readonly FEEDBACK_DURATION = 2; // seconds

  // Button dimensions
  private buttonWidth: number = 300;
  private buttonHeight: number = 60;
  private buttonSpacing: number = 20;

  constructor() {}

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      this.selectedOption = 0;
      this.feedbackMessage = '';
    }
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  public toggle() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.selectedOption = 0;
      this.feedbackMessage = '';
    }
  }

  public update(deltaTime: number) {
    // Update feedback timer
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= deltaTime;
      if (this.feedbackTimer <= 0) {
        this.feedbackMessage = '';
      }
    }
  }

  public moveSelectionUp() {
    if (!this.isPaused) return;
    this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
  }

  public moveSelectionDown() {
    if (!this.isPaused) return;
    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
  }

  public selectOption(): { action: string; close: boolean } {
    if (!this.isPaused) return { action: '', close: false };

    const option = this.menuOptions[this.selectedOption];

    switch (option) {
      case 'Resume':
        return { action: 'resume', close: true };
      case 'Save Game':
        return { action: 'save', close: false };
      case 'Load Game':
        return { action: 'load', close: true };
      case 'Delete Save':
        return { action: 'delete', close: false };
      default:
        return { action: '', close: false };
    }
  }

  public showFeedback(message: string) {
    this.feedbackMessage = message;
    this.feedbackTimer = this.FEEDBACK_DURATION;
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.isPaused) return;

    // Semi-transparent dark overlay
    ctx.fillStyle = Alpha.overlay;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();

    // Draw "PAUSED" title
    ctx.fillStyle = Colors.moccasin;
    ctx.font = `bold ${Fonts.sizes.huge} ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = Alpha.shadowDark;
    ctx.shadowBlur = 10;
    ctx.fillText('PAUSED', canvasWidth / 2, 120);

    // Draw save info if exists
    const saveInfo = SaveManager.getSaveInfo();
    if (saveInfo.exists && saveInfo.timeSince) {
      ctx.font = `18px ${Fonts.body}`;
      ctx.fillStyle = Colors.chocolate;
      ctx.shadowBlur = 5;
      ctx.fillText(`Last save: ${saveInfo.timeSince}`, canvasWidth / 2, 180);
    }

    ctx.shadowBlur = 0;

    // Calculate menu position
    const startY = canvasHeight / 2 - ((this.menuOptions.length * (this.buttonHeight + this.buttonSpacing)) / 2);

    // Draw menu buttons
    this.menuOptions.forEach((option, index) => {
      const y = startY + index * (this.buttonHeight + this.buttonSpacing);
      const x = canvasWidth / 2 - this.buttonWidth / 2;
      const isSelected = index === this.selectedOption;
      const isDisabled = (option === 'Load Game' || option === 'Delete Save') && !saveInfo.exists;

      // Button background
      if (isDisabled) {
        ctx.fillStyle = Alpha.grayDisabled;
      } else if (isSelected) {
        ctx.fillStyle = Colors.chocolate;
      } else {
        ctx.fillStyle = Colors.saddleBrown;
      }
      ctx.fillRect(x, y, this.buttonWidth, this.buttonHeight);

      // Button border
      ctx.strokeStyle = isSelected ? Colors.moccasin : Colors.chocolate;
      ctx.lineWidth = isSelected ? UI.borderWidth.thick : UI.borderWidth.thin;
      ctx.strokeRect(x, y, this.buttonWidth, this.buttonHeight);

      // Button text
      ctx.fillStyle = isDisabled ? Colors.mediumGray : Colors.moccasin;
      ctx.font = isSelected ? `bold ${Fonts.sizes.xlarge} ${Fonts.body}` : `${Fonts.sizes.large} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(option, canvasWidth / 2, y + this.buttonHeight / 2);
    });

    // Draw feedback message
    if (this.feedbackMessage) {
      const feedbackY = startY + this.menuOptions.length * (this.buttonHeight + this.buttonSpacing) + 40;

      // Fade effect based on timer
      const alpha = Math.min(1, this.feedbackTimer / 0.5);
      ctx.fillStyle = `rgba(255, 228, 181, ${alpha})`;
      ctx.font = `bold 22px ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(this.feedbackMessage, canvasWidth / 2, feedbackY);
    }

    // Draw controls hint
    ctx.fillStyle = Colors.lightGray;
    ctx.font = `16px ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.fillText('Use ↑↓ or W/S to navigate, Enter to select, P or ESC to close', canvasWidth / 2, canvasHeight - 40);

    ctx.restore();
  }
}