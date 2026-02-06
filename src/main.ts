import './style.css';
import { Game } from './game';
import { AmbientAudioManager } from './util/AmbientAudioManager.ts';

// Get the existing canvas element
const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Initialize the game
const game = new Game(canvas);
await game.loadCollisionsFromTiled('/bakery.json');

const ambientManager = new AmbientAudioManager(
  ['/audio/Frische_Brötchen_warme_Herzen.mp3', '/audio/Frische_Brötchen_warme_Herzen_2.mp3'],
  {
    maxVolume: 0.35,
    fadeDuration: 1000,
    pauseMin: 1,
    pauseMax: 15000,
  },
);

const musicToggleBtn = document.querySelector<HTMLButtonElement>('#music');

// Set up controls
const toggleBtn = document.querySelector<HTMLButtonElement>('#toggle');

let isRunning = true;

toggleBtn?.addEventListener('click', () => {
  if (isRunning) {
    game.stop();
    toggleBtn.textContent = 'Resume';
  } else {
    game.start();
    toggleBtn.textContent = 'Pause';
  }
  isRunning = !isRunning;
});

// Musik Toggle Button
let musicRunning = false;

musicToggleBtn?.addEventListener('click', async () => {
  if (!musicRunning) {
    musicToggleBtn.textContent = 'Stop Musik';
    ambientManager.start();
  } else {
    musicToggleBtn.textContent = 'Spiel Musik ab';
    ambientManager.stop();
  }

  musicRunning = !musicRunning;
});

// optional: Autostart Game
game.start();
