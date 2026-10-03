# 📐 Suplemen GDD — *Eco Guardians: Misi Rahasia Sekolah Hijau*
**Versi:** 1.1 — Tambahan dari GDD v1.0  
**Status:** Pelengkap wajib sebelum implementasi

---

## BAGIAN A — Formula Mekanik Gameplay

### A.1 Sistem Skor

#### Rumus Skor Per Objek
```
Skor_Objek = Base_Score × Combo_Multiplier
```

| Variabel | Nilai | Keterangan |
|---|---|---|
| `Base_Score` | 100 poin | Setiap objek benar |
| `Combo_Multiplier` | ×1 s.d. ×5 | Tergantung level combo aktif |

#### Rumus Time Bonus (dihitung di akhir misi)
```
Time_Bonus = Waktu_Tersisa × 2
```
> Contoh: sisa 30 detik → Time Bonus = 60 poin

#### Rumus Chapter Completion Bonus
```
Completion_Bonus = 500 poin (flat, hanya jika misi selesai)
```

#### Rumus Skor Final Misi
```
Skor_Final = Σ(Skor_Objek) + Time_Bonus + Completion_Bonus
```

#### Contoh Perhitungan (Chapter 1 — 12 objek, 90 detik)
```
Objek benar: 11 dari 12
- 3 objek pertama tanpa combo   → 3 × 100 × ×1 = 300
- 3 objek berikutnya (combo ×2) → 3 × 100 × ×2 = 600
- 3 objek berikutnya (combo ×3) → 3 × 100 × ×3 = 900
- 2 objek terakhir (combo ×3)   → 2 × 100 × ×3 = 600
- 1 objek salah                 → combo reset, 0 skor

Subtotal objek: 2400
Time Bonus (sisa 23 detik): 46
Completion Bonus: 500
─────────────────────────
TOTAL: 2946 poin
```

---

### A.2 Sistem Combo

#### Aturan Combo
```
comboCount += 1  // setiap objek benar berurutan
comboCount = 0   // reset jika 1 objek salah
```

#### Tabel Combo Multiplier
| `comboCount` | Multiplier | Label HUD |
|---|---|---|
| 0 – 2 | ×1 | *(tidak tampil)* |
| 3 – 5 | ×2 | `COMBO ×2` |
| 6 – 8 | ×3 | `COMBO ×3` |
| 9 – 11 | ×4 | `COMBO ×4` |
| ≥ 12 | ×5 | `COMBO ×5 MAX!` |

> **Catatan implementasi:** Combo mulai ditampilkan di HUD saat `comboCount = 3`.
> Saat reset, label HUD fade-out selama 0.5 detik.

#### Syarat Chapter 2 (combo misi)
```
Kondisi sukses C2: maxComboInMission >= 5
```
Artinya pemain harus pernah mencapai `comboCount ≥ 5` minimal sekali dalam misi C2.

---

### A.3 Indikator Kebersihan

#### Rumus Kebersihan (real-time, diperbarui setiap drop objek)
```
Kebersihan% = (Total_Benar / Total_Diproses) × 100
```

| Variabel | Keterangan |
|---|---|
| `Total_Benar` | Jumlah objek yang sudah di-drop ke tempat sampah yang tepat |
| `Total_Diproses` | Jumlah objek yang sudah di-drop (benar + salah) |

> Objek yang belum disentuh **tidak** dihitung — kebersihan tidak turun karena waktu habis.

#### Kondisi Khusus Chapter 3
```
Kondisi misi C3: Kebersihan% >= 40 SAAT WAKTU HABIS atau semua objek diproses
```
Jika kebersihan di bawah 40% saat misi berakhir → **GAGAL**, meski akurasi cukup.

#### Tampilan HUD
- Progress bar horizontal di pojok kanan atas
- Warna berubah: Merah (0–39%) → Kuning (40–69%) → Hijau (70–100%)
- Angka % ditampilkan di dalam bar

---

### A.4 Sistem Penalti & Nyawa

#### Saat Objek Salah Kategori
```javascript
// Pseudo-code
score -= 50              // penalti skor (tidak bisa negatif, min 0)
lives -= 1               // kurangi nyawa
comboCount = 0           // reset combo
object.resetPosition()   // objek kembali ke posisi semula
showFeedback('SALAH')    // tampilkan feedback merah + info kategori benar
```

