# 🔧 Review Spesifikasi Teknis Implementasi — *Eco Guardians*

**Dokumen yang direview:** Spesifikasi Teknis (file kedua)  
**Dibandingkan dengan:** GDD v1.0 + Suplemen v1.1  
**Tanggal:** 1 Oktober 2026

---

## 🟢 Kekuatan Dokumen

### 1. Arsitektur Sangat Matang
Pembagian 4 lapisan sistem sudah benar dan sesuai prinsip **Separation of Concerns**:
```
Presentation Layer  → HTML, CSS, HUD, Komik
Game Logic Layer    → Misi, Skor, Combo, Progres
Interaction Layer   → Webcam, MediaPipe, Gesture, Raycaster
Rendering Layer     → Three.js, Scene, Mesh, Animasi
```
Ini akan membuat kode mudah di-debug dan di-maintain.

### 2. Struktur Folder Ekselen
Struktur folder sangat detail dan logis. Contoh bagus:
```
src/handtracking/   → WebcamManager, HandTrackingManager, GestureManager, PointerManager
src/gameplay/       → 10 manager terpisah dengan tanggung jawab jelas
src/data/           → Semua data di satu tempat, tidak hardcode di modul
```
Ini adalah pola **Data-Driven Design** yang tepat untuk game edukasi.

### 3. State Machine Aplikasi Jelas
```
LOADING → INTRO → MAIN_MENU → MAP → COMIC → MISSION_BRIEF
→ CAMERA_SETUP → PLAYING → RESULT → MAP
```
Lengkap dengan aturan transisi (PAUSED hanya dari PLAYING). Ini mencegah bug state race condition.

### 4. Prinsip Modul Ketat
> *"Satu modul tidak boleh mengambil alih tanggung jawab modul lain. ScoreManager tidak mengubah DOM langsung; ia mengirim hasil ke UIManager."*

Ini prinsip **Single Responsibility** yang benar dan akan sangat membantu saat debugging.

### 5. Black-box Testing Sudah Terdefinisi (13 kasus)
BB-01 s.d. BB-13 sudah mencakup semua flow kritis. Format tabel juga siap langsung diisi.

### 6. Urutan Implementasi Realistis (6 Fase)
Fase 1 (Fondasi) → Fase 2 (Hand Tracking) → Fase 3 (Interaksi) → Fase 4 (Vertical Slice) → Fase 5 (Perluasan) → Fase 6 (Testing)  
Ini urutan yang benar — tidak melompat ke fitur sebelum core stabil.

---

## 🔴 Inkonsistensi dengan GDD v1.0 + Suplemen v1.1

> [!WARNING]
> Ada **konflik nilai** antara dokumen ini dan GDD/Suplemen. Salah satunya harus dikunci sebagai acuan resmi.

### Konflik 1 — Sistem Skor ⚠️ KRITIS

| Aspek | GDD Suplemen (v1.1) | Spestek (dokumen ini) |
|---|---|---|
| Base score per objek benar | **100 poin** | **10 poin** |
| Penalti salah biasa | **50 poin** | **10 poin** |
| Penalti salah B3 | *(sama dengan salah biasa)* | **15 poin** |
| Score per objek B3 benar | *(sama 100)* | **15 poin** |
| Combo ×3 bonus | *(masuk multiplier)* | **+5 poin flat** |
| Combo ×5 bonus | *(masuk multiplier)* | **+10 poin flat** |

**Sistem yang berbeda secara fundamental:**
- Suplemen: sistem **multiplier** (Base × Combo Multiplier)
- Spestek: sistem **flat bonus** (skor flat + bonus combo flat)

> **Rekomendasi:** Pilih satu. Sistem **multiplier (Suplemen)** lebih engaging untuk pemain karena terasa ada perkembangan. Sistem **flat (Spestek)** lebih mudah diimplementasikan dan di-balance.

---

### Konflik 2 — Objek Terlewat

| Aspek | GDD v1.0 | Spestek |
|---|---|---|
| Objek tidak disentuh saat waktu habis | Dihitung sebagai "salah" untuk akurasi | **−5 poin per objek terlewat** |

Ini berbeda pendekatan. Perlu dikunci salah satu.

---

### Konflik 3 — Kondisi Gagal C4 (Laboratorium)

| Aspek | GDD v1.0 | Spestek |
|---|---|---|
| Batas kesalahan C4 | Maksimal **3 kesalahan total** | "Batas kesalahan B3 terlampaui" *(tidak ada angkanya)* |

Spestek tidak mendefinisikan angka batas kesalahan B3 secara eksplisit.

---

### Konflik 4 — Power-up

| Aspek | GDD Suplemen | Spestek |
|---|---|---|
| Cara dapat power-up | Trigger berbasis event (combo ×3, nyawa 1, akurasi 80%) | Berbasis **energi** yang terkumpul |
| Sistem energi | Tidak ada | `INITIAL_ENERGY: 0, MAX_ENERGY: 100` |

Spestek memperkenalkan **sistem energi baru** yang tidak ada di GDD maupun Suplemen. Ini adalah fitur signifikan yang perlu diputuskan: pakai atau tidak?

