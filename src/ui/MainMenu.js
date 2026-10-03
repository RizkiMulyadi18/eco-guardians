import { StorageManager } from '../storage/StorageManager.js';
import { BADGES } from '../data/badges.js';
import { CHAPTERS } from '../data/chapters.js';

export class MainMenu {
  constructor(container) {
    this.container = container;
  }

  show({ onStartGame, onOpenMap, onOpenKnowledgeBook }) {
    const progress = StorageManager.loadProgress();
    const completedCount = Object.values(progress.chapters).filter(c => c.completed).length;
    const unlockedCount = Object.values(progress.chapters).filter(c => c.unlocked).length;
    const badgeCount = Object.values(progress.badges).filter(Boolean).length;
    const knowledgeCount = (progress.knowledgeBook || []).length;

    // Determine the next playable chapter
    const nextChapter = CHAPTERS.find(ch => {
      const chProg = progress.chapters[String(ch.id)];
      return chProg && chProg.unlocked && !chProg.completed;
    }) || CHAPTERS[0];

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 40;" class="interactive-ui">
        <div class="comic-card" style="max-width: 520px; width: 100%; padding: 36px 28px; background: #FFFFFF; text-align: center;">
          
          <!-- Logo & Header -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 3rem; margin-bottom: 6px;">🌿</div>
            <h1 style="font-size: 2.1rem; font-weight: 900; color: #2D3748; line-height: 1.1; margin-bottom: 6px;">
              ECO GUARDIANS
            </h1>
            <p style="font-size: 1rem; font-weight: 700; color: #48BB78; letter-spacing: 1px;">
              MISI RAHASIA SEKOLAH HIJAU
            </p>
            <p style="font-size: 0.8rem; color: #A0AEC0; margin-top: 4px;">
              Game Edukasi 3D Pemilahan Sampah Berbasis Hand Tracking
            </p>
          </div>

          <!-- Progress Overview Card -->
          <div style="background: #F7FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <div>
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">CHAPTER</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #2B6CB0;">${completedCount} / 5</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">LENCANA</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #D69E2E;">${badgeCount} / ${BADGES.length} 🏆</div>
            </div>
            <div>
              <div style="font-size: 0.65rem; font-weight: 800; color: #718096;">ENSIKLOPEDIA</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #48BB78;">${knowledgeCount} / 12 📚</div>
            </div>
          </div>

          <!-- Main Play Button -->
          <button id="btn-menu-play" class="comic-btn" style="width: 100%; font-size: 1.25rem; padding: 16px; margin-bottom: 10px;">
            🚀 MAINKAN CHAPTER ${nextChapter.id}: ${nextChapter.title}
          </button>

          <!-- Secondary Action Buttons -->
          <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 14px;">
            <button id="btn-menu-map" class="comic-btn secondary" style="flex: 1; padding: 10px 12px; font-size: 0.85rem;">
              🗺️ Peta Chapter
            </button>
            <button id="btn-menu-knowledge" class="comic-btn secondary" style="flex: 1; padding: 10px 12px; font-size: 0.85rem;">
              📚 Buku Pengetahuan
            </button>
          </div>

          <!-- Reset -->
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button id="btn-menu-reset" style="background: #EDF2F7; border: 2px solid #CBD5E0; border-radius: 8px; padding: 8px 14px; font-size: 0.75rem; font-weight: 700; color: #718096; cursor: pointer;">
              🔄 Reset Progres
            </button>
          </div>

          <div style="margin-top: 24px; font-size: 0.7rem; color: #CBD5E0;">
            Versi 2.0 (Fase 5) — Teknik Informatika Universitas Malikussaleh
          </div>
        </div>
      </div>
    `;

    // Play Button → Start next available chapter
    document.getElementById('btn-menu-play').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (onStartGame) onStartGame(nextChapter.id);
    });

    // Map Button
    document.getElementById('btn-menu-map').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (onOpenMap) onOpenMap();
    });

    // Knowledge Book Button
    document.getElementById('btn-menu-knowledge').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (onOpenKnowledgeBook) onOpenKnowledgeBook();
    });

    // Reset Button
    document.getElementById('btn-menu-reset').addEventListener('click', () => {
      if (confirm('Apakah kamu yakin ingin mereset seluruh progres permainan?')) {
        StorageManager.resetProgress();
        this.show({ onStartGame, onOpenMap, onOpenKnowledgeBook });
      }
    });
  }
}
