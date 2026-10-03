import { StorageManager } from '../storage/StorageManager.js';
import { TRASH_ITEMS } from '../data/trashItems.js';

export class KnowledgeBook {
  constructor(container) {
    this.container = container;
    this.activeTab = 'all';
    this.discoveredIds = [];
    this.onBack = null;
  }

  show({ onBack }) {
    this.onBack = onBack;
    const progress = StorageManager.loadProgress();
    this.discoveredIds = progress.knowledgeBook || [];
    this._render();
  }

  _render() {
    const filteredItems = this.activeTab === 'all'
      ? TRASH_ITEMS.filter(i => i.bookEntry)
      : TRASH_ITEMS.filter(i => i.bookEntry && i.category === this.activeTab);

    const discoveredCount = this.discoveredIds.length;
    const totalCount = TRASH_ITEMS.filter(i => i.bookEntry).length;

    const tabs = [
      { id: 'all', label: 'Semua', color: '#4A5568', activeColor: '#2D3748' },
      { id: 'organik', label: '🌿 Organik', color: '#C6F6D5', activeColor: '#38A169' },
      { id: 'anorganik', label: '♻️ Anorganik', color: '#BEE3F8', activeColor: '#3182CE' },
      { id: 'b3', label: '☢️ B3', color: '#FED7D7', activeColor: '#E53E3E' }
    ];

    const categoryColors = {
      organik: { bg: '#F0FFF4', border: '#38A169', badge: '#C6F6D5', text: '#22543D' },
      anorganik: { bg: '#EBF8FF', border: '#3182CE', badge: '#BEE3F8', text: '#2A4365' },
      b3: { bg: '#FFF5F5', border: '#E53E3E', badge: '#FED7D7', text: '#742A2A' }
    };

    const tabsHtml = tabs.map(tab => `
      <button class="kb-tab" data-tab="${tab.id}" style="
        padding: 8px 16px; border-radius: 8px; cursor: pointer;
        font-size: 0.8rem; font-weight: 800; border: 2px solid #2D3748;
        transition: all 0.2s;
        ${this.activeTab === tab.id
          ? `background: ${tab.activeColor}; color: #FFF; box-shadow: 2px 2px 0px #2D3748;`
          : `background: ${tab.color}; color: #2D3748;`
        }
      ">${tab.label}</button>
    `).join('');

    const itemsHtml = filteredItems.map(item => {
      const isDiscovered = this.discoveredIds.includes(item.id);
      const catStyle = categoryColors[item.category] || categoryColors.organik;

      if (!isDiscovered) {
        return `
          <div class="comic-card" style="padding: 14px 16px; display: flex; align-items: center; gap: 12px; background: #EDF2F7; opacity: 0.7;">
            <div style="
              width: 44px; height: 44px; border-radius: 50%;
              background: #CBD5E0; border: 2px dashed #A0AEC0;
              display: flex; align-items: center; justify-content: center;
              font-size: 1.3rem; flex-shrink: 0;
            ">🔒</div>
            <div style="flex: 1;">
              <div style="font-size: 1rem; font-weight: 900; color: #A0AEC0;">???</div>
              <div style="font-size: 0.7rem; color: #CBD5E0; font-weight: 700;">Pilah sampah ini dengan benar untuk membuka!</div>
            </div>
            <span style="
              font-size: 0.65rem; font-weight: 800; padding: 3px 8px;
              border-radius: 6px; background: #E2E8F0; color: #A0AEC0;
              text-transform: uppercase;
            ">${item.category}</span>
          </div>
        `;
      }

      return `
        <div class="comic-card" style="padding: 14px 16px; background: ${catStyle.bg}; border-color: ${catStyle.border};">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <div style="
              width: 44px; height: 44px; border-radius: 50%;
              background: ${item.color}; border: 3px solid #2D3748;
              flex-shrink: 0; box-shadow: 2px 2px 0px #2D3748;
            "></div>
            <div style="flex: 1;">
              <div style="font-size: 1.05rem; font-weight: 900; color: #2D3748;">${item.name}</div>
            </div>
            <span style="
              font-size: 0.65rem; font-weight: 800; padding: 3px 8px;
              border-radius: 6px; background: ${catStyle.badge}; color: ${catStyle.text};
              text-transform: uppercase; border: 1px solid ${catStyle.border};
            ">${item.category}</span>
          </div>
          <p style="font-size: 0.82rem; line-height: 1.5; color: #4A5568; margin: 0; padding-left: 56px;">
            ${item.explanation}
          </p>
        </div>
      `;
    }).join('');

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 60;" class="interactive-ui">
        <div style="
          max-width: 560px; width: 100%; max-height: 92vh;
          background: #FFFDF5; border: 4px solid #2D3748;
          border-radius: 16px; box-shadow: 6px 6px 0px #2D3748;
          display: flex; flex-direction: column; overflow: hidden;
        ">
          <!-- Header -->
          <div style="background: #ECC94B; padding: 20px; border-bottom: 4px solid #2D3748; text-align: center;">
            <div style="font-size: 1.8rem; font-weight: 900; color: #2D3748; margin-bottom: 4px;">
              📚 Buku Pengetahuan Eco
            </div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #744210;">
              Ensiklopedia Sampah yang Sudah Kamu Pelajari
            </div>
            <div style="
              display: inline-block; margin-top: 12px;
              background: #FFF; border: 2px solid #2D3748; border-radius: 20px;
              padding: 4px 16px; font-weight: 800; font-size: 0.8rem; color: #2D3748;
            ">
              🔍 ${discoveredCount} / ${totalCount} item ditemukan
            </div>
          </div>

          <!-- Tabs -->
          <div style="padding: 12px 16px; border-bottom: 2px solid #E2E8F0; display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">
            ${tabsHtml}
          </div>

          <!-- Scrollable Content -->
          <div style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; background: #F7FAFC;">
            ${itemsHtml || '<p style="text-align: center; font-weight: 800; color: #A0AEC0; padding: 30px;">Tidak ada item di kategori ini.</p>'}
          </div>

          <!-- Footer -->
          <div style="padding: 14px; border-top: 4px solid #2D3748; background: #FFF; text-align: center;">
            <button id="btn-kb-back" class="comic-btn secondary" style="padding: 10px 28px; font-size: 0.95rem;">
              🏠 Kembali
            </button>
          </div>
        </div>
      </div>
    `;

    // Tab switching
    this.container.querySelectorAll('.kb-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.dataset.tab;
        this._render();
      });
    });

    // Back button
    document.getElementById('btn-kb-back').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (this.onBack) this.onBack();
    });
  }
}