---

## 🟡 Yang Kurang di Spestek (Perlu Ditambahkan)

### 1. Tidak Ada Implementasi Combo System
`ComboManager` disebut sebagai modul, tapi tidak ada kode atau logika combo sama sekali di dokumen. Hanya disebut "combo bertambah saat benar beruntun dan reset saat salah."

**Yang perlu ditambahkan:**
```javascript
// Contoh yang perlu ada di spestek:
class ComboManager {
  increment() { this.count++; this.updateMultiplier(); }
  reset()     { this.count = 0; this.multiplier = 1; }
  updateMultiplier() {
    if (this.count >= 12) this.multiplier = 5;
    else if (this.count >= 9) this.multiplier = 4;
    // dst...
  }
}
```

### 2. Tidak Ada Logika CleanlinessManager
`CleanlinessManager` ada di daftar modul tapi tidak ada penjelasan cara kerjanya. Formula kebersihan tidak ada di spestek ini.

### 3. Spesifikasi Perangkat Minimum Tidak Ada
Spestek tidak menyebutkan minimum RAM, resolusi, atau versi browser. Ini penting untuk Bab III/IV skripsi.

### 4. Tidak Ada Error Handling untuk MediaPipe Gagal Load
Tabel error handling sudah ada (Seksi 18), tapi tidak ada kode pseudocode untuk kasus "MediaPipe belum siap" — hanya "Loading indicator". Bagaimana cara mendeteksinya? Timeout berapa detik?

### 5. Tidak Ada Format Output Blackbox Testing
Tabel BB-01 s.d. BB-13 sudah ada kolomnya tapi belum ada kolom:
- **Hasil Aktual** (diisi saat pengujian)
- **Status** (Lulus/Gagal)
- **Tanggal Uji**
- **Catatan Perbaikan**

---

## ✅ Hal-hal yang Langsung Bisa Dipakai

Bagian-bagian berikut sudah siap digunakan langsung dalam coding:

### Siap Pakai ✅
```javascript
// APP_STATES — langsung copy ke constants.js
export const APP_STATES = {
  LOADING, INTRO, MAIN_MENU, MAP, COMIC,
  MISSION_BRIEF, CAMERA_SETUP, PLAYING,
  PAUSED, RESULT, KNOWLEDGE_BOOK, BADGES, SETTINGS
};

// GAME_CONFIG — langsung copy ke constants.js
export const GAME_CONFIG = {
  INITIAL_LIVES: 3,
  INITIAL_CLEANLINESS: 100,
  INITIAL_ENERGY: 0,
  MAX_ENERGY: 100,
  BASE_SCORE: 10,
  WRONG_PENALTY: 10
};

// Data format chapter — siap jadi chapters.js
// Data format trash item — siap jadi trashItems.js
// Data format bin — siap jadi bins.js

// validateSorting() — langsung ke SortingValidator.js
// StorageManager schema — langsung ke StorageManager.js
// Animate loop — langsung ke main.js
```

### Perlu Direvisi Dulu ⚠️
- Sistem skor (pilih: multiplier atau flat)
- Nilai threshold pinch (belum ada angkanya di spestek ini)
- Sistem energi & power-up (konflik dengan GDD)

---

## 📊 Penilaian Dokumen

| Aspek | Nilai | Catatan |
|---|---|---|
| Arsitektur sistem | ⭐⭐⭐⭐⭐ | Sangat baik, layak jadi acuan implementasi |
| Struktur folder | ⭐⭐⭐⭐⭐ | Detail dan logis |
| Kelengkapan kode | ⭐⭐⭐☆☆ | Snippet ada tapi beberapa modul kritis kosong |
| Konsistensi dengan GDD | ⭐⭐⭐☆☆ | Ada 4 konflik yang perlu diselesaikan |
| Kesiapan implementasi | ⭐⭐⭐⭐☆ | Bisa mulai coding, tapi perlu kunci konflik dulu |

---

## 🎯 Keputusan yang Harus Dibuat Sekarang

Sebelum mulai coding, kamu perlu memutuskan 4 hal ini:

| # | Pertanyaan | Opsi A | Opsi B |
|---|---|---|---|
| 1 | Sistem skor pakai apa? | **Multiplier** (100 × ×combo) | **Flat** (10 + bonus flat) |
| 2 | Power-up pakai sistem apa? | **Event-based** (dari GDD) | **Energi-based** (dari Spestek) |
| 3 | Objek terlewat dapat penalti? | Ya, **−5 per objek** | Tidak, hanya pengaruh **akurasi** |
| 4 | Batas kesalahan B3 di C4? | **3 kesalahan total** | **3 kesalahan B3 saja** |

---

> [!TIP]
> **Rekomendasi saya:**
> - Skor: pakai **Flat (Spestek)** — lebih mudah di-balance, lebih cocok untuk skripsi
> - Power-up: pakai **Energi-based (Spestek)** — lebih menarik mekaniknya
> - Objek terlewat: **Ya, −5** — memberi insentif untuk tidak diam
> - B3 C4: **3 kesalahan B3 saja** — lebih adil karena B3 lebih sulit dikenali

