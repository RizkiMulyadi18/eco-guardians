import { CHAPTERS } from '../data/chapters.js';
import { StorageManager } from '../storage/StorageManager.js';
import { eventBus } from '../utils/events.js';
import { logger } from '../utils/logger.js';

export class MissionManager {
  constructor({ scoreManager, comboManager, healthManager, timerManager, cleanlinessManager, trashManager, powerUpManager }) {
    this.scoreManager = scoreManager;
    this.comboManager = comboManager;
    this.healthManager = healthManager;
    this.timerManager = timerManager;
    this.cleanlinessManager = cleanlinessManager;
    this.trashManager = trashManager;
    this.powerUpManager = powerUpManager; // Can be null initially

    this.activeChapter = CHAPTERS[0]; // Chapter 1 default
    this.isMissionActive = false;
    this.isFinished = false;
    this.reachedMinCombo = false; // Tracks whether minCombo condition was met
    this.mistakeCount = 0; // For maxMistakes condition (Ch4)

    this._setupListeners();
  }

  _setupListeners() {
    // 1. Handle sorting results
    eventBus.on('sorting:result', (result) => {
      if (!this.isMissionActive || this.isFinished) return;

      if (result.correct) {
        const mult = this.comboManager.onCorrect();
        this.scoreManager.onCorrect(mult);
        this.cleanlinessManager.onCorrect();

        // Unlock knowledge book entry for correctly sorted item
        if (result.trash && result.trash.id) {
          StorageManager.unlockKnowledge(result.trash.id);
        }
      } else {
        // Check if shield is active (Power-Up)
        if (this.powerUpManager && this.powerUpManager.isShieldActive()) {
          this.powerUpManager.consumeShield();
          this.comboManager.onWrong();
          this.scoreManager.onWrong();
          this.cleanlinessManager.onWrong();
          // Shield absorbed the life loss!
          logger.info('MissionManager', 'Shield absorbed damage!');
        } else {
          this.comboManager.onWrong();
          this.scoreManager.onWrong();
          this.cleanlinessManager.onWrong();
          this.healthManager.takeDamage(1);
        }

        // Track mistakes for maxMistakes condition (Chapter 4)
        this.mistakeCount++;
        if (this.activeChapter.maxMistakes !== null && this.mistakeCount > this.activeChapter.maxMistakes) {
          this._endMission(false, `Terlalu banyak kesalahan! Melebihi batas maksimal ${this.activeChapter.maxMistakes} kesalahan di chapter ini.`);
        }
      }
    });

    // 2. Handle health depleted
    eventBus.on('health:empty', () => {
      if (!this.isMissionActive || this.isFinished) return;
      this._endMission(false, 'Nyawa habis! Hindari membuang sampah sembarangan.');
    });

    // 3. Handle timer expired
    eventBus.on('timer:end', () => {
      if (!this.isMissionActive || this.isFinished) return;
      
      const accuracy = this.scoreManager.accuracy;
      const targetAcc = this.activeChapter.targetAccuracy || 70;

      // Check minCombo condition (Chapter 2)
      if (this.activeChapter.minCombo !== null && !this.reachedMinCombo) {
        this._endMission(false, `Waktu habis! Kamu belum mencapai combo x${this.activeChapter.minCombo}. Jaga ritme pilah untuk membangun combo!`);
        return;
      }

      // Check minCleanliness condition (Chapter 3)
      if (this.activeChapter.minCleanliness !== null) {
        const cleanliness = this.cleanlinessManager.getPercentage();
        if (cleanliness < this.activeChapter.minCleanliness) {
          this._endMission(false, `Waktu habis! Kebersihan (${cleanliness}%) di bawah target minimum ${this.activeChapter.minCleanliness}%.`);
          return;
        }
      }

      if (accuracy >= targetAcc && this.healthManager.isAlive()) {
        this._endMission(true, 'Waktu habis, namun target akurasi pemilahan tercapai!');
      } else {
        this._endMission(false, `Waktu habis! Akurasi (${accuracy}%) belum mencapai target minimal ${targetAcc}%.`);
      }
    });

    // 4. Handle all objects in chapter queue processed
    eventBus.on('mission:all_objects_done', () => {
      if (!this.isMissionActive || this.isFinished) return;

      const accuracy = this.scoreManager.accuracy;
      const targetAcc = this.activeChapter.targetAccuracy || 70;

      // Check minCombo condition (Chapter 2)
      if (this.activeChapter.minCombo !== null && !this.reachedMinCombo) {
        this._endMission(false, `Semua sampah diproses, tetapi kamu belum mencapai combo x${this.activeChapter.minCombo}!`);
        return;
      }

      // Check minCleanliness condition (Chapter 3)
      if (this.activeChapter.minCleanliness !== null) {
        const cleanliness = this.cleanlinessManager.getPercentage();
        if (cleanliness < this.activeChapter.minCleanliness) {
          this._endMission(false, `Semua sampah diproses, tetapi kebersihan (${cleanliness}%) di bawah target ${this.activeChapter.minCleanliness}%.`);
          return;
        }
      }

      if (accuracy >= targetAcc && this.healthManager.isAlive()) {
        this._endMission(true, 'Semua sampah di area berhasil dibersihkan dengan cemerlang!');
      } else {
        this._endMission(false, `Semua sampah diproses, tetapi akurasi (${accuracy}%) di bawah batas kelulusan ${targetAcc}%.`);
      }
    });

    // 5. Track combo for minCombo condition
    eventBus.on('combo:level_up', ({ multiplier }) => {
      if (!this.isMissionActive || this.isFinished) return;
      if (this.activeChapter.minCombo !== null && multiplier >= this.activeChapter.minCombo) {
        this.reachedMinCombo = true;
        logger.info('MissionManager', `minCombo condition MET! Reached combo x${multiplier}`);
        eventBus.emit('mission:combo_target_reached', { multiplier });
      }
    });
  }

