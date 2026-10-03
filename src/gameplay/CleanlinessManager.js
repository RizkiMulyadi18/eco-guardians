import { eventBus } from '../utils/events.js';

export class CleanlinessManager {
  constructor() {
    this.correctDropped = 0;
    this.totalDropped = 0;
  }

  reset() {
    this.correctDropped = 0;
    this.totalDropped = 0;
    this._emitUpdate();
  }

  onCorrect() {
    this.correctDropped++;
    this.totalDropped++;
    this._emitUpdate();
  }

  onWrong() {
    this.totalDropped++;
    this._emitUpdate();
  }

  getPercentage() {
    if (this.totalDropped === 0) return 100;
    return Math.round((this.correctDropped / this.totalDropped) * 100);
  }

  meetsMinimum(minRequired = 40) {
    if (minRequired === null || minRequired === undefined) return true;
    return this.getPercentage() >= minRequired;
  }

  _emitUpdate() {
    const pct = this.getPercentage();
    eventBus.emit('cleanliness:update', {
      percentage: pct,
      correct: this.correctDropped,
      total: this.totalDropped,
      isLow: pct < 40
    });
  }
}
