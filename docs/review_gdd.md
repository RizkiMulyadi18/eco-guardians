# 📋 Review GDD — *Eco Guardians: Misi Rahasia Sekolah Hijau*

**Reviewer:** Antigravity AI  
**Versi GDD:** 1.0 (Final acuan desain)  
**Tanggal Review:** 1 Oktober 2026

---

## 🟢 Kekuatan GDD

### 1. Kelengkapan & Struktur Dokumen
GDD ini sangat lengkap untuk skala skripsi. 16 bab mencakup semua aspek penting:
identitas, target pemain, cerita, chapter, gameplay, teknis, pengujian, aset, hingga milestone.
Ini jauh melampaui standar GDD minimal dan menunjukkan pemikiran yang sangat terstruktur.

### 2. Kejelasan Scope & Batasan
Batasan versi skripsi dijelaskan **secara eksplisit dan tegas** (Seksi 1.6):
- Single-player, browser PC/laptop, satu tangan, gesture pinch
- Tidak ada multiplayer, akun, database online
- Kamera hanya untuk tracking tangan, bukan pengenalan sampah nyata

Ini adalah praktik GDD yang baik — menghindari scope creep.

### 3. Integrasi Hand Tracking yang Kreatif
Menggunakan **MediaPipe Hands** dengan gesture pinch untuk interaksi sorting 3D adalah pilihan yang inovatif
dan relevan untuk konteks edukasi. Flowchart pemilahan (`IDLE → HOVERED → PINCH → DRAGGING → DROP → CORRECT/INCORRECT`)
sudah jelas dan bisa langsung diimplementasikan.

### 4. Materi Edukasi Terintegrasi dengan Gameplay
Pemilahan organik/anorganik/B3 bukan sekadar "tempel label" — ia terintegrasi ke skor, combo, nyawa,
indikator kebersihan, dan lencana. Ini membuat edukasi terasa organik dalam permainan.

### 5. Evaluasi yang Komprehensif
Tiga metode evaluasi digunakan: **Black-box testing + SUS + UEQ**.
Tiap metode punya tujuan yang berbeda dan saling melengkapi. Ini sangat tepat untuk skripsi
bidang pendidikan/informatika.

### 6. Prioritas Fitur Jelas (MoSCoW-style)
Seksi 15.4 membagi fitur menjadi: Wajib / Dianjurkan / Dapat dikurangi.
Ini membantu developer (kamu sendiri) tetap fokus pada MVP tanpa kehilangan visi besar.

### 7. Analisis Risiko
Seksi 15.5 mencantumkan 7 risiko utama beserta penanganannya. Jarang ada GDD skripsi yang sampai
ke tahap ini — poin plus untuk kematangan perencanaan.

---

## 🟡 Area yang Perlu Diperkuat

### 1. Parameter Teknis Masih Bersifat Estimasi
Beberapa parameter masih ditandai "rancangan awal":
- Threshold pinch
- Smoothing kursor
- Jumlah responden SUS/UEQ
- Skor/penalti final

> [!IMPORTANT]
> Sebelum mulai coding, parameter-parameter di **Checklist 16.3** harus dikunci lewat prototipe cepat.
> Terutama **threshold pinch** — ini kritis karena memengaruhi seluruh feel gameplay.

### 2. Jumlah Panel Komik Ambisius
~47 panel komik adalah jumlah yang **besar** untuk dikerjakan sendiri.
Seksi 14.2 sendiri sudah mengakui ini bisa dikurangi "sesuai waktu" — tapi tidak ada angka minimumnya.

> [!WARNING]
> Tentukan jumlah minimum panel yang tetap menyampaikan narasi sebelum produksi dimulai.
> Misal: cukup panel pembuka + penutup tiap chapter (12 panel minimum).

### 3. Mekanisme Combo Belum Didefinisikan Detail
Combo disebut di banyak tempat (skor, C2, HUD), tapi tidak ada formula yang jelas:
- Berapa objek untuk memulai combo?
- Apakah salah 1 langsung reset atau ada grace period?
- Multiplier: ×2, ×3, dst. sampai berapa?

