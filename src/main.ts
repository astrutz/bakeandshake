import './style.css';
import { Game } from './game';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Bake 'n Shake</h1>
    <canvas id="gameCanvas"></canvas>
    <div class="controls">
      <button id="startBtn">Start Game</button>
      <button id="stopBtn">Stop Game</button>
    </div>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas');
if (!canvas) {
  throw new Error('Canvas element not found');
}

const game = new Game(canvas);

const startBtn = document.querySelector<HTMLButtonElement>('#startBtn');
const stopBtn = document.querySelector<HTMLButtonElement>('#stopBtn');

startBtn?.addEventListener('click', () => {
  game.start();
});

stopBtn?.addEventListener('click', () => {
  game.stop();
});

game.start();
