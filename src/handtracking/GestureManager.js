import { GAME_CONFIG } from '../utils/constants.js';
import { calcDistance } from '../utils/math.js';
import { eventBus } from '../utils/events.js';

export class GestureManager {
  constructor() {
    this.isPinching = false;
    this.currentDistance = 1.0;
    this.pinchStartTime = 0;
    
    // Dynamic tunable thresholds
    this.activeThreshold = GAME_CONFIG.PINCH_THRESHOLD_ACTIVE;     // 0.05
    this.inactiveThreshold = GAME_CONFIG.PINCH_THRESHOLD_INACTIVE; // 0.10
    this.minConfidence = GAME_CONFIG.MIN_HAND_CONFIDENCE;           // 0.70

    this._setupListeners();
  }

  _setupListeners() {
    eventBus.on('hand:detected', ({ landmarks, confidence }) => {
      this.update(landmarks, confidence);
    });

    eventBus.on('hand:lost', () => {
      if (this.isPinching) {
        this.isPinching = false;
        eventBus.emit('pinch:end', { distance: this.currentDistance, reason: 'hand_lost' });
      }
    });
  }

  update(landmarks, confidence) {
    if (!landmarks || confidence < this.minConfidence) {
      if (this.isPinching) {
        this.isPinching = false;
        eventBus.emit('pinch:end', { distance: this.currentDistance, reason: 'low_confidence' });
      }
      return;
    }

    const thumbTip = landmarks[4]; // Thumb tip
    const indexTip = landmarks[8]; // Index finger tip

    // 2D distance on camera sensor is rock-solid and does not suffer from Z-depth jitter
    this.currentDistance = calcDistance(thumbTip, indexTip);

    // Hysteresis state machine
    if (!this.isPinching) {
      if (this.currentDistance <= this.activeThreshold) {
        this.isPinching = true;
        this.pinchStartTime = performance.now();
        eventBus.emit('pinch:start', {
          distance: this.currentDistance,
          position: indexTip
        });
      }
    } else {
      if (this.currentDistance > this.inactiveThreshold) {
        this.isPinching = false;
        const duration = performance.now() - this.pinchStartTime;
        eventBus.emit('pinch:end', {
          distance: this.currentDistance,
          duration,
          position: indexTip
        });
      } else {
        eventBus.emit('pinch:active', {
          distance: this.currentDistance,
          position: indexTip
        });
      }
    }

    eventBus.emit('gesture:update', {
      isPinching: this.isPinching,
      distance: this.currentDistance,
      activeThreshold: this.activeThreshold,
      inactiveThreshold: this.inactiveThreshold
    });
  }

  setThresholds(active, inactive) {
    this.activeThreshold = active;
    this.inactiveThreshold = inactive;
  }
}
