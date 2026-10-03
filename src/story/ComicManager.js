import { DIALOGUES } from '../data/dialogues.js';
import { eventBus } from '../utils/events.js';

export class ComicManager {
  constructor(container) {
    this.container = container;
    this.currentChapterId = 1;
    this.panels = [];
    this.currentIndex = 0;
    this.onCompleteCallback = null;
  }

  showIntro(chapterId = 1, onComplete) {
    this.currentChapterId = chapterId;
    this.onCompleteCallback = onComplete;
    this.currentIndex = 0;

    const key = `chapter${chapterId}`;
    this.panels = DIALOGUES[key]?.intro || [];

    if (this.panels.length === 0) {
      if (this.onCompleteCallback) this.onCompleteCallback();
      return;
    }

    this._render();
  }

  _render() {
    const panel = this.panels[this.currentIndex];
    const isFirst = this.currentIndex === 0;
    const isLast = this.currentIndex === this.panels.length - 1;

    const charMeta = this._getCharacterMeta(panel.character);

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50;" class="interactive-ui">
        <div class="comic-card" style="max-width: 620px; width: 100%; padding: 28px; background: #FFFFFF; position: relative;">
          
          <!-- Top Comic Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #CBD5E0; padding-bottom: 12px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: #2D3748; color: #FFF; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 6px;">
                KOMIK CERITA
              </span>
              <span style="font-weight: 800; font-size: 1rem; color: #4A5568;">
                Chapter ${this.currentChapterId}: Kekacauan di Kelas
              </span>
            </div>
            <span style="font-size: 0.85rem; font-weight: bold; color: #718096;">
              Panel ${this.currentIndex + 1} dari ${this.panels.length}
            </span>
          </div>

          <!-- Character Avatar & Speech Bubble -->
          <div style="display: flex; gap: 20px; align-items: flex-start;">
            <!-- Avatar Card -->
            <div style="text-align: center; width: 110px; flex-shrink: 0;">
              <div style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #2D3748; background: ${charMeta.bgColor}; display: flex; align-items: center; justify-content: center; font-size: 2.4rem; margin: 0 auto 8px; box-shadow: 2px 2px 0px #2D3748;">
                ${charMeta.icon}
              </div>
              <div style="font-weight: 800; font-size: 0.95rem; color: #2D3748;">${panel.character}</div>
              <div style="font-size: 0.7rem; color: #718096; font-weight: 600;">${charMeta.role}</div>
            </div>

            <!-- Speech Bubble -->
            <div style="flex: 1; background: #F7FAFC; border: 3px solid #2D3748; border-radius: 16px; padding: 18px 22px; position: relative; box-shadow: 3px 3px 0px #2D3748;">
              <p style="font-size: 1.05rem; line-height: 1.5; color: #1A202C; font-weight: 600; margin-bottom: 10px;">
                "${panel.text}"
              </p>
              ${panel.action ? `
                <div style="font-size: 0.8rem; font-style: italic; color: #718096; background: #EDF2F7; padding: 6px 12px; border-radius: 8px;">
                  🎬 ${panel.action}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Navigation Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 2px solid #E2E8F0;">
            <button id="btn-comic-skip" style="background: none; border: none; font-size: 0.85rem; font-weight: 700; color: #A0AEC0; cursor: pointer; text-decoration: underline;">
              Lewati Cerita ⏩
            </button>

            <div style="display: flex; gap: 10px;">
              ${!isFirst ? `
                <button id="btn-comic-prev" class="comic-btn" style="background: #ED8936; padding: 8px 16px; font-size: 0.9rem;">
                  ⬅️ Kembali
                </button>
              ` : ''}

              <button id="btn-comic-next" class="comic-btn" style="padding: 8px 22px; font-size: 0.9rem;">
                ${isLast ? 'Mulai Briefing Misi 🚀' : 'Berikutnya ➡️'}
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Bind navigation buttons
    const btnNext = document.getElementById('btn-comic-next');
    const btnPrev = document.getElementById('btn-comic-prev');
    const btnSkip = document.getElementById('btn-comic-skip');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (isLast) {
          this._finish();
        } else {
          this.currentIndex++;
          this._render();
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this._render();
        }
      });
    }

    if (btnSkip) {
      btnSkip.addEventListener('click', () => {
        this._finish();
      });
    }
  }

  _finish() {
    this.container.innerHTML = '';
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }

  _getCharacterMeta(name) {
    switch (name) {
      case 'Raka':
        return { icon: '🧢', role: 'Ketua Klub', bgColor: '#C6F6D5' };
      case 'Naya':
        return { icon: '🌿', role: 'Ahli Lingkungan', bgColor: '#BEE3F8' };
      case 'Bimo':
        return { icon: '👓', role: 'Teknisi AI', bgColor: '#FEEBC8' };
      case 'Kacauman':
        return { icon: '🦹', role: 'Sumber Kekacauan', bgColor: '#E9D8FD' };
      default:
        return { icon: '🌱', role: 'Guardian', bgColor: '#EDF2F7' };
    }
  }
}