#### Kondisi Game Over
```
if (lives === 0) → GAME OVER
  → hentikan timer
  → tampilkan layar hasil dengan peringkat GAGAL
  → skor tetap dihitung (tanpa completion bonus)
```

#### Kondisi Waktu Habis
```
if (timer === 0 && !allObjectsProcessed) → evaluasi akhir
  → hitung akurasi dari objek yang sudah diproses
  → jika akurasi < target chapter → GAGAL
  → jika akurasi >= target chapter → SUCCESS (tanpa time bonus)
```

---

### A.5 Peringkat & Akurasi Final

#### Rumus Akurasi
```
Akurasi% = (Total_Benar / Total_Objek_Chapter) × 100
```
> `Total_Objek_Chapter` adalah jumlah objek yang di-spawn dalam misi (bukan yang diproses).
> Objek yang tidak disentuh dihitung sebagai salah.

#### Tabel Peringkat
| Akurasi | Peringkat | Kondisi Tambahan |
|---|---|---|
| ≥ 90% | **S** | Misi harus selesai (tidak game over) |
| 80 – 89% | **A** | Misi harus selesai |
| 70 – 79% | **B** | Misi harus selesai |
| 60 – 69% | **C** | Misi harus selesai |
| < 60% | **Gagal** | Atau: lives = 0 / kebersihan C3 < 40% |

> Peringkat **Gagal** tidak membuka chapter berikutnya dan tidak menyimpan skor baru.

---

### A.6 Power-Up

| Power-Up | Cara Dapat | Efek | Durasi |
|---|---|---|---|
| ⏱ **Waktu +15** | Combo ×3 pertama dalam misi | Tambah 15 detik ke timer | Instan |
| 🔍 **Petunjuk** | Nyawa tersisa 1 | Highlight tempat sampah yang benar untuk objek aktif | 5 detik |
| 🛡 **Pelindung** | Akurasi ≥ 80% di halfway point | Salah berikutnya tidak kurangi nyawa (1×) | Sekali pakai |

> Power-up tidak bisa ditumpuk. Jika sudah aktif, trigger berikutnya diabaikan.

---

## BAGIAN B — Script Dialog Chapter (Bab 9)

### B.1 Format Dialog
Setiap dialog ditulis sebagai:  
`[KARAKTER]: "teks dialog"` — **(keterangan panel / aksi)**

---

### Chapter 1 — Kekacauan di Kelas

**Panel Pembuka C1 (3 panel)**
```
Panel 1:
[RAKA]: "Hei, Guardian Baru! Selamat datang di Eco Guardians!"
(Raka melambaikan tangan di depan kelas yang berantakan)

Panel 2:
[NAYA]: "Sampah di kelas ini sudah parah. Organik dan anorganik
  tercampur semua. Ini gawat!"
(Naya menunjuk tumpukan sampah — botol plastik, sisa makanan, kertas)

Panel 3:
[BIMO]: "Tenang! Lihat kameramu. Aku sudah sambungkan alat pelacak
  tangan ke sistemmu. Coba pinch — jepit jarimu!"
(Bimo menunjuk webcam, muncul ikon tangan di pojok layar)
```

**Briefing Misi C1**
```
[RAKA]: "Tugasmu: pilah 12 sampah ke tempat yang benar.
  Organik = sisa makanan & daun. Anorganik = plastik, kertas, kaleng.
  Jangan sampai salah, ya!"
```

**Dialog Feedback C1**
```
Benar pertama kali:
[NAYA]: "Bagus! Itu dia caranya!"

Salah pertama kali:
[NAYA]: "Eh, itu [nama objek] masuk [kategori benar], bukan [kategori salah].
  Ingat ya!"

Combo ×3:
[RAKA]: "Luar biasa! Kamu mulai dapat ritmenya!"

Game Over (nyawa habis):
[BIMO]: "Wah, hampir! Coba lagi ya. Jangan buru-buru."
```

