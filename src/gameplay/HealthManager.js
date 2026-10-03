import { GAME_CONFIG } from '../utils/constants.js';
import { eventBus } from '../utils/events.js';

export class HealthManager {
  constructor(initialLives = GAME_CONFIG.INITIAL_LIVES) {
    this.maxLives = initialLives;
    this.lives = initialLives;
  }

  reset(lives = GAME_CONFIG.INITIAL_LIVES) {
    this.maxLives = lives;
    this.lives = lives;
    this._emitUpdate();
  }

  takeDamage(amount = 1) {
    this.lives = Math.max(0, this.lives - amount);
    this._emitUpdate();

    if (this.lives === 0) {
      eventBus.emit('health:empty');
    }

    return this.lives;
  }

  heal(amount = 1) {
    this.lives = Math.min(this.maxLives, this.lives + amount);
    this._emitUpdate();
    return this.lives;
  }

  isAlive() {
    return this.lives > 0;
  }

  _emitUpdate() {
    eventBus.emit('health:update', {
      lives: this.lives,
      maxLives: this.maxLives,
      isDanger: this.lives === 1
    });
  }
}
