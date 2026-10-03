# ⚙️ Spesifikasi Teknis Final — *Eco Guardians: Misi Rahasia Sekolah Hijau*

**Versi:** 2.0 — Final (Diselaraskan dengan GDD v1.0 + Suplemen v1.1)  
**Status:** Dikunci sebagai acuan implementasi  
**Tanggal:** 1 Oktober 2026

> [!IMPORTANT]
> Dokumen ini menggabungkan arsitektur Spestek v1 dengan nilai mekanik dari GDD v1.0.
> Pada setiap konflik, **GDD adalah acuan yang menang**.

---

## 1. Ruang Lingkup

Game single-player berbasis web untuk PC/laptop dengan webcam. Kamera hanya digunakan untuk membaca gerakan tangan — bukan mengenali sampah nyata.

---

## 2. Teknologi dan Persyaratan

| Komponen | Teknologi |
|---|---|
| Markup dan styling | HTML5, CSS3 |
| Bahasa | JavaScript ES Modules |
| Build/dev server | Vite |
| Rendering | Three.js + WebGL 2.0 |
| Hand tracking | MediaPipe Hands |
| Kamera | WebRTC `getUserMedia()` |
| Penyimpanan | Browser `localStorage` |
| Model 3D | GLB/GLTF |
| Audio | MP3/WAV |
| Browser minimum | Chrome 110+, Edge 110+, Firefox 115+ |
| HTTPS | **Wajib** (getUserMedia membutuhkan HTTPS) |

**Inisialisasi proyek:**
```bash
npm create vite@latest eco-guardians -- --template vanilla
cd eco-guardians
npm install
npm install three @mediapipe/hands @mediapipe/camera_utils
npm run dev
```

**Spesifikasi perangkat minimum:**

| Komponen | Minimum |
|---|---|
| RAM | 4 GB |
| Resolusi layar | 1280×720 |
| Webcam | 720p @ 15fps |
| Prosesor | Intel Core i3 Gen 8 / AMD Ryzen 3 3000 |
| GPU | Integrated (Intel UHD 620) |

**Target performa:**
- FPS gameplay: ≥ 30fps (< 20fps = tidak layak uji)
- Latensi kursor ke tangan: < 100ms
- Loading awal: < 10 detik (koneksi 10 Mbps)

---

## 3. Arsitektur Sistem

```
Presentation Layer  → HTML, CSS, HUD, Panel komik, Menu
Game Logic Layer    → Misi, Skor, Combo, Progres, Kondisi menang
Interaction Layer   → Webcam, MediaPipe, Gesture, Kursor, Raycaster
Rendering Layer     → Three.js scene, Kamera, Cahaya, Mesh, Animasi
```

**Alur data utama:**
```
Webcam
  ↓
MediaPipe Hands
  ↓
Landmark tangan
  ↓
Gesture pinch + posisi telunjuk
  ↓
Kursor layar (dengan smoothing)
  ↓
Raycaster Three.js
  ↓
Objek 3D (state: IDLE → HOVERED → DRAGGING → DROP)
  ↓
Validasi kategori (SortingValidator)
  ↓
Skor, Combo, Nyawa, Feedback, Progres
```

---

## 4. Struktur Proyek