**Panel Penutup C1 (2 panel)**
```
Panel Menang:
[RAKA]: "Kelas bersih! Satu area berhasil, empat lagi menunggu!"
[NAYA]: "Sekolah kita bisa menang kompetisi ini. Lanjutkan!"

Panel Gagal:
[KACAUMAN]: "Ha ha ha! Masih banyak sampah yang belum kamu pilah!"
[BIMO]: "Jangan nyerah! Latih lagi pinch-mu. Pasti bisa!"
```

---

### Chapter 2 — Serbuan di Kantin

**Panel Pembuka C2 (3 panel)**
```
Panel 1:
[KACAUMAN]: "Sekarang giliranku di kantin! Muahahaha!"
(Kacauman melempar tumpukan sisa makanan dan kemasan ke kantin)

Panel 2:
[NAYA]: "Waduh! Sisa nasi, kulit buah, bungkus plastik, kaleng minuman...
  semuanya bercampur!"

Panel 3:
[RAKA]: "Kita harus cepat! Kali ini lebih banyak sampah dan kamu
  harus jaga kombo terus. Siap?"
```

**Briefing Misi C2**
```
[BIMO]: "Target: pilah 20 objek. Tapi ada tantangan — kamu harus
  capai combo x5 minimal sekali. Semakin lama kombomu, semakin
  besar skormu!"
```

**Dialog Khusus C2**
```
Saat combo ×5 tercapai:
[RAKA]: "COMBO x5! Kamu luar biasa! Pertahankan!"

Saat combo putus di atas ×3:
[NAYA]: "Aduh sayang banget... Tapi masih bisa! Bangun lagi!"
```

---

### Chapter 3 — Misteri Taman

**Panel Pembuka C3 (3 panel)**
```
Panel 1:
[NAYA]: "Taman sekolah kita... daunnya layu, tanahnya kotor.
  Sampah organik yang tidak dipilah merusak tumbuhan!"

Panel 2:
[BIMO]: "Ada indikator kebersihan sekarang. Kamu harus jaga
  kebersihannya di atas 40%. Kalau turun terus... taman makin rusak."

Panel 3:
[RAKA]: "Pilah dengan teliti. Satu kesalahan bisa memengaruhi
  seluruh taman!"
```

**Briefing Misi C3**
```
[NAYA]: "24 objek, campuran organik dan anorganik.
  Jaga kebersihan minimal 40% ya. Taman ini bergantung padamu!"
```

---

### Chapter 4 — Bahaya di Laboratorium

**Panel Pembuka C4 (3 panel)**
```
Panel 1:
[BIMO]: "Guardian! Laboratorium darurat! Ada baterai bekas, cat,
  dan bahan kimia tercampur dengan sampah biasa!"

Panel 2:
[NAYA]: "Ini sampah B3 — Bahan Berbahaya dan Beracun. Kalau salah
  buang, bisa meracuni tanah dan air!"

Panel 3:
[BIMO]: "Sekarang ada tiga tempat sampah: Organik, Anorganik, dan B3.
  Maksimal tiga kali salah. Teliti ya!"
```

**Briefing Misi C4**
```
[NAYA]: "25 objek, tiga kategori. B3 tidak boleh dicampur apapun.
  Ingat: baterai, cat, dan bahan kimia = B3. Maksimal 3 kesalahan!"
```

**Dialog Khusus C4 — Salah Masukkan B3**
```
[NAYA]: "HATI-HATI! [nama objek] itu B3! Harus dibuang ke tempat
  sampah B3 khusus, bukan yang lain!"
```

---

### Chapter 5 — Final di Lapangan

**Panel Pembuka C5 (3 panel)**
```
Panel 1:
[KACAUMAN]: "Ini pertempuran terakhir! Aku tidak akan kalah!
  Lapangan ini milikku!"
(Kacauman muncul besar di tengah lapangan, dikelilingi tumpukan sampah)

Panel 2:
[RAKA]: "Guardian, ini misi final. Tiga fase — organik dulu,
  lalu anorganik, terakhir B3. Jangan sampai gagal!"

Panel 3:
[NAYA]: "Ini semua yang sudah kamu pelajari. Kamu bisa!
  Eco Guardians percaya padamu!"
```

**Briefing Misi C5**
```
[BIMO]: "36 objek, 3 fase. Tiap fase 12 objek. Target akurasi 80%.
  Waktu 120 detik. Ini saat menentukan, Guardian!"
```

