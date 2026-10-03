import { GAME_CONFIG } from '../utils/constants.js';

export class SortingValidator {
  /**
   * Validate if trash item matches the destination bin
   * @param {Object} trash - Trash item data object
   * @param {Object} bin - Target bin data object
   * @returns {Object} validation result
   */
  static validate(trash, bin) {
    const isCorrect = trash.category === bin.category;

    if (isCorrect) {
      return {
        correct: true,
        scoreGained: GAME_CONFIG.BASE_SCORE, // 100
        message: `BENAR! +${GAME_CONFIG.BASE_SCORE} Poin`,
        explanation: trash.explanation,
        category: trash.category
      };
    } else {
      return {
        correct: false,
        scorePenalty: GAME_CONFIG.WRONG_PENALTY_SCORE, // 50
        message: `SALAH! -${GAME_CONFIG.WRONG_PENALTY_SCORE} Poin`,
        explanation: `${trash.name} seharusnya masuk tempat sampah ${trash.category.toUpperCase()}! ${trash.explanation}`,
        expectedCategory: trash.category,
        actualCategory: bin.category
      };
    }
  }
}
