import { COMBO_CONFIG } from '../utils/constants.js';
import { eventBus } from '../utils/events.js';

export class ComboManager {
  constructor() {
    this.count = 0;
    this.multiplier = 1;
    this.maxCombo = 0;
  }

  reset() {
    this.count = 0;
    this.multiplier = 1;
    this.maxCombo = 0;
    this._emitUpdate();
  }

  onCorrect() {
    this.count++;
    this.maxCombo = Math.max(this.maxCombo, this.count);
    
    const prevMultiplier = this.multiplier;
    this._updateMultiplier();

    if (this.multiplier > prevMultiplier) {
      eventBus.emit('combo:level_up', {
        count: this.count,
        multiplier: this.multiplier,
        label: this.getDisplayLabel()
      });
    }

    this._emitUpdate();
    return this.multiplier;
  }

  onWrong() {
    const hadCombo = this.count >= COMBO_CONFIG.DISPLAY_FROM;
    this.count = 0;
    this.multiplier = 1;
    
    if (hadCombo) {
      eventBus.emit('combo:reset');
    }
    this._emitUpdate();
    return 1;
  }

  _updateMultiplier() {
    if (this.count >= 12) {
      this.multiplier = 5;
    } else if (this.count >= 9) {
      this.multiplier = 4;
    } else if (this.count >= 6) {
      this.multiplier = 3;
    } else if (this.count >= 3) {
      this.multiplier = 2;
    } else {
      this.multiplier = 1;
    }
  }

  getDisplayLabel() {
    if (this.count < COMBO_CONFIG.DISPLAY_FROM) return null;
    if (this.multiplier >= 5) return 'COMBO x5 MAX!';
    return `COMBO x${this.multiplier}`;
  }

  _emitUpdate() {
    eventBus.emit('combo:update', {
      count: this.count,
      multiplier: this.multiplier,
      maxCombo: this.maxCombo,
      label: this.getDisplayLabel(),
      isVisible: this.count >= COMBO_CONFIG.DISPLAY_FROM
    });
  }
}