**Panel Menang Final (3 panel)**
```
Panel 1:
[KACAUMAN]: "Ti... tidak mungkin! Semua sampah terpilah?!"
(Kacauman mengecil, tercebur ke tempat sampah B3)

Panel 2:
[RAKA, NAYA, BIMO bersama]: "SEKOLAH HIJAU BERHASIL!"
(Semua karakter merayakan di lapangan yang bersih)

Panel 3:
[NAYA]: "Ingat ya — memilah sampah bukan hanya untuk game.
  Lakukan juga di kehidupan nyata!"
(Fade ke layar akhir dengan lencana 'Sekolah Diselamatkan')
```

---

## BAGIAN C — Wireframe UI

### C.1 HUD Gameplay
![HUD Gameplay Wireframe](C:\Users\RIZKI MULYADI\.gemini\antigravity\brain\1c7e5b97-f73a-4183-8f86-c5b21010c240\hud_wireframe_1790870525046.jpg)

**Keterangan elemen HUD:**
| Posisi | Elemen | Data |
|---|---|---|
| Atas kiri | Skor + Badge Combo | `score`, `comboMultiplier` |
| Atas tengah | Timer circular | `timeRemaining` (detik) |
| Atas kanan | Nyawa (❤️) + Bar Kebersihan | `lives`, `cleanliness%` |
| Bawah tengah | Hint text (opsional) | Muncul 3 detik saat objek dihover |
| Bawah | 3 Tempat sampah 3D | Fixed position di scene |

---

### C.2 Layar Hasil Misi
![Result Screen Wireframe](C:\Users\RIZKI MULYADI\.gemini\antigravity\brain\1c7e5b97-f73a-4183-8f86-c5b21010c240\result_wireframe_1790870569040.jpg)

**Urutan tampil (animasi bertahap):**
1. Peringkat muncul (scale-in, 0.5 detik)
2. Statistik muncul satu per satu (0.3 detik per baris)
3. Lencana unlock (jika ada) slide-in dari bawah
4. Tiga tombol muncul (fade-in)

---

### C.3 Peta Chapter
![Chapter Map Wireframe](C:\Users\RIZKI MULYADI\.gemini\antigravity\brain\1c7e5b97-f73a-4183-8f86-c5b21010c240\map_wireframe_1790870539304.jpg)

**Aturan unlock:**
- Chapter terkunci = ikon gembok abu-abu, tidak bisa diklik
- Chapter selesai = ikon centang hijau
- Chapter tersedia = ikon aktif, bisa diklik
- Popup info muncul saat node diklik (chapter name, best rank, best score, tombol MAINKAN)

---

### C.4 Menu Utama (Deskripsi — wireframe pending)
**Layout:**
```
[Logo Eco Guardians]
[MULAI MAIN]  ← tombol besar, primary
[Buku Pengetahuan] [Lencana] [Pengaturan]  ← tombol kecil, row
[v1.0 — Rizki Mulyadi]  ← footer
```
**Kondisi tombol MULAI MAIN:**
- Jika tidak ada progres tersimpan → langsung ke komik prolog
- Jika ada progres → langsung ke peta chapter

---

## BAGIAN D — Spesifikasi Gesture Hand Tracking

### D.1 Definisi Gesture

| Gesture | Definisi Teknis | Threshold Awal* |
|---|---|---|
| **Hover** | Ujung jari telunjuk berada di dalam bounding box objek 3D | radius 40px dari center objek (di screen space) |
| **Pinch** | Jarak ujung ibu jari dan telunjuk < threshold | < 0.05 (normalized landmark distance) |
| **Release** | Jarak ibu jari dan telunjuk > threshold (kembali terbuka) | > 0.10 (normalized) |
| **Drag** | Pinch aktif + posisi landmark bergerak | `handLandmark[8]` (telunjuk tip) sebagai kursor |

> *Semua nilai bertanda asterisk adalah **rancangan awal** yang wajib divalidasi lewat prototipe.

