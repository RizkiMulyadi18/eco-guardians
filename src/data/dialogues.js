export const DIALOGUES = {
  chapter1: {
    intro: [
      {
        character: 'Raka',
        text: 'Hei, Guardian Baru! Selamat datang di Eco Guardians!',
        action: 'Raka melambaikan tangan di depan kelas yang berantakan.'
      },
      {
        character: 'Naya',
        text: 'Sampah di kelas ini sudah parah. Organik dan anorganik tercampur semua. Ini gawat!',
        action: 'Naya menunjuk tumpukan sampah: botol plastik, sisa makanan, kertas.'
      },
      {
        character: 'Bimo',
        text: 'Tenang! Lihat kameramu. Aku sudah sambungkan alat pelacak tangan ke sistemmu. Coba pinch — jepit ibu jari dan telunjukmu!',
        action: 'Bimo menunjuk webcam, muncul ikon tangan di pojok layar.'
      }
    ],
    briefing: {
      character: 'Raka',
      text: 'Tugasmu: pilah 12 sampah ke tempat yang benar. Organik = sisa makanan & daun. Anorganik = plastik, kertas, kaleng. Jangan sampai salah, ya!'
    },
    win: [
      {
        character: 'Raka',
        text: 'Kelas bersih! Satu area berhasil, empat lagi menunggu!'
      },
      {
        character: 'Naya',
        text: 'Sekolah kita bisa menang kompetisi ini. Lanjutkan ke Kantin!'
      }
    ],
    fail: [
      {
        character: 'Kacauman',
        text: 'Ha ha ha! Masih banyak sampah yang belum kamu pilah!'
      },
      {
        character: 'Bimo',
        text: 'Jangan nyerah! Latih lagi kontrol pinch-mu. Pasti bisa!'
      }
    ]
  },

  chapter2: {
    intro: [
      {
        character: 'Kacauman',
        text: 'Sekarang giliranku di kantin! Muahahaha!',
        action: 'Kacauman melempar tumpukan sisa makanan dan kemasan ke kantin.'
      },
      {
        character: 'Naya',
        text: 'Waduh! Sisa nasi, kulit buah, bungkus plastik, kaleng minuman... semuanya bercampur!'
      },
      {
        character: 'Raka',
        text: 'Kita harus cepat! Kali ini lebih banyak sampah dan kamu harus jaga combo terus. Siap?'
      }
    ],
    briefing: {
      character: 'Bimo',
      text: 'Target: pilah 20 objek. Tapi ada tantangan — kamu harus capai combo x5 minimal sekali. Semakin lama combomu, semakin besar skormu!'
    },
    win: [
      {
        character: 'Raka',
        text: 'Kantin berhasil diamankan! Combo-mu luar biasa!'
      },
      {
        character: 'Naya',
        text: 'Tapi tunggu... air selokan membawa tumpukan sampah menuju ke Taman Sekolah!'
      }
    ],
    fail: [
      {
        character: 'Bimo',
        text: 'Ritme jarimu terputus. Jaga ritme combo dan jangan panik!'
      }
    ]
  },

  chapter3: {
    intro: [
      {
        character: 'Naya',
        text: 'Taman sekolah kita... daunnya layu, tanahnya kotor. Sampah organik dan plastik yang tercampur merusak ekosistem tanah!',
        action: 'Naya memeriksa tanaman yang mulai layu tertutup plastik.'
      },
      {
        character: 'Bimo',
        text: 'Ada indikator kebersihan sekarang. Kamu harus jaga kebersihannya di atas 40%. Kalau turun terus, taman makin rusak!'
      },
      {
        character: 'Raka',
        text: 'Pilah dengan teliti. Satu kesalahan bisa memengaruhi seluruh taman!'
      }
    ],
    briefing: {
      character: 'Naya',
      text: '24 objek, campuran organik dan anorganik. Jaga indikator kebersihan minimal 40% ya. Taman ini bergantung padamu!'
    },
    win: [
      {
        character: 'Naya',
        text: 'Taman mulai pulih dan bunga kembali mekar!'
      },
      {
        character: 'Bimo',
        text: 'Gawat! Sensor mendeteksi sinyal bahaya ekstrem dari Laboratorium Kimia!'
      }
    ],
    fail: [
      {
        character: 'Naya',
        text: 'Tingkat kebersihan taman terlalu rendah... Ayo coba lagi demi tanaman kita!'
      }
    ]
  },

  chapter4: {
    intro: [
      {
        character: 'Bimo',
        text: 'Guardian! Laboratorium darurat! Ada baterai bekas, wadah zat kimia, dan cairan pembersih tercampur sampah biasa!',
        action: 'Sirene laboratorium berkedip merah.'
      },
      {
        character: 'Naya',
        text: 'Ini sampah B3 — Bahan Berbahaya dan Beracun! Kalau salah buang, bisa meracuni air tanah sekolah!'
      },
      {
        character: 'Bimo',
        text: 'Sekarang ada tiga tempat sampah: Organik, Anorganik, dan B3 (Merah). Maksimal 3 kali salah. Teliti!'
      }
    ],
    briefing: {
      character: 'Naya',
      text: '25 objek, tiga kategori. B3 tidak boleh salah penanganan. Ingat: baterai, bohlam, zat kimia = B3 Merah. Maksimal 3 kesalahan total!'
    },
    win: [
      {
        character: 'Bimo',
        text: 'Zat berbahaya berhasil dinetralkan ke wadah khusus!'
      },
      {
        character: 'Raka',
        text: 'Kacauman kabur dan memusatkan seluruh sisa sampah di Lapangan Utama!'
      }
    ],
    fail: [
      {
        character: 'Naya',
        text: 'Terlalu banyak zat B3 yang salah tempat! Ingat simbol peringatan merah!'
      }
    ]
  },

  chapter5: {
    intro: [
      {
        character: 'Kacauman',
        text: 'Ini pertempuran terakhir! Aku tidak akan kalah! Lapangan ini milikku dan semua sampah akan bersatu!',
        action: 'Kacauman berdiri di atas monster tumpukan sampah raksasa.'
      },
      {
        character: 'Raka',
        text: 'Guardian, ini misi final. Tiga fase berurutan: organik dulu, lalu anorganik, terakhir B3. Jangan sampai lengah!'
      },
      {
        character: 'Naya',
        text: 'Gunakan semua pengetahuan yang sudah kamu pelajari. Eco Guardians percaya padamu!'
      }
    ],
    briefing: {
      character: 'Bimo',
      text: '36 objek dalam 3 fase (masing-masing 12 objek). Target akurasi minimal 80%. Waktu 120 detik. Ini penentuannya!'
    },
    win: [
      {
        character: 'Kacauman',
        text: 'Ti... tidak mungkin! Semua sampah terpilah dengan rapi?! Tenagaku... lenyap!'
      },
      {
        character: 'Raka & Naya & Bimo',
        text: 'SEKOLAH HIJAU BERHASIL DISELAMATKAN! KITA JUARA!'
      },
      {
        character: 'Naya',
        text: 'Ingat kawan-kawan: memilah sampah bukan hanya dalam game, tapi terapkan juga setiap hari di dunia nyata!'
      }
    ],
    fail: [
      {
        character: 'Raka',
        text: 'Sedikit lagi! Kacauman hampir tumbang. Satukan fokus dan coba lagi!'
      }
    ]
  }
};