```
eco-guardians/
├── index.html
├── package.json
├── public/assets/
│   ├── models/{environment,characters,trash,bins,props}/
│   ├── textures/
│   ├── comic/
│   ├── icons/
│   ├── audio/{music,sfx}/
│   ├── fonts/
│   └── data/
└── src/
    ├── main.js
    ├── core/
    │   ├── GameApp.js
    │   ├── GameState.js
    │   ├── SceneManager.js
    │   └── AssetManager.js
    ├── scenes/
    │   ├── BaseScene.js
    │   ├── ClassroomScene.js
    │   ├── CafeteriaScene.js
    │   ├── GardenScene.js
    │   ├── LaboratoryScene.js
    │   └── FieldScene.js
    ├── handtracking/
    │   ├── WebcamManager.js
    │   ├── HandTrackingManager.js
    │   ├── GestureManager.js
    │   └── PointerManager.js
    ├── gameplay/
    │   ├── MissionManager.js
    │   ├── TrashManager.js
    │   ├── TrashObject.js
    │   ├── BinManager.js
    │   ├── SortingValidator.js
    │   ├── ScoreManager.js
    │   ├── ComboManager.js
    │   ├── TimerManager.js
    │   ├── HealthManager.js
    │   ├── CleanlinessManager.js
    │   └── PowerUpManager.js
    ├── story/
    │   ├── ComicManager.js
    │   ├── DialogueManager.js
    │   └── ChapterManager.js
    ├── ui/
    │   ├── UIManager.js
    │   ├── MainMenu.js
    │   ├── MissionBrief.js
    │   ├── GameplayHUD.js
    │   ├── ResultPanel.js
    │   ├── PausePanel.js
    │   └── KnowledgeBook.js
    ├── storage/
    │   └── StorageManager.js
    ├── data/
    │   ├── chapters.js
    │   ├── trashItems.js
    │   ├── bins.js
    │   ├── badges.js
    │   └── dialogues.js
    ├── utils/
    │   ├── constants.js
    │   ├── math.js
    │   ├── events.js
    │   └── logger.js
    └── styles/
        ├── global.css
        ├── menu.css
        ├── comic.css
        ├── gameplay.css
        └── result.css
```

---

## 5. State Aplikasi

```javascript
// src/utils/constants.js
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
```

**Alur transisi normal:**
```
LOADING → INTRO → MAIN_MENU → MAP → COMIC → MISSION_BRIEF
→ CAMERA_SETUP → PLAYING → RESULT → MAP
```

> PAUSED hanya bisa dicapai dari PLAYING dan kembali ke PLAYING atau keluar ke MAP.

---

## 6. Konfigurasi Data (Diselaraskan dengan GDD)

### 6.1 Konstanta

```javascript
// src/utils/constants.js

export const TRASH_CATEGORIES = {
  ORGANIC:   'organik',
  INORGANIC: 'anorganik',
  B3:        'b3'
};

// ✅ DISELARASKAN: Nilai dari GDD v1.0 + Suplemen v1.1
export const GAME_CONFIG = {
  INITIAL_LIVES:        3,
  INITIAL_CLEANLINESS:  100,   // % kebersihan awal
  BASE_SCORE:           100,   // ✅ GDD: 100 per objek (bukan 10)
  WRONG_PENALTY_SCORE:  50,    // ✅ GDD: -50 poin per kesalahan (bukan -10)
  WRONG_PENALTY_B3:     50,    // ✅ GDD: penalti B3 sama dengan biasa
  MISSED_OBJECT_SCORE:  0,     // ✅ GDD: objek terlewat tidak kena penalti poin,
                                //         hanya memengaruhi akurasi
  TIME_BONUS_PER_SEC:   2,     // ✅ GDD: sisa waktu × 2 poin
  COMPLETION_BONUS:     500,   // ✅ GDD: bonus flat jika misi selesai
};

// ✅ DISELARASKAN: Combo multiplier dari Suplemen v1.1
export const COMBO_CONFIG = {
  THRESHOLDS:   [3, 6, 9, 12],     // comboCount yang memicu level naik
  MULTIPLIERS:  [1, 2, 3, 4, 5],   // ×1 (default), ×2, ×3, ×4, ×5 (max)
  DISPLAY_FROM: 3,                  // mulai tampilkan HUD saat comboCount >= 3
};

// ✅ DISELARASKAN: Power-up event-based dari GDD Suplemen v1.1
// (Sistem energi dari Spestek v1 TIDAK digunakan)
export const POWERUP_CONFIG = {
  TIME_BONUS: {
    trigger:  'COMBO_3_FIRST',   // combo ×3 pertama dalam misi
    effect:   '+15 detik',
    duration: 'instant'
  },
  HINT: {
    trigger:  'LIVES_1',         // nyawa tersisa 1
    effect:   'highlight bin yang benar selama 5 detik',
    duration: 5000               // ms
  },
  SHIELD: {
    trigger:  'ACCURACY_80_HALFWAY', // akurasi ≥80% di titik tengah misi
    effect:   '1× kesalahan tidak kurangi nyawa',
    duration: 'one_use'
  }
};
```

---

### 6.2 Data Chapter (Diselaraskan dengan GDD)

