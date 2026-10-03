import { eventBus } from '../utils/events.js';

export class GameplayHUD {
  constructor(container) {
    this.container = container;
    this.feedbackTimeout = null;
  }

  mount() {
    this.container.innerHTML = `
      <!-- TOP LEFT: SCORE & COMBO -->
      <div style="position: absolute; top: 16px; left: 16px; display: flex; flex-direction: column; gap: 8px; z-index: 20;" class="interactive-ui">
        <div class="comic-card" style="padding: 10px 18px; display: flex; align-items: center; gap: 14px; min-width: 170px;">
          <div>
            <div style="font-size: 0.7rem; font-weight: 800; color: #718096; text-transform: uppercase;">SKOR</div>
            <div id="hud-score" style="font-size: 1.6rem; font-weight: 900; color: #2B6CB0; line-height: 1;">0</div>
          </div>
          <div id="hud-combo-badge" style="display: none; background: #ECC94B; color: #744210; font-size: 0.8rem; font-weight: 900; padding: 4px 8px; border-radius: 8px; border: 2px solid #2D3748; box-shadow: 2px 2px 0px #2D3748; animation: pulse 0.5s infinite alternate;">
            COMBO x1
          </div>
        </div>

        <!-- Mission Progress Pill -->
        <div class="comic-card" style="padding: 6px 14px; font-size: 0.75rem; font-weight: 800; color: #4A5568; display: flex; align-items: center; gap: 8px;">
          <span>📦 Progres:</span>
          <span id="hud-progress" style="color: #2B6CB0; font-size: 0.85rem;">0 / 12</span>
        </div>

        <!-- Power-Up Indicators -->
        <div id="hud-powerup-badges" style="display: flex; flex-direction: column; gap: 4px;">
          <div id="hud-shield-badge" style="display: none; background: #E9D8FD; border: 2px solid #6B46C1; border-radius: 8px; padding: 4px 10px; font-size: 0.7rem; font-weight: 800; color: #553C9A; text-align: center;">
            🛡️ Perisai Aktif
          </div>
          <div id="hud-combo-target" style="display: none; background: #FEFCBF; border: 2px solid #D69E2E; border-radius: 8px; padding: 4px 10px; font-size: 0.7rem; font-weight: 800; color: #744210; text-align: center;">
            🎯 Target: Combo x5
          </div>
        </div>
      </div>

      <!-- TOP CENTER: TIMER & CHAPTER TITLE -->
      <div style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%); text-align: center; z-index: 20;" class="interactive-ui">
        <div class="comic-card" style="padding: 8px 24px; display: inline-flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.2rem;">⏱️</span>
          <span id="hud-timer" style="font-size: 1.6rem; font-weight: 900; color: #2D3748; font-variant-numeric: tabular-nums;">
            01:30
          </span>
        </div>
      </div>

      <!-- TOP RIGHT: LIVES, CLEANLINESS & PAUSE BUTTON -->
      <div style="position: absolute; top: 16px; right: 16px; display: flex; align-items: center; gap: 10px; z-index: 20;" class="interactive-ui">
        <!-- Cleanliness Bar -->
        <div class="comic-card" style="padding: 8px 14px; min-width: 130px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 800; color: #718096; margin-bottom: 3px;">
            <span>KEBERSIHAN</span>
            <span id="hud-cleanliness-val">100%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden; border: 1px solid #CBD5E0;">
            <div id="hud-cleanliness-bar" style="width: 100%; height: 100%; background: #48BB78; transition: width 0.3s ease, background-color 0.3s ease;"></div>
          </div>
        </div>

        <!-- Lives Hearts -->
        <div class="comic-card" style="padding: 8px 12px; display: flex; align-items: center; gap: 4px; font-size: 1.2rem;" id="hud-lives">
          <span id="heart-1">❤️</span>
          <span id="heart-2">❤️</span>
          <span id="heart-3">❤️</span>
        </div>

        <!-- Pause Button -->
        <button id="btn-pause-game" class="comic-btn secondary" style="padding: 8px 12px; font-size: 1.1rem; line-height: 1;">
          ⏸️
        </button>
      </div>

      <!-- BOTTOM CENTER: EDUCATIONAL TOAST FEEDBACK -->
      <div id="sorting-toast" class="comic-card interactive-ui" style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); opacity: 0; pointer-events: none; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 540px; width: 90%; text-align: center; padding: 14px 22px; z-index: 30;">
        <div id="toast-title" style="font-size: 1.15rem; font-weight: 900; margin-bottom: 4px;"></div>
        <div id="toast-desc" style="font-size: 0.82rem; line-height: 1.4; color: #4A5568;"></div>
      </div>
    `;

    this._setupListeners();
  }