### 4. Indikator Kebersihan Kurang Dijelaskan
Chapter 3 punya kondisi "menjaga kebersihan minimal 40%", tapi rumus kebersihan belum dijabarkan.
Apakah ini `(objek benar / total objek) × 100`? Atau ada faktor waktu/nyawa?

### 5. Storyboard & Dialog (Bab 9) Tidak Terlihat dalam Output
Bab 9 "Storyboard dan Dialog" ada di daftar isi tapi kontennya tidak tampak detail dalam dokumen.
Ini bisa jadi karena masih kosong atau hanya placeholder — perlu dipastikan sebelum produksi aset komik.

### 6. Tidak Ada Wireframe / Mockup UI
GDD mendeskripsikan UI dengan detail (HUD, kartu, panel, lencana), tapi tidak ada wireframe visual.
Untuk implementasi, setidaknya perlu **sketsa kasar** layout tiap screen utama.

---

## 🔴 Potensi Masalah Teknis

### 1. Performa MediaPipe di Browser
MediaPipe Hands berjalan di CPU/GPU browser — pada laptop kelas menengah bawah (target siswa SMP),
latensi tracking bisa tinggi. Ini perlu diuji **sangat awal** (bahkan sebelum Three.js scene dibangun).

> [!CAUTION]
> Jika FPS turun di bawah 20fps saat tracking aktif + Three.js render berjalan bersamaan,
> seluruh feel gameplay akan rusak. Buat benchmark performa di akhir MVP.

### 2. Webcam Permission & Compatibility
Beberapa browser sekolah mungkin memblokir akses kamera, atau berjalan di HTTP (bukan HTTPS).
MediaPipe Hands membutuhkan HTTPS untuk akses webcam di browser modern.

> [!IMPORTANT]
> Pastikan deployment menggunakan HTTPS. Sediakan fallback/instruksi jika kamera diblokir.

### 3. Satu Tangan vs. Posisi Kamera
Jika kamera laptop menghadap ke atas (posisi standar), tangan pemain mungkin sering keluar dari frame
saat menyeret objek ke sudut layar. Ini perlu divalidasi dengan uji coba postur pemain nyata.

---

## 📊 Penilaian Keseluruhan

| Aspek | Nilai | Catatan |
|---|---|---|
| Kelengkapan Dokumen | ⭐⭐⭐⭐⭐ | Sangat lengkap untuk skripsi |
| Kejelasan Scope | ⭐⭐⭐⭐⭐ | Batasan eksplisit dan realistis |
| Desain Gameplay | ⭐⭐⭐⭐☆ | Solid, tapi beberapa formula belum final |
| Kelayakan Teknis | ⭐⭐⭐⭐☆ | Perlu validasi performa awal |
| Narasi & Cerita | ⭐⭐⭐⭐☆ | Menarik, tapi panel komik ~47 berisiko terlalu berat |
| Rencana Produksi | ⭐⭐⭐⭐⭐ | 13 milestone + analisis risiko = sangat terencana |

---

## ✅ Rekomendasi Langkah Selanjutnya (Prioritas)

1. **[ ] Buat prototipe MediaPipe Hands** — Uji threshold pinch + performa sebelum apapun
2. **[ ] Kunci jumlah panel komik minimum** — Putuskan angka floor sebelum aset dibuat
3. **[ ] Definisikan formula combo & kebersihan** — Tulis rumus matematiknya secara eksplisit
4. **[ ] Buat wireframe kasar tiap screen** — Minimal sketsa tangan atau Figma low-fi
5. **[ ] Validasi HTTPS deployment** — Pastikan server dev & produksi pakai HTTPS
6. **[ ] Isi Bab 9 (Storyboard & Dialog)** — Jika belum, segera buat outline dialog tiap chapter

---

> [!NOTE]
> GDD ini secara keseluruhan adalah salah satu dokumen desain game skripsi yang paling terstruktur.
> Konsep hand tracking + edukasi sampah + narasi komik adalah kombinasi yang segar dan layak.
> Fokus utama sekarang: **validasi teknis dulu, baru eskalasi konten.**