```javascript
// src/data/chapters.js
export const CHAPTERS = [
  {
    id: 1,
    title: 'Kekacauan di Kelas',
    location: 'classroom',
    duration: 90,            // detik
    targetObjects: 12,
    categories: ['organik', 'anorganik'],
    targetAccuracy: 70,      // % untuk peringkat C ke atas
    maxMistakes: null,       // tidak ada batas khusus (nyawa saja)
    maxB3Mistakes: null,
    minCleanliness: null,    // tidak ada syarat kebersihan minimum
    minCombo: null,
    badgeId: 'penjaga_kelas',
    unlockAfter: null
  },
  {
    id: 2,
    title: 'Serbuan di Kantin',
    location: 'cafeteria',
    duration: 75,
    targetObjects: 20,
    categories: ['organik', 'anorganik'],
    targetAccuracy: 75,
    maxMistakes: null,
    maxB3Mistakes: null,
    minCleanliness: null,
    minCombo: 5,             // ✅ GDD: wajib capai combo ×5 minimal sekali
    badgeId: 'jagoan_kantin',
    unlockAfter: 1
  },
  {
    id: 3,
    title: 'Misteri Taman',
    location: 'garden',
    duration: 75,
    targetObjects: 24,
    categories: ['organik', 'anorganik'],
    targetAccuracy: 75,
    maxMistakes: null,
    maxB3Mistakes: null,
    minCleanliness: 40,      // ✅ GDD: kebersihan >= 40% wajib
    minCombo: null,
    badgeId: 'pelindung_taman',
    unlockAfter: 2
  },
  {
    id: 4,
    title: 'Bahaya di Laboratorium',
    location: 'laboratory',
    duration: 60,
    targetObjects: 25,
    categories: ['organik', 'anorganik', 'b3'],
    targetAccuracy: 80,
    maxMistakes: 3,          // ✅ GDD: maksimal 3 kesalahan TOTAL (bukan hanya B3)
    maxB3Mistakes: null,
    minCleanliness: null,
    minCombo: null,
    badgeId: 'ahli_b3',
    unlockAfter: 3
  },
  {
    id: 5,
    title: 'Final di Lapangan',
    location: 'field',
    duration: 120,
    targetObjects: 36,       // 3 fase × 12 objek
    categories: ['organik', 'anorganik', 'b3'],
    targetAccuracy: 80,
    maxMistakes: null,
    maxB3Mistakes: null,
    minCleanliness: null,
    minCombo: null,
    phases: [                // ✅ GDD: 3 fase di Chapter 5
      { label: 'Organik',    categories: ['organik'],    count: 12 },
      { label: 'Anorganik',  categories: ['anorganik'],  count: 12 },
      { label: 'B3',         categories: ['b3'],         count: 12 }
    ],
    badgeId: 'penyelamat_sekolah',
    unlockAfter: 4
  }
];
```

---

### 6.3 Data Objek Sampah

```javascript
// src/data/trashItems.js — contoh entri
{
  id: 'plastic_bottle',
  name: 'Botol Plastik',
  category: 'anorganik',
  model: '/assets/models/trash/plastic_bottle.glb',
  thumbnail: '/assets/icons/trash/plastic_bottle.webp',
  locations: ['classroom', 'cafeteria', 'garden', 'field'],
  explanation: 'Botol plastik sulit terurai dan dapat didaur ulang. Masuk tempat sampah Anorganik.',
  bookEntry: true           // muncul di Buku Eco Knowledge
}
```

---

## 7. Modul dan Tanggung Jawab

| Modul | Tanggung Jawab |
|---|---|
| `GameApp` | Inisialisasi aplikasi, perpindahan state |
| `GameState` | Menyimpan state aktif saat ini |
| `SceneManager` | Scene, kamera, renderer, cahaya, resize |
| `AssetManager` | Loading dan cache aset per chapter |
| `WebcamManager` | Izin, stream, penghentian kamera |
| `HandTrackingManager` | Model MediaPipe, landmark |
| `GestureManager` | Deteksi pinch, smoothing, hysteresis |
| `PointerManager` | Konversi koordinat tangan → kursor layar |
| `InteractionManager` | Hover, pick, drag, drop, state objek |
| `MissionManager` | Target, kondisi menang/gagal, state misi |
| `TrashManager` | Spawn dan lifecycle objek sampah |
| `SortingValidator` | Membandingkan kategori objek dan bin |
| `ScoreManager` | Skor dan akurasi |
| `ComboManager` | Combo count dan multiplier |
| `TimerManager` | Countdown, jeda, time bonus |
| `HealthManager` | Nyawa dan game over |
| `CleanlinessManager` | % kebersihan real-time |
| `PowerUpManager` | Trigger dan efek power-up (event-based) |
| `ComicManager` | Panel cerita, navigasi komik |
| `DialogueManager` | Dialog karakter per chapter |
| `UIManager` | HUD, menu, popup, hasil — satu-satunya modul yang ubah DOM |
| `StorageManager` | Baca/tulis `localStorage` |

