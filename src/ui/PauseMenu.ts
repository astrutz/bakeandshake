import { SaveManager } from '../managers/SaveManager';
import { Colors, Alpha, Fonts, UI } from '../config/theme';

export class PauseMenu {
  private isPaused: boolean = false;
  private selectedOption: number = 0;
  private menuOptions: string[] = ['Resume', 'Save Game', 'Load Game', 'Delete Save', 'Main Menu'];
  private mainMenuConfirmOpen: boolean = false;
  private confirmSelectedOption: number = 0;
  private confirmOptions: string[] = ['Save and go back to menu', 'Go back to menu'];

  // Feedback messages
  private feedbackMessage: string = '';
  private feedbackTimer: number = 0;
  private readonly FEEDBACK_DURATION = 2; // seconds

  // Button dimensions (scaled for 1024x768)
  private buttonWidth: number = 360;
  private buttonHeight: number = 70;
  private buttonSpacing: number = 24;

  // Player stats (injected from Game)
  private playerLevel: number = 1;
  private playerXP: number = 0;
  private playerCoins: number = 0;

  constructor() {}

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      this.selectedOption = 0;
      this.feedbackMessage = '';
      this.mainMenuConfirmOpen = false;
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
      this.mainMenuConfirmOpen = false;
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
    if (this.mainMenuConfirmOpen) return;
    this.selectedOption =
      (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
  }

  public moveSelectionDown() {
    if (!this.isPaused) return;
    if (this.mainMenuConfirmOpen) return;
    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
  }

  public openMainMenuConfirm() {
    if (!this.isPaused) return;
    this.mainMenuConfirmOpen = true;
    this.confirmSelectedOption = 0;
  }

  public closeMainMenuConfirm() {
    this.mainMenuConfirmOpen = false;
  }

  public isMainMenuConfirmOpen(): boolean {
    return this.mainMenuConfirmOpen;
  }

  public moveConfirmSelectionUp() {
    if (!this.isPaused || !this.mainMenuConfirmOpen) return;
    this.confirmSelectedOption =
      (this.confirmSelectedOption - 1 + this.confirmOptions.length) % this.confirmOptions.length;
  }

  public moveConfirmSelectionDown() {
    if (!this.isPaused || !this.mainMenuConfirmOpen) return;
    this.confirmSelectedOption = (this.confirmSelectedOption + 1) % this.confirmOptions.length;
  }

