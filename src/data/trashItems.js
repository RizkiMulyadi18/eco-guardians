import { TRASH_CATEGORIES } from '../utils/constants.js';

export const TRASH_ITEMS = [
  // ORGANIK
  {
    id: 'banana_peel',
    name: 'Kulit Pisang',
    category: TRASH_CATEGORIES.ORGANIC,
    model: '/assets/models/trash/banana_peel.glb',
    color: '#FFEB3B',
    shape: 'cylinder',
    locations: ['classroom', 'cafeteria', 'garden', 'field'],
    explanation: 'Kulit pisang adalah sampah organik basah yang mudah terurai dan dapat diolah menjadi kompos.',
    bookEntry: true
  },
  {
    id: 'apple_core',
    name: 'Sisa Apel',
    category: TRASH_CATEGORIES.ORGANIC,
    model: '/assets/models/trash/apple_core.glb',
    color: '#E91E63',
    shape: 'sphere',
    locations: ['classroom', 'cafeteria', 'garden'],
    explanation: 'Sisa buah adalah bahan organik alami yang mudah membusuk jika dipisahkan dari anorganik.',
    bookEntry: true
  },
  {
    id: 'dry_leaf',
    name: 'Daun Kering',
    category: TRASH_CATEGORIES.ORGANIC,
    model: '/assets/models/trash/dry_leaf.glb',
    color: '#8D6E63',
    shape: 'box',
    locations: ['garden', 'field'],
    explanation: 'Daun kering kaya akan karbon dan sangat bermanfaat untuk menyuburkan tanah.',
    bookEntry: true
  },
  {
    id: 'leftover_rice',
    name: 'Sisa Nasi',
    category: TRASH_CATEGORIES.ORGANIC,
    model: '/assets/models/trash/leftover_rice.glb',
    color: '#F5F5F5',
    shape: 'sphere',
    locations: ['classroom', 'cafeteria'],
    explanation: 'Sisa makanan cepat membusuk dan menimbulkan bau jika bercampur dengan plastik.',
    bookEntry: true
  },

  // ANORGANIK
  {
    id: 'plastic_bottle',
    name: 'Botol Plastik',
    category: TRASH_CATEGORIES.INORGANIC,
    model: '/assets/models/trash/plastic_bottle.glb',
    color: '#03A9F4',
    shape: 'cylinder',
    locations: ['classroom', 'cafeteria', 'garden', 'field'],
    explanation: 'Botol plastik PET membutuhkan ratusan tahun untuk terurai. Masukkan ke tempat anorganik untuk didaur ulang.',
    bookEntry: true
  },
  {
    id: 'soda_can',
    name: 'Kaleng Minuman',
    category: TRASH_CATEGORIES.INORGANIC,
    model: '/assets/models/trash/soda_can.glb',
    color: '#9E9E9E',
    shape: 'cylinder',
    locations: ['cafeteria', 'field', 'classroom'],
    explanation: 'Kaleng aluminium dapat didaur ulang tanpa batas waktu tanpa kehilangan kualitas.',
    bookEntry: true
  },
  {
    id: 'snack_wrapper',
    name: 'Bungkus Makanan Ringan',
    category: TRASH_CATEGORIES.INORGANIC,
    model: '/assets/models/trash/snack_wrapper.glb',
    color: '#FF9800',
    shape: 'box',
    locations: ['classroom', 'cafeteria', 'garden', 'field'],
    explanation: 'Kemasan plastik berlapis foil sulit terurai dan harus dipilah agar tidak mencemari lingkungan.',
    bookEntry: true
  },
  {
    id: 'crumpled_paper',
    name: 'Kertas Bekas',
    category: TRASH_CATEGORIES.INORGANIC,
    model: '/assets/models/trash/crumpled_paper.glb',
    color: '#ECEFF1',
    shape: 'sphere',
    locations: ['classroom', 'laboratory'],
    explanation: 'Kertas kering dapat didaur ulang menjadi bubur kertas untuk buku atau kardus baru.',
    bookEntry: true
  },

  // B3 (Bahan Berbahaya dan Beracun)
  {
    id: 'battery',
    name: 'Baterai Bekas',
    category: TRASH_CATEGORIES.B3,
    model: '/assets/models/trash/battery.glb',
    color: '#D32F2F',
    shape: 'cylinder',
    locations: ['laboratory', 'classroom', 'field'],
    explanation: 'Baterai mengandung logam berat beracun (merkuri, timbal, kadmium) yang dapat meracuni air tanah jika bocor.',
    bookEntry: true
  },
  {
    id: 'broken_bulb',
    name: 'Lampu Bohlam Rusak',
    category: TRASH_CATEGORIES.B3,
    model: '/assets/models/trash/broken_bulb.glb',
    color: '#FFEB3B',
    shape: 'sphere',
    locations: ['laboratory', 'classroom'],
    explanation: 'Lampu neon atau bohlam mengandung uap raksa yang sangat berbahaya bagi sistem saraf jika pecah.',
    bookEntry: true
  },
  {
    id: 'chemical_bottle',
    name: 'Wadah Reagen Kimia',
    category: TRASH_CATEGORIES.B3,
    model: '/assets/models/trash/chemical_bottle.glb',
    color: '#7B1FA2',
    shape: 'cylinder',
    locations: ['laboratory'],
    explanation: 'Sisa bahan kimia korosif atau beracun memerlukan pengolahan khusus di fasilitas limbah B3.',
    bookEntry: true
  },
  {
    id: 'electronic_pcb',
    name: 'Komponen Elektronik',
    category: TRASH_CATEGORIES.B3,
    model: '/assets/models/trash/electronic_pcb.glb',
    color: '#388E3C',
    shape: 'box',
    locations: ['laboratory', 'field'],
    explanation: 'Papan sirkuit elektronik mengandung timah solder dan logam berat yang berbahaya bagi kesehatan.',
    bookEntry: true
  }
];