> **Prinsip:** Satu modul tidak boleh mengambil alih tanggung jawab modul lain.
> `ScoreManager` tidak mengubah DOM — ia mengirim data ke `UIManager`.

---

## 8. Implementasi Sistem Skor (Diselaraskan GDD)

### 8.1 ScoreManager

```javascript
// src/gameplay/ScoreManager.js
export class ScoreManager {
  constructor() {
    this.totalScore   = 0;
    this.accuracy     = 0;
    this.correctCount = 0;
    this.totalObjects = 0;  // total objek di chapter (termasuk yang tidak disentuh)
  }

  // Dipanggil saat objek di-drop BENAR
  onCorrect(comboMultiplier) {
    const gained = GAME_CONFIG.BASE_SCORE * comboMultiplier; // 100 × multiplier
    this.totalScore   += gained;
    this.correctCount++;
    this.totalObjects++;
    this._updateAccuracy();
    return gained;
  }

  // Dipanggil saat objek di-drop SALAH
  onWrong() {
    this.totalScore = Math.max(0, this.totalScore - GAME_CONFIG.WRONG_PENALTY_SCORE); // -50, min 0
    this.totalObjects++;
    this._updateAccuracy();
    return -GAME_CONFIG.WRONG_PENALTY_SCORE;
  }

  // Dipanggil di akhir misi untuk objek yang tidak disentuh
  onMissed(count) {
    // ✅ GDD: objek terlewat TIDAK dapat penalti poin
    // hanya menambah totalObjects sehingga akurasi turun
    this.totalObjects += count;
    this._updateAccuracy();
  }

  // Dihitung di akhir misi
  calcFinalScore(timeRemaining, missionSuccess) {
    const timeBonus       = timeRemaining * GAME_CONFIG.TIME_BONUS_PER_SEC; // sisa detik × 2
    const completionBonus = missionSuccess ? GAME_CONFIG.COMPLETION_BONUS : 0; // +500
    this.totalScore      += timeBonus + completionBonus;
    return { timeBonus, completionBonus, finalScore: this.totalScore };
  }

  _updateAccuracy() {
    // ✅ GDD: akurasi = benar / TOTAL objek chapter (bukan hanya yang diproses)
    const chapterTotal = MissionManager.getChapterTotalObjects();
    this.accuracy = chapterTotal > 0
      ? (this.correctCount / chapterTotal) * 100
      : 0;
  }

  getRank() {
    if (!MissionManager.isMissionSuccess()) return 'GAGAL';
    if (this.accuracy >= 90) return 'S';
    if (this.accuracy >= 80) return 'A';
    if (this.accuracy >= 70) return 'B';
    if (this.accuracy >= 60) return 'C';
    return 'GAGAL';
  }
}
```

---

### 8.2 ComboManager (Diselaraskan GDD)

```javascript
// src/gameplay/ComboManager.js
export class ComboManager {
  constructor() {
    this.count      = 0;
    this.multiplier = 1;
    this.maxCombo   = 0;   // untuk syarat C2 (minCombo: 5)
  }

  onCorrect() {
    this.count++;
    this.maxCombo = Math.max(this.maxCombo, this.count);
    this._updateMultiplier();
    return this.multiplier;
  }

  // ✅ GDD: 1 salah = langsung reset (tidak ada grace period)
  onWrong() {
    this.count      = 0;
    this.multiplier = 1;
  }

  _updateMultiplier() {
    // ✅ GDD Suplemen: threshold [3,6,9,12] → multiplier [2,3,4,5]
    if      (this.count >= 12) this.multiplier = 5;
    else if (this.count >= 9)  this.multiplier = 4;
    else if (this.count >= 6)  this.multiplier = 3;
    else if (this.count >= 3)  this.multiplier = 2;
    else                       this.multiplier = 1;
  }

  getDisplayLabel() {
    if (this.count < COMBO_CONFIG.DISPLAY_FROM) return null; // tidak tampil di HUD
    if (this.multiplier >= 5) return 'COMBO ×5 MAX!';
    return `COMBO ×${this.multiplier}`;
  }
}
```

