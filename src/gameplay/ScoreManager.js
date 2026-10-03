import { GAME_CONFIG } from '../utils/constants.js';
import { eventBus } from '../utils/events.js';

export class ScoreManager {
  constructor() {
    this.totalScore = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.totalChapterObjects = 12;
    this.accuracy = 0;
  }

  reset(totalChapterObjects = 12) {
    this.totalScore = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.totalChapterObjects = totalChapterObjects;
    this.accuracy = 0;
    this._emitUpdate();
  }

  onCorrect(comboMultiplier = 1) {
    const gained = GAME_CONFIG.BASE_SCORE * comboMultiplier;
    this.totalScore += gained;
    this.correctCount++;
    this._updateAccuracy();
    this._emitUpdate();
    return gained;
  }

  onWrong() {
    this.totalScore = Math.max(0, this.totalScore - GAME_CONFIG.WRONG_PENALTY_SCORE);
    this.wrongCount++;
    this._updateAccuracy();
    this._emitUpdate();
    return -GAME_CONFIG.WRONG_PENALTY_SCORE;
  }

  _updateAccuracy() {
    if (this.totalChapterObjects > 0) {
      this.accuracy = Math.round((this.correctCount / this.totalChapterObjects) * 100);
    } else {
      this.accuracy = 0;
    }
  }

  calcFinalScore(timeRemaining, isMissionSuccess) {
    const timeBonus = Math.max(0, Math.floor(timeRemaining * GAME_CONFIG.TIME_BONUS_PER_SEC));
    const completionBonus = isMissionSuccess ? GAME_CONFIG.COMPLETION_BONUS : 0;
    const finalScore = this.totalScore + timeBonus + completionBonus;
    
    return {
      baseTotalScore: this.totalScore,
      timeBonus,
      completionBonus,
      finalScore
    };
  }

  getRank(isMissionSuccess) {
    if (!isMissionSuccess) return 'GAGAL';
    if (this.accuracy >= 90) return 'S';
    if (this.accuracy >= 80) return 'A';
    if (this.accuracy >= 70) return 'B';
    if (this.accuracy >= 60) return 'C';
    return 'GAGAL';
  }

  _emitUpdate() {
    eventBus.emit('score:update', {
      score: this.totalScore,
      correct: this.correctCount,
      wrong: this.wrongCount,
      accuracy: this.accuracy
    });
  }
}