  startChapter(chapterId = 1) {
    this.activeChapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
    this.isMissionActive = true;
    this.isFinished = false;
    this.reachedMinCombo = false;
    this.mistakeCount = 0;

    logger.info('MissionManager', `Starting Mission: Chapter ${this.activeChapter.id} - ${this.activeChapter.title}`);

    // Reset all gameplay tracking subsystems
    this.scoreManager.reset(this.activeChapter.targetObjects);
    this.comboManager.reset();
    this.healthManager.reset(3);
    this.cleanlinessManager.reset();
    this.timerManager.start(this.activeChapter.duration);

    // Reset power-up system
    if (this.powerUpManager) {
      this.powerUpManager.reset();
    }

    // Setup queue of items for the chapter
    this.trashManager.setupChapterQueue(this.activeChapter);

    eventBus.emit('mission:started', this.activeChapter);
  }

  pauseMission() {
    if (!this.isMissionActive || this.isFinished) return;
    this.timerManager.pause();
    eventBus.emit('mission:paused');
  }

  resumeMission() {
    if (!this.isMissionActive || this.isFinished) return;
    this.timerManager.resume();
    eventBus.emit('mission:resumed');
  }

  _endMission(isSuccess, message) {
    this.isMissionActive = false;
    this.isFinished = true;
    this.timerManager.stop();

    const timeRemaining = Math.max(0, Math.ceil(this.timerManager.timeRemaining));
    const scoreBreakdown = this.scoreManager.calcFinalScore(timeRemaining, isSuccess);
    const rank = this.scoreManager.getRank(isSuccess);

    // Save progress to localStorage if succeeded
    let badgeUnlocked = null;
    if (isSuccess && rank !== 'GAGAL') {
      badgeUnlocked = this.activeChapter.badgeId;
      StorageManager.saveChapterResult(this.activeChapter.id, {
        score: scoreBreakdown.finalScore,
        rank: rank,
        accuracy: this.scoreManager.accuracy,
        badgeId: badgeUnlocked
      });
    }

    const resultData = {
      isSuccess,
      chapter: this.activeChapter,
      rank,
      message,
      scoreBreakdown,
      stats: {
        accuracy: this.scoreManager.accuracy,
        correct: this.scoreManager.correctCount,
        wrong: this.scoreManager.wrongCount,
        total: this.activeChapter.targetObjects,
        maxCombo: this.comboManager.maxCombo,
        timeRemaining,
        cleanliness: this.cleanlinessManager.getPercentage()
      },
      badgeUnlocked
    };

    logger.info('MissionManager', 'Mission Ended:', resultData);
    eventBus.emit('mission:end', resultData);
  }
}