---

### 8.3 CleanlinessManager (Diselaraskan GDD)

```javascript
// src/gameplay/CleanlinessManager.js
export class CleanlinessManager {
  constructor() {
    this.correctDropped = 0;
    this.totalDropped   = 0;  // benar + salah (yang sudah di-drop)
  }

  onCorrect() {
    this.correctDropped++;
    this.totalDropped++;
  }

  onWrong() {
    this.totalDropped++;
  }

  // ✅ GDD: Kebersihan% = (Benar / Diproses) × 100, real-time
  // Objek belum disentuh TIDAK dihitung (beda dengan akurasi)
  getPercentage() {
    if (this.totalDropped === 0) return 100; // awal misi = 100%
    return (this.correctDropped / this.totalDropped) * 100;
  }

  // ✅ GDD C3: syarat kebersihan >= 40% saat misi berakhir
  meetsMinimum(minRequired) {
    if (minRequired === null) return true;
    return this.getPercentage() >= minRequired;
  }
}
```

---

### 8.4 PowerUpManager (Diselaraskan GDD — Event-based)

```javascript
// src/gameplay/PowerUpManager.js
// ✅ DISELARASKAN: Event-based dari GDD, BUKAN sistem energi dari Spestek v1

export class PowerUpManager {
  constructor() {
    this.timeBonusUsed  = false;
    this.hintUsed       = false;
    this.shieldUsed     = false;
    this.shieldActive   = false;
    this.hintActive     = false;
    this.hintTimer      = 0;
  }

  // Dipanggil oleh ComboManager saat combo pertama kali mencapai ×3 dalam misi
  onComboThreeFirst() {
    if (!this.timeBonusUsed) {
      this.timeBonusUsed = true;
      TimerManager.addTime(15); // +15 detik
      UIManager.showPowerUpNotif('⏱ +15 Detik!');
    }
  }

  // Dipanggil oleh HealthManager saat nyawa menjadi 1
  onLivesOne() {
    if (!this.hintUsed) {
      this.hintUsed    = true;
      this.hintActive  = true;
      this.hintTimer   = POWERUP_CONFIG.HINT.duration; // 5000ms
      UIManager.activateHint(); // highlight bin yang benar
    }
  }

  // Dipanggil oleh MissionManager di titik tengah misi
  onHalfwayCheck(currentAccuracy) {
    if (!this.shieldUsed && currentAccuracy >= 80) {
      this.shieldUsed   = true;
      this.shieldActive = true;
      UIManager.showPowerUpNotif('🛡 Pelindung Aktif!');
    }
  }

  // Dipanggil saat terjadi kesalahan — shield menyerap 1 kesalahan
  consumeShieldIfActive() {
    if (this.shieldActive) {
      this.shieldActive = false;
      UIManager.showPowerUpNotif('🛡 Pelindung Terpakai!');
      return true; // true = kesalahan diserap, nyawa tidak berkurang
    }
    return false;
  }

  update(deltaMs) {
    if (this.hintActive) {
      this.hintTimer -= deltaMs;
      if (this.hintTimer <= 0) {
        this.hintActive = false;
        UIManager.deactivateHint();
      }
    }
  }
}
```

---

### 8.5 SortingValidator (Diselaraskan GDD)

```javascript
// src/gameplay/SortingValidator.js
export function validateSorting(trash, bin) {
  const correct = trash.category === bin.category;

  if (correct) {
    return {
      correct:     true,
      scoreGained: GAME_CONFIG.BASE_SCORE  // multiplier diterapkan di ScoreManager
    };
  }

  // ✅ GDD: penalti B3 dan non-B3 SAMA (50 poin)
  return {
    correct:      false,
    scorePenalty: GAME_CONFIG.WRONG_PENALTY_SCORE,
    explanation:  trash.explanation,  // tampilkan di feedback
    correctBin:   trash.category      // untuk highlight bin yang benar
  };
}
```

