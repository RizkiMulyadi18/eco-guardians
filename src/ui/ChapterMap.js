import { StorageManager } from '../storage/StorageManager.js';
import { CHAPTERS } from '../data/chapters.js';

export class ChapterMap {
  constructor(container) {
    this.container = container;
  }

  show({ onSelectChapter, onBack }) {
    const progress = StorageManager.loadProgress();

    const locationEmojis = {
      classroom: '🏫', cafeteria: '🍽️', garden: '🌿',
      laboratory: '🧪', field: '🏟️'
    };

    const locationColors = {
      classroom: '#4299E1', cafeteria: '#ED8936', garden: '#48BB78',
      laboratory: '#9F7AEA', field: '#F56565'
    };

    const getStars = (rank) => {
      if (rank === 'S') return '⭐⭐⭐';
      if (rank === 'A') return '⭐⭐';
      if (rank === 'B') return '⭐';
      return '☆☆☆';
    };

    const rankColors = {
      S: { bg: '#FEFCBF', border: '#D69E2E', text: '#744210' },
      A: { bg: '#C6F6D5', border: '#38A169', text: '#22543D' },
      B: { bg: '#BEE3F8', border: '#3182CE', text: '#2A4365' },
      C: { bg: '#FEEBC8', border: '#DD6B20', text: '#7B341E' }
    };

    const cardsHtml = CHAPTERS.map((ch, index) => {
      const prog = progress.chapters[String(ch.id)] || { unlocked: ch.id === 1, completed: false, bestScore: 0, bestRank: null };
      const isLocked = !prog.unlocked;
      const isCompleted = prog.completed;
      const emoji = locationEmojis[ch.location] || '📍';
      const locColor = locationColors[ch.location] || '#4A5568';
      const rStyle = rankColors[prog.bestRank] || null;

      // Alternating left/right offset for path effect
      const offsetX = index % 2 === 0 ? '-30px' : '30px';

      return `
        <!-- Path connector line -->
        ${index > 0 ? `
          <div style="width: 4px; height: 36px; border-left: 4px dashed #CBD5E0; margin-left: calc(50% + ${index % 2 === 0 ? '30px' : '-30px'}); transition: margin-left 0.3s;"></div>
        ` : ''}
        
        <!-- Chapter Card -->
        <div class="comic-card" id="chapter-card-${ch.id}"
             style="
               max-width: 380px; width: 100%; padding: 16px 18px;
               display: flex; align-items: center; gap: 14px;
               position: relative; transform: translateX(${offsetX});
               ${isLocked ? 'filter: grayscale(80%); opacity: 0.6; cursor: not-allowed;' : 'cursor: pointer;'}
               ${!isLocked && !isCompleted ? 'animation: pulse 2s infinite;' : ''}
               transition: transform 0.2s;
             ">
          
          <!-- Location Icon Circle -->
          <div style="
            width: 56px; height: 56px; border-radius: 50%;
            background: ${isLocked ? '#CBD5E0' : locColor};
            display: flex; align-items: center; justify-content: center;
            font-size: 1.6rem; flex-shrink: 0;
            border: 3px solid ${isLocked ? '#A0AEC0' : '#2D3748'};
            box-shadow: 2px 2px 0px ${isLocked ? '#A0AEC0' : '#2D3748'};
          ">
            ${isLocked ? '🔒' : emoji}
          </div>

          <!-- Chapter Info -->
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.7rem; font-weight: 800; color: #718096; text-transform: uppercase;">
              Chapter ${ch.id}
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #2D3748; line-height: 1.2; margin-bottom: 4px;">
              ${ch.title}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 0.7rem; color: #A0AEC0; font-weight: 700;">
                ⏱️ ${ch.duration}s · 📦 ${ch.targetObjects} objek · 🎯 ${ch.targetAccuracy}%
              </span>
            </div>
            ${isCompleted ? `
              <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                <span style="font-size: 0.85rem;">${getStars(prog.bestRank)}</span>
                <span style="font-size: 0.75rem; font-weight: 800; color: #4A5568;">Skor: ${prog.bestScore.toLocaleString()}</span>
              </div>
            ` : ''}
          </div>

          <!-- Rank Badge (if completed) -->
          ${isCompleted && rStyle ? `
            <div style="
              position: absolute; top: -10px; right: -6px;
              background: ${rStyle.bg}; border: 3px solid ${rStyle.border};
              color: ${rStyle.text}; padding: 2px 10px; border-radius: 8px;
              font-size: 1.2rem; font-weight: 900;
              box-shadow: 2px 2px 0px #2D3748; transform: rotate(6deg);
            ">${prog.bestRank}</div>
          ` : ''}

          <!-- Lock overlay -->
          ${isLocked ? `
            <div style="
              position: absolute; top: 0; left: 0; width: 100%; height: 100%;
              display: flex; align-items: center; justify-content: center;
              border-radius: inherit; font-size: 0.75rem; font-weight: 800; color: #718096;
            ">
              Selesaikan Chapter ${ch.unlockAfter} dulu
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(180deg, #E6FFFA 0%, #EBF8FF 40%, #F7FAFC 100%); display: flex; flex-direction: column; align-items: center; z-index: 50; overflow-y: auto;" class="interactive-ui">
        
        <!-- Header -->
        <div style="text-align: center; padding: 28px 20px 16px; width: 100%;">
          <div style="font-size: 2rem; margin-bottom: 4px;">🗺️</div>
          <h2 style="font-size: 1.8rem; font-weight: 900; color: #2D3748; margin: 0 0 4px;">
            PETA SEKOLAH
          </h2>
          <p style="font-size: 0.85rem; color: #718096; font-weight: 700;">
            Pilih area yang ingin dibersihkan
          </p>
        </div>

        <!-- Chapter Path -->
        <div style="display: flex; flex-direction: column; align-items: center; padding: 10px 20px 30px; width: 100%; max-width: 480px;">
          ${cardsHtml}
        </div>

        <!-- Back Button -->
        <div style="padding: 10px 20px 36px; text-align: center;">
          <button id="btn-map-back" class="comic-btn secondary" style="padding: 12px 32px; font-size: 1rem;">
            🏠 Kembali ke Menu
          </button>
        </div>
      </div>
    `;

    // Event: click on unlocked chapter card
    CHAPTERS.forEach(ch => {
      const prog = progress.chapters[String(ch.id)];
      if (prog && prog.unlocked) {
        const card = document.getElementById(`chapter-card-${ch.id}`);
        if (card) {
          card.addEventListener('click', () => {
            this.container.innerHTML = '';
            if (onSelectChapter) onSelectChapter(ch.id);
          });
          // Hover effect
          card.addEventListener('mouseenter', () => { card.style.transform = `translateX(${ch.id % 2 === 1 ? '-30px' : '30px'}) scale(1.04)`; });
          card.addEventListener('mouseleave', () => { card.style.transform = `translateX(${ch.id % 2 === 1 ? '-30px' : '30px'}) scale(1.0)`; });
        }
      }
    });

    // Event: back button
    document.getElementById('btn-map-back').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (onBack) onBack();
    });
  }
}
