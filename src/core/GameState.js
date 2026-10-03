import { APP_STATES, GAME_CONFIG } from '../utils/constants.js';
import { eventBus } from '../utils/events.js';
import { logger } from '../utils/logger.js';

export class GameState {
  constructor() {
    this.screen = APP_STATES.LOADING;
    this.selectedChapter = 1;
    
    // Mission runtime states
    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;
    this.lives = GAME_CONFIG.INITIAL_LIVES;
    this.cleanliness = GAME_CONFIG.INITIAL_CLEANLINESS;
    this.combo = 0;
    this.maxCombo = 0;
    this.timer = 0;
    this.correctCount = 0;
    this.totalMistakes = 0;
    this.processedObjects = 0;
  }

  setScreen(newScreen) {
    if (!APP_STATES[newScreen]) {
      logger.error('GameState', `Invalid state transition requested: ${newScreen}`);
      return;
    }
    const oldScreen = this.screen;
    this.screen = newScreen;
    logger.info('GameState', `Transition: ${oldScreen} -> ${newScreen}`);
    eventBus.emit('screen:change', { from: oldScreen, to: newScreen });
  }

  resetMission(chapterConfig) {
    this.isPlaying = true;
    this.isPaused = false;
    this.score = 0;
    this.lives = GAME_CONFIG.INITIAL_LIVES;
    this.cleanliness = GAME_CONFIG.INITIAL_CLEANLINESS;
    this.combo = 0;
    this.maxCombo = 0;
    this.timer = chapterConfig.duration || 90;
    this.correctCount = 0;
    this.totalMistakes = 0;
    this.processedObjects = 0;
    eventBus.emit('mission:reset', this);
  }
}

export const gameState = new GameState();
