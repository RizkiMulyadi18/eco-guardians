import { TRASH_CATEGORIES } from '../utils/constants.js';

export const BINS = [
  {
    id: 'bin_organic',
    name: 'Organik',
    category: TRASH_CATEGORIES.ORGANIC,
    color: '#4CAF50',
    colorHex: 0x4CAF50,
    icon: '/assets/icons/organic.svg',
    model: '/assets/models/bins/bin_organic.glb',
    description: 'Sisa makanan, daun, bahan alami mudah membusuk'
  },
  {
    id: 'bin_inorganic',
    name: 'Anorganik',
    category: TRASH_CATEGORIES.INORGANIC,
    color: '#FFB300', // Kuning/oranye
    colorHex: 0xFFB300,
    icon: '/assets/icons/inorganic.svg',
    model: '/assets/models/bins/bin_inorganic.glb',
    description: 'Plastik, kaleng, kertas, kardus, kemasan'
  },
  {
    id: 'bin_b3',
    name: 'B3 (Bahaya)',
    category: TRASH_CATEGORIES.B3,
    color: '#E53935', // Merah
    colorHex: 0xE53935,
    icon: '/assets/icons/b3.svg',
    model: '/assets/models/bins/bin_b3.glb',
    description: 'Baterai, lampu bekas, bahan kimia, elektronik rusak'
  }
];