  _setupListeners() {
    // 1. Score update
    eventBus.on('score:update', ({ score }) => {
      const el = document.getElementById('hud-score');
      if (el) el.innerText = score;
    });

    // 2. Combo update
    eventBus.on('combo:update', ({ isVisible, label }) => {
      const badge = document.getElementById('hud-combo-badge');
      if (badge) {
        if (isVisible && label) {
          badge.style.display = 'inline-block';
          badge.innerText = label;
        } else {
          badge.style.display = 'none';
        }
      }
    });

    // 3. Timer update
    eventBus.on('timer:tick', ({ formatted, isDanger }) => {
      const el = document.getElementById('hud-timer');
      if (el) {
        el.innerText = formatted;
        el.style.color = isDanger ? '#E53E3E' : '#2D3748';
      }
    });

    // 4. Lives update
    eventBus.on('health:update', ({ lives }) => {
      const h1 = document.getElementById('heart-1');
      const h2 = document.getElementById('heart-2');
      const h3 = document.getElementById('heart-3');
      if (h1 && h2 && h3) {
        h1.innerText = lives >= 1 ? '❤️' : '🖤';
        h2.innerText = lives >= 2 ? '❤️' : '🖤';
        h3.innerText = lives >= 3 ? '❤️' : '🖤';
      }
    });

    // 5. Cleanliness update
    eventBus.on('cleanliness:update', ({ percentage }) => {
      const val = document.getElementById('hud-cleanliness-val');
      const bar = document.getElementById('hud-cleanliness-bar');
      if (val && bar) {
        val.innerText = `${percentage}%`;
        bar.style.width = `${percentage}%`;
        if (percentage < 40) {
          bar.style.backgroundColor = '#E53E3E';
        } else if (percentage < 70) {
          bar.style.backgroundColor = '#ECC94B';
        } else {
          bar.style.backgroundColor = '#48BB78';
        }
      }
    });

    // 6. Mission progress
    eventBus.on('mission:progress', ({ current, total }) => {
      const el = document.getElementById('hud-progress');
      if (el) el.innerText = `${current} / ${total}`;
    });

    // 7. Sorting result feedback
    eventBus.on('sorting:result', (result) => {
      this.showFeedbackToast(result);
    });

    // 8. Pause button
    const btnPause = document.getElementById('btn-pause-game');
    if (btnPause) {
      btnPause.addEventListener('click', () => {
        eventBus.emit('ui:pause_clicked');
      });
    }

    // 9. Power-Up: Shield indicator
    eventBus.on('powerup:activated', (data) => {
      if (data.type === 'SHIELD') {
        const badge = document.getElementById('hud-shield-badge');
        if (badge) badge.style.display = 'block';
      }
    });

    eventBus.on('powerup:shield_consumed', () => {
      const badge = document.getElementById('hud-shield-badge');
      if (badge) badge.style.display = 'none';
    });

    // 10. Mission started: show combo target for chapters with minCombo
    eventBus.on('mission:started', (chapter) => {
      const comboTarget = document.getElementById('hud-combo-target');
      if (comboTarget && chapter.minCombo) {
        comboTarget.style.display = 'block';
        comboTarget.innerHTML = `🎯 Target: Combo x${chapter.minCombo}`;
      }
    });

    // 11. Combo target reached
    eventBus.on('mission:combo_target_reached', () => {
      const comboTarget = document.getElementById('hud-combo-target');
      if (comboTarget) {
        comboTarget.style.background = '#C6F6D5';
        comboTarget.style.borderColor = '#38A169';
        comboTarget.style.color = '#22543D';
        comboTarget.innerHTML = '✅ Target Combo Tercapai!';
      }
    });
  }

  showFeedbackToast(result) {
    const toast = document.getElementById('sorting-toast');
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc');

    if (!toast || !title || !desc) return;

    if (result.correct) {
      toast.style.borderColor = '#22543D';
      toast.style.background = '#F0FFF4';
      title.style.color = '#22543D';
      title.innerHTML = `🎉 ${result.message}`;
      desc.innerText = result.explanation;
    } else {
      toast.style.borderColor = '#742A2A';
      toast.style.background = '#FFF5F5';
      title.style.color = '#9B2C2C';
      title.innerHTML = `⚠️ ${result.message}`;
      desc.innerText = result.explanation;
    }

    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 4000);
  }
}
