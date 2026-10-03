import { GameApp } from './core/GameApp.js';

// Bootstrap Eco Guardians Game Application
window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.init();
});
