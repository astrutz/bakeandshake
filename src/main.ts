import './style.css';
import { Game } from './game';

// Get the existing canvas element
const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas element not found');
}

// Initialize the game
const game = new Game(canvas);
await game.loadCollisionsFromTiled('/bakery.json');


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

// Auto-start the game
game.start();
