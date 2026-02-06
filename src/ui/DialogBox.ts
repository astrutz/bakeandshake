export class DialogBox {
  private isVisible: boolean = false;
  private fullText: string = '';
  private displayedText: string = '';
  private currentCharIndex: number = 0;
  private charSpeed: number = 0.05; // seconds per character
  private timeSinceLastChar: number = 0;
  private isComplete: boolean = false;

  // Box styling
  private padding: number = 20;
  private boxHeight: number = 150;
  private borderWidth: number = 4;

  // Colors
  private bgColor: string = '#8B4513'; // Saddle brown
  private borderColor: string = '#D2691E'; // Chocolate
  private textColor: string = '#FFE4B5'; // Moccasin
  private shadowColor: string = 'rgba(0, 0, 0, 0.5)';

  public show(text: string) {
    this.isVisible = true;
    this.fullText = text;
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.timeSinceLastChar = 0;
    this.isComplete = false;
  }

  public hide() {
    this.isVisible = false;
    this.fullText = '';
    this.displayedText = '';
    this.currentCharIndex = 0;
    this.isComplete = false;
  }

  public toggle(text?: string) {
    if (this.isVisible) {
      this.hide();
    } else if (text) {
      this.show(text);
    }
  }

  public update(deltaTime: number) {
    if (!this.isVisible || this.isComplete) return;

    this.timeSinceLastChar += deltaTime;

    // Add characters over time
    if (this.timeSinceLastChar >= this.charSpeed && this.currentCharIndex < this.fullText.length) {
      this.displayedText += this.fullText[this.currentCharIndex];
      this.currentCharIndex++;
      this.timeSinceLastChar = 0;

      // Check if complete
      if (this.currentCharIndex >= this.fullText.length) {
        this.isComplete = true;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    if (!this.isVisible) return;

    const boxX = this.padding;
    const boxY = canvasHeight - this.boxHeight - this.padding;
    const boxWidth = canvasWidth - this.padding * 2;

    // Draw shadow
    ctx.fillStyle = this.shadowColor;
    ctx.fillRect(boxX + 6, boxY + 6, boxWidth, this.boxHeight);

    // Draw border
    ctx.fillStyle = this.borderColor;
    ctx.fillRect(boxX, boxY, boxWidth, this.boxHeight);

    // Draw background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(
      boxX + this.borderWidth,
      boxY + this.borderWidth,
      boxWidth - this.borderWidth * 2,
      this.boxHeight - this.borderWidth * 2,
    );

    // Draw text
    ctx.fillStyle = this.textColor;
    ctx.font = '20px "Courier New", monospace';
    ctx.textBaseline = 'top';

    // Word wrap the text
    const maxWidth = boxWidth - this.padding * 2 - this.borderWidth * 2;
    const lines = this.wrapText(ctx, this.displayedText, maxWidth);

    const lineHeight = 28;
    const textX = boxX + this.padding + this.borderWidth;
    const textY = boxY + this.padding + this.borderWidth;

    lines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * lineHeight);
    });

    // Draw blinking cursor if still typing
    if (!this.isComplete) {
      const lastLine = lines[lines.length - 1] || '';
      const cursorX = textX + ctx.measureText(lastLine).width + 4;
      const cursorY = textY + (lines.length - 1) * lineHeight;

      // Blink effect
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = this.textColor;
        ctx.fillRect(cursorX, cursorY, 12, 20);
      }
    }
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  public skip() {
    if (this.isVisible && !this.isComplete) {
      this.displayedText = this.fullText;
      this.currentCharIndex = this.fullText.length;
      this.isComplete = true;
    }
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public getIsComplete(): boolean {
    return this.isComplete;
  }
}
