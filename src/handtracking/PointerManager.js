import { GAME_CONFIG } from '../utils/constants.js';
import { lerp } from '../utils/math.js';
import { eventBus } from '../utils/events.js';

export class PointerManager {
  constructor() {
    this.cursorEl = document.getElementById('virtual-cursor');
    
    // Smooth coordinates
    this.screenX = window.innerWidth / 2;
    this.screenY = window.innerHeight / 2;
    
    // Normalized Device Coordinates for Three.js (-1 to +1)
    this.ndcX = 0;
    this.ndcY = 0;

    this.lerpFactor = GAME_CONFIG.LERP_FACTOR; // 0.35
    this.isHandVisible = false;
    this.isPinching = false;
    this.isHovering = false;

    this._setupListeners();
  }

  _setupListeners() {
    eventBus.on('hand:detected', ({ landmarks }) => {
      this.isHandVisible = true;
      if (this.cursorEl) {
        this.cursorEl.style.display = 'block';
      }
      this.update(landmarks);
    });

    eventBus.on('hand:lost', () => {
      this.isHandVisible = false;
      if (this.cursorEl) {
        this.cursorEl.style.display = 'none';
      }
    });

    eventBus.on('pinch:start', () => {
      this.isPinching = true;
      if (this.cursorEl) {
        this.cursorEl.classList.add('pinch-active');
      }
    });

    eventBus.on('pinch:end', () => {
      this.isPinching = false;
      if (this.cursorEl) {
        this.cursorEl.classList.remove('pinch-active');
      }
    });

    eventBus.on('pointer:hover', (isHover) => {
      this.isHovering = isHover;
      if (this.cursorEl) {
        if (isHover) {
          this.cursorEl.classList.add('hover-active');
        } else {
          this.cursorEl.classList.remove('hover-active');
        }
      }
    });
  }

  update(landmarks) {
    if (!landmarks || !landmarks[8]) return;

    const indexTip = landmarks[8];

    // 1. Mirror horizontally for natural webcam interaction
    const targetX = (1 - indexTip.x) * window.innerWidth;
    const targetY = indexTip.y * window.innerHeight;

    // 2. Exponential smoothing (LERP)
    this.screenX = lerp(this.screenX, targetX, this.lerpFactor);
    this.screenY = lerp(this.screenY, targetY, this.lerpFactor);

    // 3. Convert to Three.js Normalized Device Coordinates (-1 to +1)
    this.ndcX = (this.screenX / window.innerWidth) * 2 - 1;
    this.ndcY = -(this.screenY / window.innerHeight) * 2 + 1;

    // 4. Update cursor DOM element
    if (this.cursorEl) {
      this.cursorEl.style.left = `${Math.round(this.screenX)}px`;
      this.cursorEl.style.top = `${Math.round(this.screenY)}px`;
    }

    eventBus.emit('pointer:moved', {
      screenX: this.screenX,
      screenY: this.screenY,
      ndcX: this.ndcX,
      ndcY: this.ndcY,
      isPinching: this.isPinching
    });
  }

  getNDC() {
    return { x: this.ndcX, y: this.ndcY };
  }

  getScreenPos() {
    return { x: this.screenX, y: this.screenY };
  }
}