  public selectOption(): { action: string; close: boolean } {
    if (!this.isPaused) return { action: '', close: false };
    if (this.mainMenuConfirmOpen) return { action: '', close: false };

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
      case 'Main Menu':
        return { action: 'main_menu', close: true };
      default:
        return { action: '', close: false };
    }
  }

  public showFeedback(message: string) {
    this.feedbackMessage = message;
    this.feedbackTimer = this.FEEDBACK_DURATION;
  }

  public selectMainMenuConfirm(): { action: 'save_and_menu' | 'menu_no_save' | ''; close: boolean } {
    if (!this.isPaused || !this.mainMenuConfirmOpen) return { action: '', close: false };
    const option = this.confirmOptions[this.confirmSelectedOption];
    if (option === 'Save and go back to menu') {
      return { action: 'save_and_menu', close: true };
    }
    if (option === 'Go back to menu') {
      return { action: 'menu_no_save', close: true };
    }
    return { action: '', close: false };
  }

  public setPlayerStats(level: number, xp: number, coins: number) {
    this.playerLevel = level;
    this.playerXP = xp;
    this.playerCoins = coins;
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.isPaused) return;

    // Semi-transparent dark overlay
    ctx.fillStyle = Alpha.overlay;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();

    // Draw "PAUSED" title
    ctx.fillStyle = Colors.moccasin;
    ctx.font = `bold ${Fonts.sizes.massive} ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = Alpha.shadowDark;
    ctx.shadowBlur = 10;
    ctx.fillText('PAUSED', canvasWidth / 2, 140);

    // Draw player stats
    const statsY = 220;
    ctx.font = `${Fonts.sizes.medium} ${Fonts.body}`;
    ctx.fillStyle = Colors.wheat;
    ctx.shadowBlur = 5;
    ctx.fillText(
      `Level ${this.playerLevel} • ${this.playerXP} XP • ${this.playerCoins} Coins`,
      canvasWidth / 2,
      statsY,
    );

    // Draw save info if exists
    const saveInfo = SaveManager.getSaveInfo();
    if (saveInfo.exists && saveInfo.timeSince) {
      ctx.font = `${Fonts.sizes.small} ${Fonts.body}`;
      ctx.fillStyle = Colors.chocolate;
      ctx.shadowBlur = 5;
      ctx.fillText(`Last save: ${saveInfo.timeSince}`, canvasWidth / 2, statsY + 35);
    }

    ctx.shadowBlur = 0;

    // Calculate menu position
    const startY =
      canvasHeight / 2 -
      (this.menuOptions.length * (this.buttonHeight + this.buttonSpacing)) / 2 +
      40;

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
      ctx.font = isSelected
        ? `bold ${Fonts.sizes.xlarge} ${Fonts.body}`
        : `${Fonts.sizes.large} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(option, canvasWidth / 2, y + this.buttonHeight / 2);
    });

    // Draw confirm dialog for main menu
    if (this.mainMenuConfirmOpen) {
      const dialogWidth = 520;
      const dialogHeight = 220;
      const dialogX = canvasWidth / 2 - dialogWidth / 2;
      const dialogY = canvasHeight / 2 - dialogHeight / 2;

      ctx.fillStyle = Alpha.brownBoxSolid;
      ctx.strokeStyle = Colors.chocolate;
      ctx.lineWidth = UI.borderWidth.thick;
      ctx.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
      ctx.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);

      ctx.fillStyle = Colors.moccasin;
      ctx.font = `bold ${Fonts.sizes.large} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Return to Main Menu', canvasWidth / 2, dialogY + 42);

      const buttonWidth = dialogWidth - 80;
      const buttonHeight = 50;
      const buttonGap = 14;
      const firstButtonY = dialogY + 88;

      this.confirmOptions.forEach((option, index) => {
        const isSelected = index === this.confirmSelectedOption;
        const x = canvasWidth / 2 - buttonWidth / 2;
        const y = firstButtonY + index * (buttonHeight + buttonGap);

        ctx.fillStyle = isSelected ? Colors.chocolate : Colors.saddleBrown;
        ctx.fillRect(x, y, buttonWidth, buttonHeight);

        ctx.strokeStyle = isSelected ? Colors.moccasin : Colors.chocolate;
        ctx.lineWidth = isSelected ? UI.borderWidth.thick : UI.borderWidth.thin;
        ctx.strokeRect(x, y, buttonWidth, buttonHeight);

        ctx.fillStyle = Colors.moccasin;
        ctx.font = isSelected
          ? `bold ${Fonts.sizes.large} ${Fonts.body}`
          : `${Fonts.sizes.medium} ${Fonts.body}`;
        ctx.fillText(option, canvasWidth / 2, y + buttonHeight / 2);
      });
    }

    // Draw feedback message
    if (this.feedbackMessage) {
      const feedbackY =
        startY + this.menuOptions.length * (this.buttonHeight + this.buttonSpacing) + 48;

      // Fade effect based on timer
      const alpha = Math.min(1, this.feedbackTimer / 0.5);
      ctx.fillStyle = `rgba(255, 228, 181, ${alpha})`;
      ctx.font = `bold ${Fonts.sizes.large} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.feedbackMessage, canvasWidth / 2, feedbackY);
    }

    // Draw controls hint
    ctx.fillStyle = Colors.lightGray;
    ctx.font = `${Fonts.sizes.small} ${Fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Use ↑↓ or W/S to navigate, Enter to select, P or ESC to close',
      canvasWidth / 2,
      canvasHeight - 48,
    );

    ctx.restore();
  }
}
