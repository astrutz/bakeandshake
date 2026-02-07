import './style.css';
import { Game } from './game';
import { AmbientAudioManager } from './audio/AmbientAudioManager.ts';
import { SoundManager } from './audio/SoundManager.ts';
import { SOUND_IDS } from './audio/SoundId.ts';
import { initRecipeBookOverview } from './ui/recipe-book/recipe-book.ts';
import { createMainMenu } from './ui/main-menu/main-menu';

// Get the existing canvas element
const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas element not found');
}

const soundManager = new SoundManager();

// Sounds registrieren
soundManager.registerSound(SOUND_IDS.NPC_TALK, '/audio/npc-talk.mp3', { volume: 0.7 });
// soundManager.registerSound(SOUND_IDS.NPC_BUY, '/audio/gehaltsverhandlungen.mp3', { volume: 0.6 });
soundManager.registerSound(SOUND_IDS.BACKGROUND_WIND, '/audio/gehaltsverhandlungen.mp3', {
  volume: 1,
  loop: true,
});
soundManager.registerSound(SOUND_IDS.BACKGROUND_COFFEE, '/audio/coffee-ambience-v2.mp3', {
  volume: 0.5,
  loop: true,
});

// Initialize the game
const game = new Game(canvas, soundManager);
await game.loadCollisionsFromTiled('/map/bakery.tmj');

const ambientManager = new AmbientAudioManager(
  ['/audio/Frische_Brötchen_warme_Herzen.mp3', '/audio/Frische_Brötchen_warme_Herzen_2.mp3'],
  {
    maxVolume: 0.15,
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
    // Hintergrundeffekte starten
    soundManager.playSound(SOUND_IDS.BACKGROUND_COFFEE);
  } else {
    musicToggleBtn.textContent = 'Spiel Musik ab';
    ambientManager.stop();
    soundManager.stopSound(SOUND_IDS.BACKGROUND_COFFEE);
  }

  musicRunning = !musicRunning;
});

// Initialize recipe book overview overlay
const openRecipeBook = initRecipeBookOverview();

// Main menu
const menu = createMainMenu({
  onStart: () => {
    isRunning = true;
    toggleBtn && (toggleBtn.textContent = 'Pause');
    game.start();
  },
  onRecipes: () => {
    openRecipeBook?.(menu.getCanvas());
  },
});

window.addEventListener('open-main-menu', () => {
  game.stop();
  menu.show();
});