---

## 9. Kondisi Gagal Per Chapter (Diselaraskan GDD)

```javascript
// src/gameplay/MissionManager.js — checkFailCondition()

checkFailCondition(chapter, state) {
  // Kondisi umum semua chapter
  if (state.lives <= 0)    return { failed: true, reason: 'LIVES_EMPTY' };
  if (state.timer <= 0 && !state.allProcessed) {
    const accuracy = scoreManager.getAccuracy();
    if (accuracy < chapter.targetAccuracy) return { failed: true, reason: 'TIME_UP_LOW_ACCURACY' };
  }

  // Kondisi khusus Chapter 3 — kebersihan
  if (chapter.minCleanliness !== null) {
    if (!cleanlinessManager.meetsMinimum(chapter.minCleanliness)) {
      return { failed: true, reason: 'CLEANLINESS_TOO_LOW' };
    }
  }

  // ✅ GDD: Chapter 4 — maksimal 3 kesalahan TOTAL (bukan hanya B3)
  if (chapter.maxMistakes !== null) {
    if (state.totalMistakes > chapter.maxMistakes) {
      return { failed: true, reason: 'TOO_MANY_MISTAKES' };
    }
  }

  // Kondisi khusus Chapter 2 — combo minimum
  if (chapter.minCombo !== null) {
    const missionComplete = state.allProcessed || state.timer <= 0;
    if (missionComplete && comboManager.maxCombo < chapter.minCombo) {
      return { failed: true, reason: 'COMBO_NOT_REACHED' };
    }
  }

  return { failed: false };
}
```

---

## 10. Deteksi Gesture dan Kursor

### 10.1 Threshold Pinch

```javascript
// src/handtracking/GestureManager.js
const PINCH_THRESHOLD_ACTIVE   = 0.05;  // jarak normalized — rancangan awal, WAJIB divalidasi
const PINCH_THRESHOLD_INACTIVE = 0.10;  // hysteresis agar tidak berkedip
const MIN_HAND_CONFIDENCE      = 0.70;  // di bawah ini, input diabaikan

detectPinch(landmarks) {
  if (landmarks.score < MIN_HAND_CONFIDENCE) return this.pinchState; // abaikan

  const thumbTip  = landmarks[4];  // ujung ibu jari
  const indexTip  = landmarks[8];  // ujung telunjuk
  const dist      = calcDistance(thumbTip, indexTip);

  // Hysteresis: threshold aktif < threshold lepas
  if (!this.pinchState && dist <= PINCH_THRESHOLD_ACTIVE)   this.pinchState = true;
  if ( this.pinchState && dist > PINCH_THRESHOLD_INACTIVE)  this.pinchState = false;

  return this.pinchState;
}
```

### 10.2 Smoothing Kursor

```javascript
// src/handtracking/PointerManager.js
const LERP_FACTOR = 0.3; // rancangan awal — nilai tinggi=responsif, rendah=halus

update(rawLandmark) {
  // Mirror X karena feed kamera biasanya di-mirror
  const rawX = 1 - rawLandmark[8].x;
  const rawY = rawLandmark[8].y;

  this.cursorX = lerp(this.cursorX, rawX, LERP_FACTOR);
  this.cursorY = lerp(this.cursorY, rawY, LERP_FACTOR);
}
```

### 10.3 State Objek

```
IDLE
  │ tangan masuk radius 40px (screen space)
  ▼
HOVERED ─── tangan keluar radius ──► IDLE
  │ pinch aktif
  ▼
DRAGGING
  │ release pinch di atas bin
  ▼
DROP → validateSorting() → CORRECT / INCORRECT → IDLE
  │ release pinch BUKAN di atas bin
  ▼
RELEASED_MISS → objek kembali ke posisi semula → IDLE
```

### 10.4 Edge Cases

| Situasi | Perilaku |
|---|---|
| Tangan keluar frame saat drag | Drop di posisi terakhir → evaluasi zona |
| Confidence < 0.70 | Kursor tidak bergerak, input diabaikan |
| 2 tangan terdeteksi | Gunakan tangan dengan confidence lebih tinggi |
| Pinch tanpa hover objek | Diabaikan |
| Jitter cepat | Ditangani oleh LERP smoothing |

