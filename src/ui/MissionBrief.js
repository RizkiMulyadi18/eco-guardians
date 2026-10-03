import { CHAPTERS } from '../data/chapters.js';
import { DIALOGUES } from '../data/dialogues.js';

export class MissionBrief {
  constructor(container) {
    this.container = container;
    this.onStartCallback = null;
  }

  show(chapterId = 1, onStart) {
    this.onStartCallback = onStart;
    const chapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];

    const locationNames = {
      classroom: 'Ruang Kelas VII',
      cafeteria: 'Kantin Sekolah',
      garden: 'Taman Sekolah',
      laboratory: 'Laboratorium IPA',
      field: 'Lapangan Utama'
    };

    // Category badges
    const categoryBadges = [];
    if (chapter.categories.includes('organik')) {
      categoryBadges.push('<span style="color: #38A169; font-weight: 800;">🟢 Organik</span>');
    }
    if (chapter.categories.includes('anorganik')) {
      categoryBadges.push('<span style="color: #3182CE; font-weight: 800;">🟡 Anorganik</span>');
    }
    if (chapter.categories.includes('b3')) {
      categoryBadges.push('<span style="color: #E53E3E; font-weight: 800;">🔴 B3</span>');
    }

    // Special condition text
    let specialCondition = '';
    if (chapter.minCombo) {
      specialCondition = `<div style="font-size: 0.75rem; color: #D69E2E; font-weight: 800; margin-top: 2px;">⚡ Wajib Combo x${chapter.minCombo}!</div>`;
    } else if (chapter.minCleanliness) {
      specialCondition = `<div style="font-size: 0.75rem; color: #38A169; font-weight: 800; margin-top: 2px;">🌿 Kebersihan ≥ ${chapter.minCleanliness}%!</div>`;
    } else if (chapter.maxMistakes !== null && chapter.maxMistakes !== undefined) {
      specialCondition = `<div style="font-size: 0.75rem; color: #E53E3E; font-weight: 800; margin-top: 2px;">⚠️ Maks. ${chapter.maxMistakes} Kesalahan!</div>`;
    } else if (chapter.phases) {
      specialCondition = `<div style="font-size: 0.75rem; color: #805AD5; font-weight: 800; margin-top: 2px;">🔥 3 Fase Berurutan!</div>`;
    }

    // Briefing dialog tip
    const chapterKey = `chapter${chapter.id}`;
    const briefDialog = DIALOGUES[chapterKey]?.briefing || {
      character: 'Raka',
      text: 'Jepit sampah dengan gerakan pinch, lalu bawa ke tempat sampah yang warnanya cocok.'
    };

    const characterAvatars = {
      Raka: '🧢',
      Naya: '🌿',
      Bimo: '👓',
      Kacauman: '🦹'
    };

    const avatar = characterAvatars[briefDialog.character] || '💡';

    this.container.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.75); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50;" class="interactive-ui">
        <div class="comic-card" style="max-width: 580px; width: 100%; padding: 28px; background: #FFFFFF; position: relative;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="display: inline-block; background: #48BB78; color: #FFF; font-weight: 800; font-size: 0.8rem; padding: 4px 12px; border-radius: 20px; border: 2px solid #2D3748; margin-bottom: 8px;">
              BRIEFING MISI SEKOLAH HIJAU
            </span>
            <h1 style="font-size: 1.5rem; font-weight: 900; color: #2D3748; margin-bottom: 4px;">
              Chapter ${chapter.id}: ${chapter.title}
            </h1>
            <p style="font-size: 0.85rem; color: #718096; font-weight: 700;">
              📍 Lokasi: ${locationNames[chapter.location] || chapter.location}
            </p>
          </div>

          <!-- Mission Requirements Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="background: #F7FAFC; border: 2px solid #CBD5E0; border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #718096;">TARGET SAMPAH</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: #2B6CB0;">${chapter.targetObjects} Objek</div>
            </div>

            <div style="background: #F7FAFC; border: 2px solid #CBD5E0; border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #718096;">DURASI MISI</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: #DD6B20;">${chapter.duration} Detik</div>
            </div>

            <div style="background: #F7FAFC; border: 2px solid #CBD5E0; border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #718096;">KATEGORI AKTIF</div>
              <div style="font-size: 0.85rem; font-weight: 800; color: #2D3748; margin-top: 4px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                ${categoryBadges.join(' & ')}
              </div>
            </div>

            <div style="background: #F7FAFC; border: 2px solid #CBD5E0; border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 0.75rem; font-weight: 800; color: #718096;">SYARAT KELULUSAN</div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #38A169;">≥ ${chapter.targetAccuracy}% Akurasi</div>
              ${specialCondition}
            </div>
          </div>

          <!-- Mission Tip Box -->
          <div style="background: #EDFDFD; border: 2px solid #81E6D9; border-radius: 12px; padding: 12px 16px; margin-bottom: 24px; display: flex; align-items: flex-start; gap: 12px;">
            <span style="font-size: 1.8rem; line-height: 1;">${avatar}</span>
            <div>
              <div style="font-size: 0.8rem; font-weight: 900; color: #234E52; margin-bottom: 2px;">
                Petunjuk ${briefDialog.character}:
              </div>
              <p style="font-size: 0.82rem; color: #285E61; line-height: 1.4; font-weight: 600; margin: 0;">
                "${briefDialog.text}"
              </p>
            </div>
          </div>

          <!-- Start Button -->
          <button id="btn-start-mission" class="comic-btn" style="width: 100%; font-size: 1.15rem; padding: 14px; text-align: center;">
            🚀 Mulai Memilah Sampah!
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-start-mission').addEventListener('click', () => {
      this.container.innerHTML = '';
      if (this.onStartCallback) this.onStartCallback();
    });
  }
}
