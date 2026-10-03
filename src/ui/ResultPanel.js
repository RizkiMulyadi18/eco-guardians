import { BADGES } from '../data/badges.js';

export class ResultPanel {
  constructor(container) {
    this.container = container;
  }

  show(resultData, { onRestart, onNext, onMenu }) {
    const { isSuccess, rank, message, scoreBreakdown, stats, badgeUnlocked, chapter } = resultData;

    const rankColors = {
      S: { bg: '#FEFCBF', border: '#D69E2E', text: '#744210' },
      A: { bg: '#C6F6D5', border: '#38A169', text: '#22543D' },
      B: { bg: '#BEE3F8', border: '#3182CE', text: '#2A4365' },
      C: { bg: '#FEEBC8', border: '#DD6B20', text: '#7B341E' },
      GAGAL: { bg: '#FED7D7', border: '#E53E3E', text: '#742A2A' }
    };

    const rStyle = rankColors[rank] || rankColors.GAGAL;

    // Find badge display name
    const badgeInfo = badgeUnlocked
      ? BADGES.find(b => b.id === badgeUnlocked)
      : null;

    // Dynamic next button text
    const nextChapterId = chapter.id + 1;
    const hasNext = nextChapterId <= 5;
    const nextBtnText = isSuccess
      ? (hasNext ? `🚀 Lanjut ke Chapter ${nextChapterId}` : '🗺️ Kembali ke Peta')
      : '';

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 60;" class="interactive-ui">
        <div class="comic-card" style="max-width: 580px; width: 100%; padding: 32px; background: #FFFFFF; text-align: center; position: relative;">
          
          <!-- Large Rank Stamp Badge -->
          <div style="display: inline-block; background: ${rStyle.bg}; border: 4px solid ${rStyle.border}; color: ${rStyle.text}; padding: 8px 36px; border-radius: 16px; margin-bottom: 12px; box-shadow: 4px 4px 0px #2D3748; transform: rotate(-2deg);">
            <div style="font-size: 0.8rem; font-weight: 900; letter-spacing: 2px;">PERINGKAT</div>
            <div style="font-size: 2.8rem; font-weight: 900; line-height: 1;">${rank}</div>
          </div>

          <h2 style="font-size: 1.6rem; font-weight: 900; color: #2D3748; margin-bottom: 4px;">
            ${isSuccess ? '🎉 MISI BERHASIL DISELESAIKAN!' : '⚠️ MISI BELUM TUNTAS'}
          </h2>
          <p style="font-size: 0.8rem; font-weight: 700; color: #718096; margin-bottom: 4px;">
            Chapter ${chapter.id}: ${chapter.title}
          </p>
          <p style="font-size: 0.85rem; color: #718096; margin-bottom: 20px; max-width: 440px; margin-left: auto; margin-right: auto;">
            ${message}
          </p>

          <!-- Score Breakdown Card -->
          <div style="background: #F7FAFC; border: 2px solid #CBD5E0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 800; color: #718096; font-size: 0.85rem;">SKOR AKHIR</span>
              <span style="font-weight: 900; color: #2B6CB0; font-size: 1.8rem; line-height: 1;">${scoreBreakdown.finalScore.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #A0AEC0; border-top: 1px dashed #E2E8F0; padding-top: 6px;">
              <span>Skor Murni: ${scoreBreakdown.baseTotalScore}</span>
              <span>Bonus Waktu: +${scoreBreakdown.timeBonus}</span>
              <span>Bonus Kelulusan: +${scoreBreakdown.completionBonus}</span>
            </div>
          </div>

          <!-- Statistics Grid -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px;">
            <div style="background: #EDF2F7; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">AKURASI</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #2D3748;">${stats.accuracy}%</div>
            </div>
            <div style="background: #EDF2F7; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">TERPILAH</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #38A169;">${stats.correct}/${stats.total}</div>
            </div>
            <div style="background: #EDF2F7; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">MAX COMBO</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #D69E2E;">x${stats.maxCombo}</div>
            </div>
            <div style="background: #EDF2F7; border-radius: 8px; padding: 8px;">
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">SISA WAKTU</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #3182CE;">${stats.timeRemaining}s</div>
            </div>
          </div>

          <!-- Badge Unlock Banner -->
          ${badgeInfo ? `
            <div style="background: #FFFDF5; border: 2px dashed #ECC94B; border-radius: 12px; padding: 10px 16px; margin-bottom: 22px; display: flex; align-items: center; gap: 12px; text-align: left;">
              <span style="font-size: 2rem;">🏅</span>
              <div>
                <div style="font-size: 0.7rem; font-weight: 800; color: #B7791F;">LENCANA RESMI TERBUKA!</div>
                <div style="font-size: 0.95rem; font-weight: 900; color: #744210;">${badgeInfo.name}</div>
                <div style="font-size: 0.75rem; color: #975A16;">${badgeInfo.description}</div>
              </div>
            </div>
          ` : ''}

          <!-- Action Buttons -->
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-result-restart" class="comic-btn secondary" style="padding: 10px 20px; font-size: 0.95rem;">
              🔄 Ulangi Misi
            </button>
            ${isSuccess ? `
              <button id="btn-result-next" class="comic-btn" style="padding: 10px 24px; font-size: 0.95rem;">
                ${nextBtnText}
              </button>
            ` : ''}
            <button id="btn-result-menu" style="background: #EDF2F7; border: 2px solid #CBD5E0; border-radius: 10px; font-weight: 800; color: #4A5568; padding: 10px 16px; cursor: pointer;">
              🏠 Menu
            </button>
          </div>

        </div>
      </div>
    `;

    document.getElementById('btn-result-restart').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (onRestart) onRestart();
    });

    const btnNext = document.getElementById('btn-result-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.container.innerHTML = '';
        if (onNext) onNext();
      });
    }

    document.getElementById('btn-result-menu').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (onMenu) onMenu();
    });
  }
}