---

## 11. Animation Loop

```javascript
// src/main.js
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (gameState.current === APP_STATES.PLAYING) {
    handTrackingManager.update();
    pointerManager.update();
    interactionManager.update();
    missionManager.update(delta);
    powerUpManager.update(delta * 1000); // dalam ms
    sceneManager.update(delta);
  }

  sceneManager.render();
}
```

---

## 12. Penyimpanan Progres (localStorage)

```javascript
// src/storage/StorageManager.js
const STORAGE_KEY = 'eco_guardians_progress_v1';

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
    penjaga_kelas:    false,
    jagoan_kantin:    false,
    pelindung_taman:  false,
    ahli_b3:          false,
    penyelamat_sekolah: false
  },
  settings: {
    sfxVolume:   0.8,
    musicVolume: 0.6,
    showHints:   true
  }
};

// Aturan simpan — skor/rank hanya diperbarui jika lebih baik
function saveChapterResult(chapterId, { score, rank, accuracy }) {
  const prog  = loadProgress();
  const entry = prog.chapters[chapterId];

  entry.playCount++;
  entry.completed  = true;
  entry.bestScore  = Math.max(entry.bestScore, score);

  const rankOrder  = { S: 5, A: 4, B: 3, C: 2, GAGAL: 1 };
  if ((rankOrder[rank] || 0) > (rankOrder[entry.bestRank] || 0)) {
    entry.bestRank = rank;
  }

  entry.bestAccuracy      = Math.max(entry.bestAccuracy, accuracy);
  prog.lastPlayed         = new Date().toISOString();

  // Unlock chapter berikutnya
  const next = String(Number(chapterId) + 1);
  if (prog.chapters[next]) prog.chapters[next].unlocked = true;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
}
```

---

## 13. Penanganan Error

| Kondisi | Respons |
|---|---|
| Izin kamera ditolak | Panduan aktifkan izin + tombol coba lagi |
| Kamera tidak tersedia | Pesan perangkat tidak kompatibel + opsi kembali |
| Tangan tidak terdeteksi | Instruksi posisi tangan dan pencahayaan |
| MediaPipe gagal load (timeout 10 detik) | Pesan error + tombol reload |
| Aset gagal dimuat | Coba ulang 2× → tampilkan error → gunakan placeholder |
| WebGL tidak tersedia | Pesan kompatibilitas browser |
| Progres rusak / invalid | Muat `DEFAULT_PROGRESS`, log ke console |
| Resize browser | `renderer.setSize()` + update kamera aspect ratio |
| Kamera terputus saat bermain | Otomatis PAUSED + pesan "Kamera terputus" |

> Error **tidak boleh** menyebabkan halaman berhenti tanpa pesan atau tombol keluar.

---

## 14. Prioritas Audio

### Wajib Ada Sebelum Uji Pengguna
| File | Event |
|---|---|
| `sfx_sort_correct.mp3` | Objek benar di-drop |
| `sfx_sort_wrong.mp3` | Objek salah di-drop |
| `sfx_combo.mp3` | Combo naik level |
| `sfx_mission_complete.mp3` | Misi berhasil |
| `sfx_game_over.mp3` | Nyawa habis |
| `music_menu.mp3` | Menu utama (loop) |
| `music_gameplay.mp3` | Saat misi berjalan (loop) |

### Opsional
`sfx_pinch`, `sfx_hover`, `sfx_powerup`, `sfx_badge_unlock`, `music_chapter_[1-5]`, `sfx_timer_warning`

**Fallback:** Jika audio gagal load, game tetap berjalan. Feedback visual menggantikan audio.

---

## 15. Urutan Implementasi

**Fase 1 — Fondasi**
- Buat proyek Vite + struktur folder
- Scene Three.js kosong + pencahayaan
- State machine + perpindahan halaman dasar
- Data chapter dan objek (`chapters.js`, `trashItems.js`)

**Fase 2 — Prototipe Hand Tracking**
- Aktifkan webcam (`WebcamManager`)
- Muat MediaPipe Hands + tampilkan landmark
- Buat kursor telunjuk
- Deteksi pinch + smoothing + uji threshold

**Fase 3 — Prototipe Interaksi**
- 1 objek sampah + 1 tempat sampah
- Raycaster hover
- Pick → drag → drop
- Validasi benar/salah + feedback