### D.2 State Machine Objek
```
IDLE
  │ tangan masuk radius hover
  ▼
HOVERED  ──── tangan keluar radius ────► IDLE
  │ pinch terdeteksi
  ▼
PICKED / DRAGGING
  │ release pinch di atas tempat sampah
  ▼
DROP → validasi kategori → CORRECT / INCORRECT → IDLE
  │ release pinch BUKAN di atas tempat sampah
  ▼
RELEASED_MISS → objek kembali ke posisi semula → IDLE
```

### D.3 Penanganan Edge Cases

| Situasi | Perilaku Sistem |
|---|---|
| Tangan keluar frame saat drag | Objek di-drop di posisi terakhir, jika di atas bin → validasi, jika tidak → `RELEASED_MISS` |
| Confidence score tangan < 0.7 | Ignore semua input (kursor tidak bergerak) |
| Dua tangan terdeteksi | Gunakan tangan dengan confidence lebih tinggi; ignore yang lain |
| Pinch terdeteksi tanpa hover | Ignore (tidak ada objek yang bisa dipicked) |
| Gerakan terlalu cepat (jitter) | Terapkan smoothing: posisi kursor = lerp(posisi_lama, posisi_baru, 0.3) |

### D.4 Smoothing & Responsivitas
```javascript
// Pseudo-code smoothing kursor
const LERP_FACTOR = 0.3; // nilai awal, divalidasi lewat prototipe
cursorPos.x = lerp(cursorPos.x, rawLandmarkX, LERP_FACTOR);
cursorPos.y = lerp(cursorPos.y, rawLandmarkY, LERP_FACTOR);
```
- Nilai `LERP_FACTOR` tinggi (0.7–1.0) = responsif tapi jitter
- Nilai rendah (0.1–0.3) = halus tapi terasa lambat
- **Target feel**: responsif dengan sedikit inertia, seperti drag mouse

### D.5 Tutorial Gesture (Chapter 1)
```
Langkah 1: "Arahkan telunjukmu ke objek" 
  → sistem menunggu hover, highlight objek berkedip
Langkah 2: "Jepit ibu jari dan telunjukmu (pinch)" 
  → sistem menunggu pinch, objek tidak bisa di-hover sebelum step ini selesai
Langkah 3: "Gerakkan tangan ke tempat sampah"
  → objek mengikuti tangan
Langkah 4: "Buka jarimu untuk melepas"
  → validasi drop
```
Tutorial selesai setelah 1 objek berhasil di-drop dengan benar.

---

## BAGIAN E — Spesifikasi Perangkat Minimum

### E.1 Hardware
| Komponen | Minimum | Direkomendasikan |
|---|---|---|
| **Prosesor** | Intel Core i3 Gen 8 / AMD Ryzen 3 3000 | Core i5 / Ryzen 5 |
| **RAM** | 4 GB | 8 GB |
| **GPU** | Integrated graphics (Intel UHD 620) | Dedicated GPU |
| **Webcam** | 720p @ 15fps | 720p @ 30fps |
| **Koneksi** | Tidak diperlukan saat runtime* | — |
| **Resolusi layar** | 1280×720 | 1920×1080 |

> *Aset dimuat saat pertama kali buka game; setelah loading selesai, tidak perlu internet.

### E.2 Software
| Komponen | Minimum | Keterangan |
|---|---|---|
| **Browser** | Google Chrome 110+ | Browser utama yang diuji |
| **Browser alternatif** | Firefox 115+, Edge 110+ | Perlu diverifikasi |
| **OS** | Windows 10 / macOS 11 / Ubuntu 20.04 | — |
| **JavaScript** | ES2020 (ES Modules) | Wajib |
| **WebGL** | WebGL 2.0 | Untuk Three.js |
| **WebRTC** | Wajib | Untuk akses webcam |
| **HTTPS** | **Wajib** | getUserMedia() butuh HTTPS |

### E.3 Target Performa
| Metrik | Target | Kondisi Kritis |
|---|---|---|
| FPS gameplay | ≥ 30 fps | < 20 fps = experience rusak |
| Waktu loading awal | < 10 detik | Pada koneksi 10 Mbps |
| Latensi kursor ke tangan | < 100 ms | > 200 ms = tidak bisa dimainkan |
| Loading per chapter | < 3 detik | Setelah aset utama cached |

---

## BAGIAN F — Schema Data Progres (localStorage)

