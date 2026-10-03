import { STORAGE_KEY } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const DEFAULT_PROGRESS = {
  version: 1,
  lastPlayed: null,
  chapters: {
    '1': { unlocked: true,  completed: false, bestScore: 0, bestRank: null, bestAccuracy: 0, playCount: 0 },
    '2': { unlocked: false, completed: false, bestScore: 0, bestRank: null, bestAccuracy: 0, playCount: 0 },
    '3': { unlocked: false, completed: false, bestScore: 0, bestRank: null, bestAccuracy: 0, playCount: 0 },
    '4': { unlocked: false, completed: false, bestScore: 0, bestRank: null, bestAccuracy: 0, playCount: 0 },
    '5': { unlocked: false, completed: false, bestScore: 0, bestRank: null, bestAccuracy: 0, playCount: 0 }
  },
  badges: {
    penjaga_kelas:      false,
    jagoan_kantin:      false,
    pelindung_taman:    false,
    ahli_b3:            false,
    penyelamat_sekolah: false,
    master_combo:       false,
    pemilah_sempurna:   false
  },
  knowledgeBook: [],
  settings: {
    sfxVolume:   0.8,
    musicVolume: 0.6,
    showHints:   true
  }
};

export class StorageManager {
  static loadProgress() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return this.resetProgress();
      }
      const parsed = JSON.parse(data);
      if (!parsed.version || !parsed.chapters) {
        logger.warn('StorageManager', 'Corrupted progress detected, reverting to default.');
        return this.resetProgress();
      }
      return parsed;
    } catch (err) {
      logger.error('StorageManager', 'Failed to load progress from localStorage:', err);
      return JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
    }
  }

  static saveProgress(progress) {
    try {
      progress.lastPlayed = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      return true;
    } catch (err) {
      logger.error('StorageManager', 'Failed to save progress to localStorage:', err);
      return false;
    }
  }

  static resetProgress() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_PROGRESS));
    this.saveProgress(fresh);
    return fresh;
  }

  static saveChapterResult(chapterId, { score, rank, accuracy, badgeId }) {
    const prog = this.loadProgress();
    const strId = String(chapterId);
    
    if (!prog.chapters[strId]) {
      prog.chapters[strId] = { unlocked: true, completed: false, bestScore: 0, bestRank: null, bestAccuracy: 0, playCount: 0 };
    }
    
    const entry = prog.chapters[strId];
    entry.playCount++;
    entry.completed = true;
    entry.bestScore = Math.max(entry.bestScore, score);
    
    const rankOrder = { S: 5, A: 4, B: 3, C: 2, GAGAL: 1 };
    if ((rankOrder[rank] || 0) > (rankOrder[entry.bestRank] || 0)) {
      entry.bestRank = rank;
    }
    
    entry.bestAccuracy = Math.max(entry.bestAccuracy, accuracy);

    // Unlock badge if provided
    if (badgeId && prog.badges[badgeId] !== undefined) {
      prog.badges[badgeId] = true;
    }

    // Unlock next chapter if passed
    if (rank !== 'GAGAL') {
      const nextId = String(Number(chapterId) + 1);
      if (prog.chapters[nextId]) {
        prog.chapters[nextId].unlocked = true;
      }
    }

    this.saveProgress(prog);
    return prog;
  }

  static unlockKnowledge(itemId) {
    const prog = this.loadProgress();
    if (!prog.knowledgeBook.includes(itemId)) {
      prog.knowledgeBook.push(itemId);
      this.saveProgress(prog);
    }
  }
}
