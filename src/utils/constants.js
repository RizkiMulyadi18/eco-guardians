export const APP_STATES = {
  LOADING:        'LOADING',
  INTRO:          'INTRO',
  MAIN_MENU:      'MAIN_MENU',
  MAP:            'MAP',
  COMIC:          'COMIC',
  MISSION_BRIEF:  'MISSION_BRIEF',
  CAMERA_SETUP:   'CAMERA_SETUP',
  PLAYING:        'PLAYING',
  PAUSED:         'PAUSED',
  RESULT:         'RESULT',
  KNOWLEDGE_BOOK: 'KNOWLEDGE_BOOK',
  BADGES:         'BADGES',
  SETTINGS:       'SETTINGS'
};

export const TRASH_CATEGORIES = {
  ORGANIC:   'organik',
  INORGANIC: 'anorganik',
  B3:        'b3'
};

export const GAME_CONFIG = {
  INITIAL_LIVES:        3,
  INITIAL_CLEANLINESS:  100,   // % kebersihan awal
  BASE_SCORE:           100,   // 100 per objek benar
  WRONG_PENALTY_SCORE:  50,    // -50 poin per kesalahan
  WRONG_PENALTY_B3:     50,    // penalti B3 sama dengan biasa
  MISSED_OBJECT_SCORE:  0,     // objek terlewat tidak kena penalti poin
  TIME_BONUS_PER_SEC:   2,     // sisa detik × 2
  COMPLETION_BONUS:     500,   // bonus flat selesai misi
  
  // Tracking & Raycaster defaults
  PINCH_THRESHOLD_ACTIVE:   0.05,
  PINCH_THRESHOLD_INACTIVE: 0.10,
  MIN_HAND_CONFIDENCE:      0.70,
  LERP_FACTOR:              0.35,
  HOVER_RADIUS_PX:          45
};

export const COMBO_CONFIG = {
  THRESHOLDS:   [3, 6, 9, 12],
  MULTIPLIERS:  [1, 2, 3, 4, 5],
  DISPLAY_FROM: 3
};

export const POWERUP_CONFIG = {
  TIME_BONUS: {
    trigger:  'COMBO_3_FIRST',
    effect:   '+15 detik',
    duration: 'instant'
  },
  HINT: {
    trigger:  'LIVES_1',
    effect:   'highlight bin yang benar selama 5 detik',
    duration: 5000
  },
  SHIELD: {
    trigger:  'ACCURACY_80_HALFWAY',
    effect:   '1x kesalahan tidak kurangi nyawa',
    duration: 'one_use'
  }
};

export const STORAGE_KEY = 'eco_guardians_progress_v1';
