import { eventBus } from '../utils/events.js';

export class InteractionHUD {
  constructor(container) {
    this.container = container;
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.feedbackTimeout = null;
  }

  mount() {
    const hudEl = document.createElement('div');
    hudEl.id = 'interaction-hud';
    hudEl.innerHTML = `
      <!-- Top Center Score & Stats -->
      <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 14px;" class="interactive-ui">
        <div class="comic-card" style="padding: 10px 22px; text-align: center; min-width: 140px;">
          <div style="font-size: 0.75rem; color: #718096; font-weight: bold; text-transform: uppercase;">SKOR TOTAL</div>
          <div id="hud-score" style="font-size: 1.6rem; font-weight: 900; color: #2B6CB0;">0</div>
        </div>

        <div class="comic-card" style="padding: 10px 20px; text-align: center; min-width: 110px;">
          <div style="font-size: 0.75rem; color: #718096; font-weight: bold; text-transform: uppercase;">BENAR</div>
          <div id="hud-correct" style="font-size: 1.6rem; font-weight: 900; color: #38A169;">0</div>
        </div>

        <div class="comic-card" style="padding: 10px 20px; text-align: center; min-width: 110px;">
          <div style="font-size: 0.75rem; color: #718096; font-weight: bold; text-transform: uppercase;">SALAH</div>
          <div id="hud-wrong" style="font-size: 1.6rem; font-weight: 900; color: #E53E3E;">0</div>
        </div>
      </div>

      <!-- Feedback Toast Notification Area (Pop-up Banner) -->
      <div id="sorting-toast" class="comic-card interactive-ui" style="position: absolute; top: 110px; left: 50%; transform: translateX(-50%) scale(0.9); opacity: 0; pointer-events: none; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: 520px; width: 90%; text-align: center; padding: 16px 24px; z-index: 100;">
        <div id="toast-title" style="font-size: 1.25rem; font-weight: 900; margin-bottom: 6px;"></div>
        <div id="toast-desc" style="font-size: 0.85rem; line-height: 1.4; color: #4A5568;"></div>
      </div>

      <!-- Bottom Hint Bar -->
      <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); text-align: center;" class="interactive-ui">
        <div class="comic-card" style="padding: 10px 24px; display: inline-flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.1rem;">💡</span>
          <span id="instruction-text" style="font-size: 0.9rem; font-weight: 700; color: #2D3748;">
            Jepit (pinch) sampah di meja, lalu seret ke tempat sampah yang sesuai: 
            <span style="color: #38A169;">Hijau (Organik)</span> | 
            <span style="color: #D69E2E;">Kuning (Anorganik)</span> | 
            <span style="color: #E53E3E;">Merah (B3)</span>
          </span>
        </div>
      </div>
    `;

    this.container.appendChild(hudEl);
    this._setupListeners();
  }

  _setupListeners() {
    eventBus.on('sorting:result', (result) => {
      this.showFeedback(result);
    });

    eventBus.on('trash:picked', (trashData) => {
      const hint = document.getElementById('instruction-text');
      if (hint) {
        hint.innerHTML = `Membawa: <b>${trashData.name}</b> (${trashData.category.toUpperCase()}). Masukkan ke tempat yang benar!`;
      }
    });

    eventBus.on('trash:released_miss', () => {
      const hint = document.getElementById('instruction-text');
      if (hint) {
        hint.innerHTML = `Sampah dilepas di luar tempat sampah. Memantul kembali ke meja!`;
      }
    });
  }

  showFeedback(result) {
    const toast = document.getElementById('sorting-toast');
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc');
    const scoreEl = document.getElementById('hud-score');
    const correctEl = document.getElementById('hud-correct');
    const wrongEl = document.getElementById('hud-wrong');

    if (!toast) return;

    if (result.correct) {
      this.score += result.scoreGained;
      this.correctCount++;
      toast.style.borderColor = '#22543D';
      toast.style.background = '#F0FFF4';
      title.style.color = '#22543D';
      title.innerHTML = `🎉 ${result.message}`;
      desc.innerText = result.explanation;
    } else {
      this.score = Math.max(0, this.score - result.scorePenalty);
      this.wrongCount++;
      toast.style.borderColor = '#742A2A';
      toast.style.background = '#FFF5F5';
      title.style.color = '#9B2C2C';
      title.innerHTML = `⚠️ ${result.message}`;
      desc.innerText = result.explanation;
    }

    if (scoreEl) scoreEl.innerText = this.score;
    if (correctEl) correctEl.innerText = this.correctCount;
    if (wrongEl) wrongEl.innerText = this.wrongCount;

    // Show animation
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) scale(1)';

    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) scale(0.9)';
    }, 4500);
  }
}