### F.1 Struktur JSON
```json
{
  "version": "1.0",
  "lastPlayed": "2026-10-01T15:30:00Z",
  "chapters": {
    "1": {
      "unlocked": true,
      "completed": true,
      "bestScore": 2946,
      "bestRank": "A",
      "bestAccuracy": 91.7,
      "playCount": 3
    },
    "2": { "unlocked": true,  "completed": false, "bestScore": 0, "bestRank": null, "bestAccuracy": 0, "playCount": 0 },
    "3": { "unlocked": false, "completed": false, "bestScore": 0, "bestRank": null, "bestAccuracy": 0, "playCount": 0 },
    "4": { "unlocked": false, "completed": false, "bestScore": 0, "bestRank": null, "bestAccuracy": 0, "playCount": 0 },
    "5": { "unlocked": false, "completed": false, "bestScore": 0, "bestRank": null, "bestAccuracy": 0, "playCount": 0 }
  },
  "badges": {
    "badge_chapter1_complete": true,
    "badge_combo_master": false,
    "badge_perfect_sort": false,
    "badge_b3_expert": false,
    "badge_all_complete": false
  },
  "settings": {
    "sfxVolume": 0.8,
    "musicVolume": 0.6,
    "showHints": true
  }
}
```

### F.2 Aturan Simpan / Muat
- Data disimpan ke `localStorage` dengan key: `eco_guardians_save`
- Data disimpan **setiap kali misi selesai** (bukan per objek)
- Skor terbaik hanya diperbarui jika `skor_baru > bestScore`
- Peringkat diperbarui hanya jika peringkat baru lebih baik dari yang tersimpan
- Reset progres: hapus key `eco_guardians_save` setelah konfirmasi user

---

## BAGIAN G — Prioritas Audio

### G.1 Prioritas Wajib (Blocking)
Audio ini **harus ada** sebelum uji pengguna:

| ID | Event | Format |
|---|---|---|
| `sfx_sort_correct` | Objek benar di-drop | MP3 |
| `sfx_sort_wrong` | Objek salah di-drop | MP3 |
| `sfx_combo` | Combo dimulai / naik level | MP3 |
| `sfx_mission_complete` | Misi berhasil | MP3 |
| `sfx_game_over` | Nyawa habis | MP3 |
| `music_menu` | Menu utama (loop) | MP3 |
| `music_gameplay` | Saat misi berjalan (loop) | MP3 |

### G.2 Prioritas Opsional (Non-blocking)
Audio ini bisa ditambahkan setelah core selesai:

| ID | Event |
|---|---|
| `sfx_pinch` | Saat pinch gesture terdeteksi |
| `sfx_hover` | Saat tangan hover di atas objek |
| `sfx_powerup` | Power-up aktif |
| `sfx_badge_unlock` | Lencana baru terbuka |
| `music_chapter_[1-5]` | Musik unik per chapter |
| `sfx_timer_warning` | Saat waktu < 10 detik |

### G.3 Fallback Audio
```
Jika audio gagal load:
- Game tetap berjalan normal
- Feedback visual (warna, animasi) menggantikan audio
- Log error ke console, tidak ditampilkan ke user
```

---

## Ringkasan Parameter yang Wajib Dikunci Lewat Prototipe

| Parameter | Nilai Awal Dokumen | Cara Validasi |
|---|---|---|
| Threshold pinch | < 0.05 normalized | Uji 5+ orang, catat false positive/negative |
| Smoothing factor kursor | 0.3 | Uji subjektif: feels responsive vs sluggish? |
| Radius hover objek | 40px screen space | Apakah mudah select atau terlalu sensitif? |
| FPS minimum playable | 20 fps | Uji di perangkat target terendah |
| Jumlah objek per chapter | C1:12, C2:20... | Apakah cukup menantang tapi tidak overwhelm? |
| Durasi per chapter | 90s, 75s... | Apakah cukup waktu untuk skill pemain baru? |

> Setelah prototipe diuji, **update nilai-nilai ini** dan ganti status dari "rancangan awal" menjadi "tervalidasi".

---

*Dokumen ini merupakan suplemen GDD v1.0 dan harus dibaca bersama dokumen utama.*
