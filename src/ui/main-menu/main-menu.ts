import { Colors, Fonts, UI } from '../../config/theme';

type MainMenuActions = {
  onStart: () => void;
  onRecipes: () => void;
};

type MenuButton = {
  id: 'start' | 'recipes';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function createMainMenu(actions: MainMenuActions) {
  const container = document.querySelector<HTMLDivElement>('#game-container');
  const gameCanvas = document.querySelector<HTMLCanvasElement>('#game');
  if (!container || !gameCanvas) {
    throw new Error('Game container or canvas not found');
  }

  const menuCanvas = document.createElement('canvas');
  menuCanvas.className = 'main-menu-canvas';
  menuCanvas.setAttribute('aria-label', 'Main menu');
  menuCanvas.tabIndex = 0;
  container.appendChild(menuCanvas);

  const context = menuCanvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get 2D context for main menu');
  }

  let buttons: MenuButton[] = [];
  let active = true;
  let selectedIndex = 0;
  const backgroundImage = new Image();
  let imageReady = false;
  backgroundImage.src = '/main-menu/breads.png';
  backgroundImage.onload = () => {
    imageReady = true;
    draw();
  };

  const mapImage = new Image();
  let mapReady = false;
  mapImage.src = '/map/map.png';
  mapImage.onload = () => {
    mapReady = true;
    draw();
  };

  const resize = () => {
    const rect = gameCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    menuCanvas.width = Math.floor(rect.width * dpr);
    menuCanvas.height = Math.floor(rect.height * dpr);
    menuCanvas.style.width = `${rect.width}px`;
    menuCanvas.style.height = `${rect.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  };

  const draw = () => {
    const width = menuCanvas.width / (window.devicePixelRatio || 1);
    const height = menuCanvas.height / (window.devicePixelRatio || 1);
    const padding = Math.min(width, height) * 0.22;
    const innerX = padding;
    const innerY = padding;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;

    context.clearRect(0, 0, width, height);
    if (mapReady) {
      drawCoverImage(context, mapImage, width, height, 0, 0);
      context.fillStyle = 'rgba(11, 8, 6, 0.25)';
      context.fillRect(0, 0, width, height);
    } else {
      context.fillStyle = '#3d1f11';
      context.fillRect(0, 0, width, height);
    }

    context.fillStyle = '#f5ecd8';
    context.strokeStyle = '#7b3f1f';
    context.lineWidth = 4;
    drawPixelRoundRect(context, innerX, innerY, innerW, innerH, 14);
    context.fill();
    context.stroke();

    context.save();
    context.beginPath();
    drawPixelRoundRect(context, innerX + 6, innerY + 6, innerW - 12, innerH - 12, 12);
    context.clip();
    if (imageReady) {
      drawCoverImage(context, backgroundImage, innerW - 12, innerH - 12, innerX + 6, innerY + 6);
    } else {
      context.fillStyle = '#5a2e16';
      context.fillRect(innerX + 6, innerY + 6, innerW - 12, innerH - 12);
    }
    context.restore();

    const titleY = innerY + innerH * 0.2;
    const titleWidth = Math.min(innerW * 0.82, 420);
    const titleHeight = 64;
    const titleX = width / 2 - titleWidth / 2;
    const titleBoxY = titleY - titleHeight / 2;

    context.fillStyle = 'rgba(245, 236, 216, 0.92)';
    context.strokeStyle = '#7b3f1f';
    context.lineWidth = 3;
    drawPixelRoundRect(context, titleX, titleBoxY, titleWidth, titleHeight, 10);
    context.fill();
    context.stroke();

    context.fillStyle = '#3a2316';
    context.font = '700 38px "Fraunces", serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText("🥐 Bake 'n Shake 🍰", width / 2, titleY);

    const buttonWidth = Math.min(280, innerW * 0.5);
    const buttonHeight = 56;
    const buttonX = width / 2 - buttonWidth / 2;
    const startY = innerY + innerH * 0.48;
    const gap = 18;

    buttons = [
      {
        id: 'start',
        label: 'Start Baking',
        x: buttonX,
        y: startY,
        width: buttonWidth,
        height: buttonHeight,
      },
      {
        id: 'recipes',
        label: 'Recipes',
        x: buttonX,
        y: startY + buttonHeight + gap,
        width: buttonWidth,
        height: buttonHeight,
      },
    ];

    buttons.forEach((button, index) => {
      const isSelected = index === selectedIndex;
      context.fillStyle = isSelected ? Colors.chocolate : Colors.saddleBrown;
      context.strokeStyle = isSelected ? Colors.moccasin : Colors.chocolate;
      context.lineWidth = isSelected ? UI.borderWidth.thick : UI.borderWidth.thin;
      drawPixelRoundRect(context, button.x, button.y, button.width, button.height, 10);
      context.fill();
      context.stroke();

      context.fillStyle = Colors.moccasin;
      context.font = `600 ${Fonts.sizes.large} ${Fonts.body}`;
      context.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
    });

    context.fillStyle = 'rgba(58, 35, 22, 0.4)';
    context.font = '500 14px "Space Grotesk", sans-serif';
    context.fillText('© Bake \'n Shake', width / 2, innerY + innerH - 24);
  };

  const hitTest = (x: number, y: number) =>
    buttons.find(
      (button) =>
        x >= button.x &&
        x <= button.x + button.width &&
        y >= button.y &&
        y <= button.y + button.height,
    );

  menuCanvas.addEventListener('mousemove', (event) => {
    if (!active) return;
    const rect = menuCanvas.getBoundingClientRect();
    const hit = hitTest(event.clientX - rect.left, event.clientY - rect.top);
    menuCanvas.style.cursor = hit ? 'pointer' : 'default';
  });

  menuCanvas.addEventListener('click', (event) => {
    if (!active) return;
    const rect = menuCanvas.getBoundingClientRect();
    const hit = hitTest(event.clientX - rect.left, event.clientY - rect.top);
    if (!hit) return;

    if (hit.id === 'start') {
      actions.onStart();
      hide();
    } else if (hit.id === 'recipes') {
      actions.onRecipes();
    }
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!active) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      event.preventDefault();
      event.stopPropagation();
      selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length;
      draw();
    } else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      event.preventDefault();
      event.stopPropagation();
      selectedIndex = (selectedIndex + 1) % buttons.length;
      draw();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      const selected = buttons[selectedIndex];
      if (!selected) return;
      if (selected.id === 'start') {
        actions.onStart();
        hide();
      } else if (selected.id === 'recipes') {
        actions.onRecipes();
      }
    }
  };

  menuCanvas.addEventListener('keydown', handleKeyDown);

  const show = () => {
    active = true;
    menuCanvas.style.display = 'block';
    selectedIndex = 0;
    resize();
    menuCanvas.focus();
    window.addEventListener('keydown', handleKeyDown, true);
  };

  const hide = () => {
    active = false;
    menuCanvas.style.display = 'none';
    window.removeEventListener('keydown', handleKeyDown, true);
  };

  window.addEventListener('resize', () => {
    if (active) {
      resize();
    }
  });

  show();

  return { show, hide, getCanvas: () => menuCanvas };
}

function drawPixelRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.max(4, Math.floor(radius));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.lineTo(x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.lineTo(x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.lineTo(x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = x;
  let offsetY = y;

  if (canvasRatio > imageRatio) {
    drawHeight = width / imageRatio;
    offsetY = y + (height - drawHeight) / 2;
  } else {
    drawWidth = height * imageRatio;
    offsetX = x + (width - drawWidth) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}
