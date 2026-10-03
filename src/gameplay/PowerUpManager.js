import { POWERUP_CONFIG } from '../utils/constants.js';
import { eventBus } from '../utils/events.js';
import { logger } from '../utils/logger.js';

export class PowerUpManager {
  constructor({ timerManager, healthManager, scoreManager, binManager }) {
    this.timerManager = timerManager;
    this.healthManager = healthManager;
    this.scoreManager = scoreManager;
    this.binManager = binManager;
    
    // Track which power-ups have been triggered (each fires ONLY ONCE per mission)
    this.triggered = { TIME_BONUS: false, HINT: false, SHIELD: false };
    this.shieldActive = false;
    
    this._setupListeners();
  }

  reset() {
    this.triggered = { TIME_BONUS: false, HINT: false, SHIELD: false };
    this.shieldActive = false;
  }

  _setupListeners() {
    // 1. TIME_BONUS: First time reaching combo x3 → +15 seconds
    eventBus.on('combo:level_up', (data) => {
      if (data && data.multiplier >= 3) {
        this._tryTimeBonusTrigger();
      }
    });

    // 2. HINT: When player has only 1 life left → highlight correct bin
    eventBus.on('health:update', (data) => {
      if (data && data.lives === 1) {
        this._tryHintTrigger();
      }
    });

    // 3. SHIELD: When accuracy ≥80% at halfway point → 1 free mistake
    eventBus.on('mission:progress', (data) => {
      if (data) {
        this._tryShieldTrigger(data.current, data.total);
      }
    });
  }

  _tryTimeBonusTrigger() {
    if (this.triggered.TIME_BONUS) return;
    this.triggered.TIME_BONUS = true;
    
    if (this.timerManager) {
      this.timerManager.addTime(15);
    }
    
    logger.info('PowerUpManager', 'TIME_BONUS activated: +15 seconds');
    eventBus.emit('powerup:activated', { type: 'TIME_BONUS', message: '⏰ +15 Detik!' });
  }

  _tryHintTrigger() {
    if (this.triggered.HINT) return;
    this.triggered.HINT = true;
    
    logger.info('PowerUpManager', 'HINT activated: highlighting correct bin');
    eventBus.emit('powerup:activated', { type: 'HINT', message: '💡 Petunjuk Tong Aktif!' });
    
    // Signal BinManager to highlight the correct bin
    eventBus.emit('powerup:hint_start');
    
    // Auto-expire hint after 5 seconds
    setTimeout(() => {
      eventBus.emit('powerup:hint_end');
      logger.info('PowerUpManager', 'HINT expired');
    }, POWERUP_CONFIG.HINT.duration || 5000);
  }

  _tryShieldTrigger(processedCount, totalObjects) {
    if (this.triggered.SHIELD) return;
    
    const halfwayPoint = Math.floor(totalObjects / 2);
    if (processedCount >= halfwayPoint && this.scoreManager && this.scoreManager.accuracy >= 80) {
      this.triggered.SHIELD = true;
      this.shieldActive = true;
      
      logger.info('PowerUpManager', 'SHIELD activated: next mistake is free');
      eventBus.emit('powerup:activated', { type: 'SHIELD', message: '🛡️ Perisai Aktif!' });
    }
  }

  isShieldActive() {
    return this.shieldActive;
  }

  consumeShield() {
    this.shieldActive = false;
    logger.info('PowerUpManager', 'SHIELD consumed — protection used');
    eventBus.emit('powerup:shield_consumed');
  }
}
