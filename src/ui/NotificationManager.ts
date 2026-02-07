import { Fonts } from '../config/theme.ts';

export interface Notification {
  message: string;
  timestamp: number;
  duration: number;
}

export class NotificationManager {
  private notifications: Notification[] = [];
  private readonly DEFAULT_DURATION = 3;
  private readonly MAX_NOTIFICATIONS = 3;
  private readonly NOTIFICATION_HEIGHT = 40;
  private readonly NOTIFICATION_SPACING = 10;

  public showNotification(message: string, duration: number = this.DEFAULT_DURATION): void {
    const notification: Notification = {
      message,
      timestamp: Date.now(),
      duration: duration * 1000, // Convert to milliseconds
    };

    this.notifications.push(notification);

    // Remove old notifications if we exceed the max
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications.shift();
    }

    console.log(`📢 ${message}`);
  }

  public update(): void {
    const now = Date.now();
    // Remove expired notifications
    this.notifications = this.notifications.filter(
      (notif) => now - notif.timestamp < notif.duration
    );
  }

  public render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    if (this.notifications.length === 0) return;

    ctx.save();

    const startY = canvasHeight - 150; // Position above the dialog box area
    const now = Date.now();

    this.notifications.forEach((notification, index) => {
      const elapsed = now - notification.timestamp;
      const alpha = Math.min(1, Math.max(0, 1 - (elapsed / notification.duration)));

      if (alpha <= 0) return;

      const y = startY - (index * (this.NOTIFICATION_HEIGHT + this.NOTIFICATION_SPACING));

      // Background
      ctx.fillStyle = `rgba(139, 69, 19, ${alpha * 0.9})`; // Brown with alpha
      ctx.fillRect(
        canvasWidth / 2 - 200,
        y,
        400,
        this.NOTIFICATION_HEIGHT
      );

      // Border
      ctx.strokeStyle = `rgba(210, 105, 30, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        canvasWidth / 2 - 200,
        y,
        400,
        this.NOTIFICATION_HEIGHT
      );

      // Text
      ctx.fillStyle = `rgba(255, 228, 181, ${alpha})`; // Moccasin with alpha
      ctx.font = `${Fonts.sizes.medium} ${Fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(notification.message, canvasWidth / 2, y + this.NOTIFICATION_HEIGHT / 2);
    });

    ctx.restore();
  }
}