**Fase 4 — Vertical Slice Chapter 1**
- Panel komik pembuka
- Briefing misi
- Scene kelas 3D
- 2 kategori, 12 objek
- Skor, combo, timer, nyawa
- Kondisi menang/gagal
- Hasil misi + lencana
- Simpan progres + pengulangan

**Fase 5 — Perluasan**
- Chapter 2–5 + mekanisme khusus per chapter
- Power-up (event-based)
- Buku Eco Knowledge
- Semua dialog + komik
- Efek visual + audio

**Fase 6 — Pengujian**
- Black-box testing (BB-01 s.d. BB-13)
- Uji performa di perangkat target
- Uji pengguna SMP
- SUS + UEQ
- Perbaikan + finalisasi

---

## 16. Black-box Testing

| ID | Fitur | Input | Hasil yang Diharapkan | Hasil Aktual | Status | Tanggal | Catatan |
|---|---|---|---|---|---|---|---|
| BB-01 | Menu | Buka game | Halaman pembuka tampil | | | | |
| BB-02 | Kamera | Mulai misi | Browser minta izin kamera | | | | |
| BB-03 | Tangan | Letakkan tangan di kamera | Status "terdeteksi" tampil | | | | |
| BB-04 | Pinch | Dekatkan ibu jari & telunjuk | Gesture aktif | | | | |
| BB-05 | Pick | Pinch pada objek sampah | Objek terangkat | | | | |
| BB-06 | Sort benar | Drop di bin sesuai kategori | Skor +100, combo naik | | | | |
| BB-07 | Sort salah | Drop di bin berbeda | Skor −50, nyawa −1, combo reset | | | | |
| BB-08 | Jeda | Tekan tombol jeda | Timer berhenti, input nonaktif | | | | |
| BB-09 | Menang | Capai target akurasi | Layar hasil "SUCCESS" tampil | | | | |
| BB-10 | Gagal nyawa | Nyawa = 0 | Layar hasil "GAGAL" tampil | | | | |
| BB-11 | Progres | Selesaikan chapter | Chapter berikutnya terbuka | | | | |
| BB-12 | Persistensi | Tutup lalu buka game | Progres dimuat dari localStorage | | | | |
| BB-13 | Reset | Konfirmasi reset | Progres kembali ke default | | | | |

---

## 17. Checklist Sebelum Coding

- [ ] Node.js dan npm tersedia
- [ ] Proyek Vite berjalan (`npm run dev`)
- [ ] Browser mendukung WebGL + kamera
- [ ] GDD v1.0 dan Spestek v2.0 ini disetujui
- [ ] Threshold pinch akan divalidasi di Fase 2 (bukan dikunci sekarang)
- [ ] Struktur folder dibuat
- [ ] `chapters.js` dan `trashItems.js` diisi minimal untuk Chapter 1
- [ ] 1 model objek sampah (atau placeholder box) tersedia
- [ ] 1 model bin (atau placeholder box) tersedia
- [ ] Skenario BB-01 s.d. BB-13 disiapkan sebagai checklist pengujian

---

## 18. Checklist Vertical Slice Chapter 1

- [ ] Panel komik pembuka (3 panel)
- [ ] Briefing misi
- [ ] Scene kelas 3D (atau placeholder)
- [ ] 2 kategori: organik + anorganik
- [ ] ≥ 3 objek sampah (minimal placeholder)
- [ ] Kamera + deteksi tangan aktif
- [ ] Kursor telunjuk + pinch
- [ ] Pick → drag → drop
- [ ] Validasi kategori
- [ ] Skor (100 × multiplier) + combo (×1–×5)
- [ ] Timer (90 detik)
- [ ] Nyawa (3)
- [ ] Feedback benar (hijau) / salah (merah + info)
- [ ] Kondisi menang / gagal
- [ ] Layar hasil (peringkat, statistik, tombol)
- [ ] Lencana chapter 1
- [ ] Simpan progres ke localStorage
- [ ] Pengulangan misi

---

*Dokumen ini adalah acuan teknis final dan harus dibaca bersama GDD v1.0.*  
*Parameter bertanda "rancangan awal" wajib divalidasi melalui prototipe sebelum dikunci.*
