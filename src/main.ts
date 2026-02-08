import './style.css';
import { Game } from './game';
import { AmbientAudioManager } from './audio/AmbientAudioManager.ts';
import { SoundManager } from './audio/SoundManager.ts';
import { SOUND_IDS } from './audio/SoundId.ts';
import { initRecipeBookOverview } from './ui/RecipeBook/RecipeBook.ts';
import { createMainMenu } from './ui/MainMenu.ts';
import { MusicController } from './audio/MusicController.ts';
import type { ProximitySoundManager } from './audio/ProximitySoundManager.ts';

// Get the existing canvas element
const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) {
  throw new Error('Canvas element not found');
}

const soundManager = new SoundManager();

// Sounds registrieren

// Zunächst Audio-Datei als Sound registrieren
soundManager.registerSound(SOUND_IDS.CAT_PURRING, '/audio/cat-purring.mp3', {
  volume: 0.8,
  loop: false,
});

soundManager.registerSound(SOUND_IDS.OVEN_AMBIENCE, '/audio/fire-crackling-sounds.mp3', {
  volume: 0.8,
  loop: true,
});

soundManager.registerSound(SOUND_IDS.COIN_FLIP, '/audio/coins.m4a', { volume: 0.5 });
soundManager.registerSound(SOUND_IDS.LEVEL_COMPLETED, '/audio/wand.m4a', { volume: 0.5 });

soundManager.registerSound(SOUND_IDS.CAT_MEOW, '/audio/cat-meow.mp3', { volume: 0.5 });
soundManager.registerSound(SOUND_IDS.CAT_MEOW_2, '/audio/cat-meow-2.mp3', { volume: 0.5 });
soundManager.registerSound(SOUND_IDS.EVIL_BOX, '/audio/martin-speaking.mp3', { volume: 0.4 });

soundManager.registerSound(SOUND_IDS.COLLISION, '/audio/collision.mp3', { volume: 0.7 });
soundManager.registerSound(SOUND_IDS.NPC_TALK, '/audio/npc-talk.mp3', { volume: 0.7 });
// soundManager.registerSound(SOUND_IDS.NPC_BUY, '/audio/gehaltsverhandlungen.mp3', { volume: 0.6 });
soundManager.registerSound(SOUND_IDS.BACKGROUND_WIND, '/audio/gehaltsverhandlungen.mp3', {
  volume: 1,
  loop: true,
});
soundManager.registerSound(SOUND_IDS.BACKGROUND_COFFEE, '/audio/coffee-ambience-v2.mp3', {
  volume: 0.2,
  loop: true,
});

const ambientManager = new AmbientAudioManager(
  ['/audio/Frische_Brötchen_warme_Herzen.mp3', '/audio/Frische_Brötchen_warme_Herzen_2.mp3'],
  {
    maxVolume: 0.05,
    fadeDuration: 1000,
    pauseMin: 1,
    pauseMax: 15000,
  },
);

const musicController = new MusicController(ambientManager, soundManager);

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

// Initialize the game
const game = new Game(canvas, soundManager, musicController);
await game.loadCollisionsFromTiled('/map/bakery.tmj');

const proximityManager = game.getProximitySoundManager();

// Registriere Proximity Sound Sources
// Katze an Position (300, 200)
proximityManager.registerProximitySource({
  id: SOUND_IDS.CAT_PURRING,
  x: 974,
  y: 236,
  soundId: SOUND_IDS.CAT_PURRING,
  proximityRadius: 100, // Sound aktiviert in 200px Radius
  maxDistance: 100,
  volume: 0.8,
  isLooping: true,
  fadeInDistance: 100, // Start fading at 200px
  minVolume: 0.1, // Minimum 10% volume at edge
  debugColor: '#6759b3',
} as ProximitySoundManager);

// Ofen an Position (500, 300) - kontinuierlicher Sound
proximityManager.registerProximitySource({
  id: SOUND_IDS.OVEN_AMBIENCE,
  x: 286,
  y: 50,
  soundId: SOUND_IDS.OVEN_AMBIENCE,
  proximityRadius: 200, // Hörbar bis 250px entfernung
  maxDistance: 200,
  volume: 0.6,
  isLooping: true, // Dauerhafte Geräuschkulisse
  fadeInDistance: 200,
  minVolume: 0.05,
  debugColor: '#77c2e4',
} as ProximitySoundManager);

// Initialize recipe book overview overlay
const openRecipeBook = initRecipeBookOverview();

// Main menu
const menu = createMainMenu(
  {
    onStart: () => {
      isRunning = true;
      toggleBtn && (toggleBtn.textContent = 'Pause');
      game.start();
    },
    onRecipes: () => {
      openRecipeBook?.(menu.getCanvas());
    },
  },
  musicController,
);

window.addEventListener('open-main-menu', () => {
  game.stop();
  menu.show();
});
