import { eventBus } from '../utils/events.js';

export class PausePanel {
  constructor(container) {
    this.container = container;
  }

  show({ onResume, onRestart, onQuit }) {
    const el = document.createElement('div');
    el.id = 'pause-modal';
    el.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 60;" class="interactive-ui">
        <div class="comic-card" style="max-width: 400px; width: 100%; padding: 28px; background: #FFFFFF; text-align: center;">
          <h2 style="font-size: 1.6rem; font-weight: 900; color: #2D3748; margin-bottom: 8px;">
            PERMAINAN DIJEDA ⏸️
          </h2>
          <p style="font-size: 0.85rem; color: #718096; margin-bottom: 24px;">
            Waktu dan gerakan dihentikan sementara.
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button id="btn-pause-resume" class="comic-btn" style="padding: 12px; font-size: 1rem;">
              ▶️ Lanjutkan Permainan
            </button>
            <button id="btn-pause-restart" class="comic-btn secondary" style="padding: 12px; font-size: 1rem;">
              🔄 Ulangi Misi
            </button>
            <button id="btn-pause-quit" style="background: none; border: none; font-weight: 700; color: #718096; padding: 8px; cursor: pointer; text-decoration: underline; font-size: 0.9rem;">
              🏠 Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(el);

    document.getElementById('btn-pause-resume').addEventListener('click', () => {
      this.hide();
      if (onResume) onResume();
    });

    document.getElementById('btn-pause-restart').addEventListener('click', () => {
      this.hide();
      if (onRestart) onRestart();
    });

    document.getElementById('btn-pause-quit').addEventListener('click', () => {
      this.hide();
      if (onQuit) onQuit();
    });
  }

  hide() {
    const el = document.getElementById('pause-modal');
    if (el) el.remove();
  }
}
