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

type MenuLayout = {
  innerX: number;
  innerY: number;
  innerW: number;
  innerH: number;
};

type ImageRefs = {
  backgroundImage: HTMLImageElement;
  imageReadyRef: { value: boolean };
  mapImage: HTMLImageElement;
  mapReadyRef: { value: boolean };
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

  const images: ImageRefs = loadMenuImages(() => draw());

  const resize = () => {
    const rect = gameCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    menuCanvas.width = Math.floor(rect.width * dpr);
    menuCanvas.height = Math.floor(rect.height * dpr);
    menuCanvas.style.width = `${rect.width}px`;
    menuCanvas.style.height = `${rect.height}px`;
    draw();
  };

  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const width = menuCanvas.width / dpr;
    const height = menuCanvas.height / dpr;
    const layout = getMenuLayout(width, height);

    context.clearRect(0, 0, width, height);
    drawBackground(context, width, height, images.mapImage, images.mapReadyRef.value);
    drawPanel(context, layout);
    drawPanelBackground(context, layout, images.backgroundImage, images.imageReadyRef.value);
    drawTitle(context, layout, width);

    buttons = buildButtons(layout, width);
    drawButtons(context, buttons, selectedIndex);
    drawFooter(context, layout, width);
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

function loadMenuImages(onReady: () => void): ImageRefs {
  const backgroundImage = new Image();
  const mapImage = new Image();
  const imageReadyRef = { value: false };
  const mapReadyRef = { value: false };

  backgroundImage.src = '/main-menu/breads.png';
  backgroundImage.onload = () => {
    imageReadyRef.value = true;
    onReady();
  };

  mapImage.src = '/map/map.png';
  mapImage.onload = () => {
    mapReadyRef.value = true;
    onReady();
  };

  return { backgroundImage, imageReadyRef, mapImage, mapReadyRef };
}

function getMenuLayout(width: number, height: number): MenuLayout {
  const padding = Math.min(width, height) * 0.22;
  return {
    innerX: padding,
    innerY: padding,
    innerW: width - padding * 2,
    innerH: height - padding * 2,
  };
}

function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  mapImage: HTMLImageElement,
  mapReady: boolean,
) {
  if (mapReady) {
    drawCoverImage(context, mapImage, width, height, 0, 0);
    context.fillStyle = 'rgba(11, 8, 6, 0.25)';
    context.fillRect(0, 0, width, height);
  } else {
    context.fillStyle = '#3d1f11';
    context.fillRect(0, 0, width, height);
  }
}

function drawPanel(context: CanvasRenderingContext2D, layout: MenuLayout) {
  context.fillStyle = '#f5ecd8';
  context.strokeStyle = '#7b3f1f';
  context.lineWidth = 4;
  drawPixelRoundRect(context, layout.innerX, layout.innerY, layout.innerW, layout.innerH, 14);
  context.fill();
  context.stroke();
}

function drawPanelBackground(
  context: CanvasRenderingContext2D,
  layout: MenuLayout,
  image: HTMLImageElement,
  imageReady: boolean,
) {
  context.save();
  context.beginPath();
  drawPixelRoundRect(context, layout.innerX + 6, layout.innerY + 6, layout.innerW - 12, layout.innerH - 12, 12);
  context.clip();
  if (imageReady) {
    drawCoverImage(context, image, layout.innerW - 12, layout.innerH - 12, layout.innerX + 6, layout.innerY + 6);
  } else {
    context.fillStyle = '#5a2e16';
    context.fillRect(layout.innerX + 6, layout.innerY + 6, layout.innerW - 12, layout.innerH - 12);
  }
  context.restore();
}

function drawTitle(context: CanvasRenderingContext2D, layout: MenuLayout, width: number) {
  const titleY = layout.innerY + layout.innerH * 0.2;
  const titleWidth = Math.min(layout.innerW * 0.82, 420);
  const titleHeight = 64;
  const titleX = width / 2 - titleWidth / 2;
  const titleBoxY = titleY - titleHeight / 2;

  context.fillStyle = 'rgba(255, 228, 181, 0.92)';
  context.strokeStyle = Colors.chocolate;
  context.lineWidth = 3;
  drawPixelRoundRect(context, titleX, titleBoxY, titleWidth, titleHeight, 10);
  context.fill();
  context.stroke();

  context.fillStyle = Colors.saddleBrown;
  context.font = `700 ${Fonts.sizes.xlarge} ${Fonts.body}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText("🥐 Bake 'n Shake 🍰", width / 2, titleY);
}

function buildButtons(layout: MenuLayout, width: number): MenuButton[] {
  const buttonWidth = Math.min(320, layout.innerW * 0.55);
  const buttonHeight = 64;
  const buttonX = width / 2 - buttonWidth / 2;
  const startY = layout.innerY + layout.innerH * 0.48;
  const gap = 18;

  return [
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
}

function drawButtons(context: CanvasRenderingContext2D, buttons: MenuButton[], selectedIndex: number) {
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
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
  });
}

function drawFooter(context: CanvasRenderingContext2D, layout: MenuLayout, width: number) {
  context.fillStyle = 'rgba(58, 35, 22, 0.4)';
  context.font = `500 ${Fonts.sizes.small} ${Fonts.body}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '500 14px "Space Grotesk", sans-serif';
  context.fillText("© Bake 'n Shake", width / 2, layout.innerY + layout.innerH - 24);
}

function drawPixelRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.max(4, Math.floor(radius));
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.lineTo(x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.lineTo(x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.lineTo(x, y + height - r);
  context.lineTo(x, y + r);
  context.closePath();
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
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

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}
