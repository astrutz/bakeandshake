import { Alpha, Colors, UI } from '../config/theme';

type ButtonBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export class MusicToggleButton {
  private bounds: ButtonBounds = { x: 0, y: 0, width: 0, height: 0 };

  constructor(
    private isEnabled: () => boolean,
    private onToggle: () => void,
  ) {}

  public static getDefaultSize(): number {
    return 36 + UI.padding.small * 2;
  }

  public setBounds(bounds: ButtonBounds) {
    this.bounds = bounds;
  }

  public hitTest(x: number, y: number): boolean {
    return (
      x >= this.bounds.x &&
      x <= this.bounds.x + this.bounds.width &&
      y >= this.bounds.y &&
      y <= this.bounds.y + this.bounds.height
    );
  }

  public handleClick(x: number, y: number): boolean {
    if (!this.hitTest(x, y)) return false;
    this.onToggle();
    return true;
  }

  public render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.bounds;
    if (width <= 0 || height <= 0) return;

    ctx.save();
    ctx.fillStyle = Alpha.brownBox;
    ctx.strokeStyle = Colors.chocolate;
    ctx.lineWidth = UI.borderWidth.thin;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);

    const iconSize = Math.min(width, height) * 0.5;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = Colors.moccasin;
    ctx.fillStyle = Colors.moccasin;
    ctx.lineWidth = Math.max(2, Math.floor(iconSize * 0.12));

    this.drawSpeaker(ctx, centerX, centerY, iconSize);

    if (this.isEnabled()) {
      this.drawWaves(ctx, centerX, centerY, iconSize);
    } else {
      this.drawMute(ctx, centerX, centerY, iconSize);
    }

    ctx.restore();
  }

  private drawSpeaker(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
  ) {
    const speakerWidth = size * 0.55;
    const speakerHeight = size * 0.55;
    const left = centerX - size * 0.45;
    const top = centerY - speakerHeight / 2;

    ctx.beginPath();
    ctx.moveTo(left, top + speakerHeight * 0.2);
    ctx.lineTo(left + speakerWidth * 0.45, top);
    ctx.lineTo(left + speakerWidth * 0.45, top + speakerHeight);
    ctx.lineTo(left, top + speakerHeight * 0.8);
    ctx.closePath();
    ctx.fill();
  }

  private drawWaves(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
  ) {
    const baseX = centerX + size * 0.1;
    const radii = [size * 0.22, size * 0.36];
    radii.forEach((radius) => {
      ctx.beginPath();
      ctx.arc(baseX, centerY, radius, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    });
  }

  private drawMute(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    size: number,
  ) {
    const lineSize = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX + lineSize * 0.15, centerY - lineSize * 0.5);
    ctx.lineTo(centerX + lineSize * 0.65, centerY + lineSize * 0.5);
    ctx.moveTo(centerX + lineSize * 0.65, centerY - lineSize * 0.5);
    ctx.lineTo(centerX + lineSize * 0.15, centerY + lineSize * 0.5);
    ctx.stroke();
  }
}
