import './style.css';
import { Game } from './game';
import { AmbientAudioManager } from './AmbientAudioManager';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Bake 'n Shake</h1>
    <canvas id="gameCanvas"></canvas>
    <div class="controls">
      <button id="startBtn">Start Game</button>
      <button id="stopBtn">Stop Game</button>
      <button id="musicToggleBtn">Spiel Musik ab</button>
    </div>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#gameCanvas');
if (!canvas) {
  throw new Error('Canvas element not found');
}

const game = new Game(canvas);

const ambientManager = new AmbientAudioManager(
    [
      '/audio/Frische_Brötchen_warme_Herzen.mp3',
      '/audio/Frische_Brötchen_warme_Herzen_2.mp3',
    ],
    {
      maxVolume: 0.35,
      fadeDuration: 4000,
      pauseMin: 5000,
      pauseMax: 15000
    }
);


const startBtn = document.querySelector<HTMLButtonElement>('#startBtn');
const stopBtn = document.querySelector<HTMLButtonElement>('#stopBtn');
const musicToggleBtn = document.querySelector<HTMLButtonElement>('#musicToggleBtn');

startBtn?.addEventListener('click', () => {
  game.start();
});

stopBtn?.addEventListener('click', () => {
  game.stop();
});


// Musik Toggle Button
let musicRunning = false;

musicToggleBtn?.addEventListener('click', async () => {

  if (!musicRunning) {
    await ambientManager.start();
    musicToggleBtn.textContent = "Stop Musik";
  } else {
    await ambientManager.stop();
    musicToggleBtn.textContent = "Spiel Musik ab";
  }

  musicRunning = !musicRunning;
});


// optional: Autostart Game
game.start();
